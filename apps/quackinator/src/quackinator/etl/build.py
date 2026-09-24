"""Build the story index from MariaDB.

All joining happens here, in Python, against streamed flat tables. Runtime is
dominated by streaming inducks_entry (~2M rows) and inducks_appearance (~1.7M).
"""

from __future__ import annotations

import logging
import re
from collections import Counter, defaultdict
from collections.abc import Callable, Hashable, Iterable, Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal, TypeVar
from urllib.parse import urlparse

import numpy as np
import pymysql
import scipy.sparse as sp

from quackinator.config import Settings, settings
from quackinator.etl import plot as plotlib
from quackinator.etl import sql
from quackinator.etl.extract import connect, stream, to_int
from quackinator.index.model import PAGE_SCALE, UNKNOWN, StoryIndex

log = logging.getLogger(__name__)

# Decades outside this range are data errors, not history. Inducks' oldest
# indexed Disney comics are 1930s; anything dated in the future is a typo.
MIN_DECADE, MAX_DECADE = 1930, 2030

# Inducks uses these codes as markers, not as characters. '--' is "no
# identifiable characters" and carries 31k appearances under the English
# preferred name "No one" — which the engine will cheerfully turn into
# "Does No one appear in the story?" if it is left in.
PLACEHOLDER_CHARACTERS = frozenset({"--", "-", "?", "!", "$", ""})

# No *full-page* comic story is two panels long. Inducks derives
# `estimatedpanels`, so a storyversion with no recorded length yields a tiny
# number rather than a null, and that number then reads as a confident
# measurement. Below a page the same small numbers are honest — a quarter-page
# strip really is two or three panels — so this is a floor on whole-page rows
# only; see where it is applied in `build`.
MIN_CREDIBLE_PANELS = 3

# Inducks writes the documented default of two panels per tier into
# `columnsperpage` whenever the indexer did not record one — the `pagel` letter
# that carries it is explicitly "not mandatory" — and an indexer who *was* exact
# about two writes the same value, so a recorded 2 cannot be told from a blank.
# It sits on 88% of comic storyversions. `rowsperpage` needs no such treatment:
# the tier count is written whenever the layout is recorded at all, and its
# distribution is what real comics look like.
DEFAULTED_COLUMNS_PER_PAGE = 2

# Appearance comments meaning "the reader will not see this character". Inducks
# records a cameo, a photo on a wall, a statue or a dream as a full appearance —
# correctly, since it answers "is this character in the story". Ours is the
# narrower question of whether the reader would notice, so these cells are
# listed but are not evidence the reader can be asked to confirm. Matched as
# whole words: `BB(12;cameo)` arrives as "12;cameo".
UNSEEN_APPEARANCE = re.compile(
    r"\b(cameo|photo|picture|statue|portrait|painting|silhouette|logo|thought"
    r"|dream|flashback|head)\b",
    re.IGNORECASE,
)


def layout_column(values: list[int | None], keep: np.ndarray, floor: int = 1) -> np.ndarray:
    """Project a layout column onto the kept rows, sentinels folded into UNKNOWN.

    Inducks stores "not recorded" as 0 in the layout columns rather than NULL,
    and `estimatedpanels` is derived from the others, so a storyversion with no
    page count arrives with a panel count of 1: `fr/MMFG 5p267b` is 0 pages,
    4 rows, 2 columns, 1 panel. Taken at face value that is a confident answer
    of "up to 4 panels" — asserted by 22% of the index, and enough on its own to
    bury the correct story when the reader answers "more than 80".
    """
    out = np.full(len(keep), UNKNOWN, dtype=np.int16)
    for out_i, i in enumerate(keep):
        v = values[i]
        if v is not None and floor <= v < 32767:
            out[out_i] = v
    return out


def page_length_tenths(
    entire: int | None,
    numerator: int | None,
    denominator: int | None,
    unspecified: str | None,
) -> int:
    """Total story length in tenths of a page, or UNKNOWN.

    Whole pages and the fractional remainder are two halves of one measurement
    and Inducks stores them apart. Most of the time the fraction *is* the whole
    measurement: 111,350 comic storyversions have `entirepages = 0` and a
    recorded fraction, because a quarter-page strip is a real and very common
    kind of Disney comic. Reading only `entirepages` recorded all of them as
    "length not known", which is 38% of the catalogue answering "don't know" to
    the second-most-informative question in the bank.

    `brokenpageunspecified = 'Y'` says there is a fraction of unrecorded size.
    Where that is the entire length (9,081 rows) the length is genuinely unknown
    and saying so is better than inventing a bucket for it; where it sits on top
    of whole pages the remainder is below the resolution of the scale anyway.
    """
    whole = entire if entire is not None and 0 <= entire < 32767 else 0
    fraction = 0
    if numerator and denominator and 0 < numerator <= denominator:
        fraction = round(PAGE_SCALE * numerator / denominator)
    elif unspecified == "Y" and whole == 0:
        return UNKNOWN
    total = whole * PAGE_SCALE + fraction
    if total <= 0:
        return UNKNOWN
    return min(total, 32767)


# Country prefix of a scan filename. Inducks' scan-naming rules put the country
# first, underscore-separated, in a name that is otherwise lowercase ASCII:
# `us_wdc_608g_001.jpg`, `nl_dd1974_51g_001.jpg`. The directories above it vary
# by site (`webusers/webusers/2021/03/`, `renamed/us/wdc/0608/`, `us/wdc/0608/`)
# and are not the country, so only the filename is read.
SCAN_COUNTRY = re.compile(r"([a-z]{2})_")

# Sites holding shrunken copies of other sites' files rather than scans of their
# own: `thumbnails`, `thumbnails2` and `thumbnails3` are Outducks' own
# pre-resized derivatives of the same 832k images. Skipped, because one file
# wants one path — and because the picture on a guess is resized from the
# original by whatever serves `THUMBNAIL_BASE`, which is a job a CDN does better
# than a fixed set of three sizes.
DERIVATIVE_SCAN_SITES = "thumbnails"


def scan_country(url: str) -> str:
    """Which country's collection a scan path belongs to, "" if unreadable."""
    match = SCAN_COUNTRY.match(url.rsplit("/", 1)[-1])
    return match.group(1) if match else ""


def site_prefixes(sites: Iterable[tuple[str, str]]) -> dict[str, str]:
    """Site code -> where that site's tree sits under the root they all share.

    `inducks_entryurl.url` is relative to its *site*, and the sites overlap in
    confusing ways: the upload tree's files are `2021/03/x.jpg` under a base
    ending `/webusers/webusers/`, while Outducks' thumbnail sites address the
    same file as `webusers/2021/03/x.jpg`. A mirror copies the tree, not
    Inducks' table, so what a path has to be relative to is the root — one base
    for every scan, and no per-site knowledge left anywhere downstream.

    Derived from `urlbase` rather than hardcoded: every image site is a
    directory on one host, so the path after the host is the tree, whoever the
    host is. Sites in `DERIVATIVE_SCAN_SITES` are dropped.
    """
    prefixes = {}
    for sitecode, urlbase in sites:
        if not sitecode or not urlbase or sitecode.startswith(DERIVATIVE_SCAN_SITES):
            continue
        # Everything after the host, no leading slash: "https://x.org/us/" -> "us/".
        prefixes[sitecode] = urlparse(urlbase).path.lstrip("/")
    return prefixes


def pick_thumbnails(
    prefixes: Mapping[str, str],
    rows: Callable[[], Iterable[tuple[str, str, str]]],
) -> dict[str, str]:
    """One first-page scan per story, out of every scan of every printing of it.

    A story has one scan per scanned printing, all of them photographs of the
    same drawn page, and Inducks records nothing about a scan except where it
    is. So the pick is made on the collection the scan came from, ranked by how
    much of the catalogue that collection has scanned.

    Size is a weak proxy for quality, but both alternatives are worse. Taking
    the first path alphabetically hands most of the shortlist to `ar` and `au` —
    the smallest collections, and in the Arabic editions' case right-to-left
    reprints whose pages are *mirrored*, which misrepresents the drawing the
    reader is holding. Taking one at random reshuffles every picture on every
    rebuild, which reads as a bug.

    Returns paths relative to the root the sites share, so one base URL
    addresses every one of them; `prefixes` is what makes them relative to it,
    and a row on a site it does not name is skipped.

    `rows` is called twice — once to rank the collections, once to pick — rather
    than taken as a sequence, because in the build it is 830k rows off a cursor
    and there is no reason to hold them. Ties inside one collection keep the
    first row, so the pick is stable for as long as the query's order is.
    """
    per_country: Counter[str] = Counter()
    unreadable = 0
    for storycode, sitecode, url in rows():
        if not storycode or not url or sitecode not in prefixes:
            continue
        country = scan_country(url)
        if country:
            per_country[country] += 1
        else:
            # Deliberately not counted as a collection of its own: ranked by
            # size it would beat a real one on a tie, and "somewhere" is not a
            # collection. It falls to `len(rank)` below instead, behind all of
            # them.
            unreadable += 1
    # Most-scanned collection first.
    rank = {country: r for r, (country, _) in enumerate(per_country.most_common())}
    log.info(
        "  %d scans across %d collections, %d with no readable country",
        sum(per_country.values()) + unreadable,
        len(rank),
        unreadable,
    )

    picked: dict[str, str] = {}
    picked_rank: dict[str, int] = {}
    for storycode, sitecode, url in rows():
        if not storycode or not url or sitecode not in prefixes:
            continue
        country_rank = rank.get(scan_country(url), len(rank))
        if country_rank < picked_rank.get(storycode, len(rank) + 1):
            picked[storycode] = prefixes[sitecode] + url
            picked_rank[storycode] = country_rank
    return picked


Code = TypeVar("Code", bound=Hashable)


def set_matrix(
    values_by_row: Mapping[int, set[Code]],
    keep_ids: list[int],
    *,
    order: Literal["prevalence", "natural"] = "prevalence",
) -> tuple[sp.csr_matrix, list[Code]]:
    """Set-valued rows -> a boolean (kept rows x codes) matrix and its columns.

    Languages, printing decades and creators are all the same shape: a row
    belongs to *every* code its printings carry, not to the most frequent one. A
    quarter of all storyversions carry more than one language and 13% have no
    majority at all, so collapsing to `most_common(1)` would lose three quarters
    of a million printings' languages and break ties by dict insertion order.
    Popular stories are reprinted for fifty years, so decades are worse still.

    `prevalence` orders columns by how many kept rows carry them, most first, so
    a shortlist shown to a reader is stable across a session and reliably
    contains their answer — and so the creator search box ranks a prolific
    creator above a namesake with one credit. Ordering by current belief mass
    instead pushed French, the 7th biggest language in Inducks, off the list
    entirely. `natural` sorts the codes themselves, for decades: a reader scans
    a list of dates in date order.
    """
    prevalence: Counter[Code] = Counter()
    for i in keep_ids:
        # One per row, matching the boolean matrix — Counter.update() would add
        # the per-code *printing* counts instead.
        for code in values_by_row.get(i, ()):
            prevalence[code] += 1
    if order == "prevalence":
        codes = sorted(prevalence, key=lambda c: (-prevalence[c], c))  # type: ignore[arg-type]
    else:
        codes = sorted(prevalence)  # type: ignore[type-var]
    column_of = {code: k for k, code in enumerate(codes)}

    rows: list[int] = []
    cols: list[int] = []
    for out_i, i in enumerate(keep_ids):
        for code in values_by_row.get(i, ()):
            rows.append(out_i)
            cols.append(column_of[code])
    matrix = sp.csr_matrix(
        (np.ones(len(rows), dtype=np.int8), (rows, cols)),
        shape=(len(keep_ids), max(len(codes), 1)),
    )
    return matrix, codes


def boolean_matrix(rows: list[int], cols: list[int], shape: tuple[int, int]) -> sp.csr_matrix:
    """COO triplets -> a CSR matrix of 1s, duplicate cells collapsed."""
    matrix = sp.csr_matrix((np.ones(len(rows), dtype=np.int8), (rows, cols)), shape=shape)
    matrix.sum_duplicates()
    matrix.data[:] = 1
    return matrix


@dataclass
class Raw:
    """Everything the ETL reads out of MariaDB, before any index is assembled.

    The split is the point: `extract` needs a database and nothing else, and
    `assemble` needs this and nothing else — which is what makes the cleaning
    rules testable without a MariaDB to hand. Rows are identified by their
    position in `sv_codes` throughout.
    """

    # --- per storyversion, parallel to sv_codes ---
    sv_codes: list[str] = field(default_factory=list)
    sv_story: list[str] = field(default_factory=list)
    sv_length: list[int] = field(default_factory=list)
    sv_rows: list[int | None] = field(default_factory=list)
    sv_cols: list[int | None] = field(default_factory=list)
    sv_panels: list[int | None] = field(default_factory=list)
    popularity: np.ndarray = field(default_factory=lambda: np.zeros(0, dtype=np.int32))

    # --- set-valued per storyversion row ---
    languages_of: dict[int, set[str]] = field(default_factory=dict)
    decades_of: dict[int, set[int]] = field(default_factory=dict)
    creators_of: dict[int, set[str]] = field(default_factory=dict)

    # --- character appearances, as COO triplets into char_pos ---
    char_pos: dict[str, int] = field(default_factory=dict)
    app_rows: list[int] = field(default_factory=list)
    app_cols: list[int] = field(default_factory=list)
    weak_rows: list[int] = field(default_factory=list)
    weak_cols: list[int] = field(default_factory=list)
    hero_by_story: dict[str, set[str]] = field(default_factory=dict)

    # --- catalogs ---
    char_names_raw: dict[str, str] = field(default_factory=dict)
    preferred_char_names: dict[str, str] = field(default_factory=dict)
    onetime_chars: set[str] = field(default_factory=set)
    story_title: dict[str, str] = field(default_factory=dict)
    story_year: dict[str, int | None] = field(default_factory=dict)
    # Path of one scan of the story's first page, per story. Path only: the site
    # it hangs off is `Settings.thumbnail_base`, and it is not the ETL's business
    # which mirror serves it. Absent for a story nobody has scanned.
    story_thumb: dict[str, str] = field(default_factory=dict)
    original_sv: dict[str, str] = field(default_factory=dict)
    language_name: dict[str, str] = field(default_factory=dict)
    person_name: dict[str, str] = field(default_factory=dict)
    person_aliases: dict[str, set[str]] = field(default_factory=dict)

    # --- plot text ---
    keywords: dict[str, str] = field(default_factory=dict)
    desc_by_sv: dict[str, str] = field(default_factory=dict)


def extract(conn: pymysql.Connection, cfg: Settings) -> Raw:
    """Stream every table the index needs. No cleaning beyond dropping junk rows.

    Runtime is dominated by inducks_entry (~2M rows) and inducks_appearance
    (~1.7M), both streamed rather than fetched.
    """
    raw = Raw()

    log.info("streaming comic storyversions")
    for svc, sc, pages, rr, cc, pn, kw, bnum, bden, bunspec in stream(conn, sql.STORYVERSIONS):
        if not svc or not sc:
            continue
        raw.sv_codes.append(svc)
        raw.sv_story.append(sc)
        raw.sv_length.append(page_length_tenths(to_int(pages), to_int(bnum), to_int(bden), bunspec))
        raw.sv_rows.append(to_int(rr))
        raw.sv_cols.append(to_int(cc))
        raw.sv_panels.append(to_int(pn))
        if kw:
            raw.keywords[svc] = kw
    log.info("  %d comic storyversions", len(raw.sv_codes))

    sv_pos = {code: i for i, code in enumerate(raw.sv_codes)}

    log.info("streaming issue dates")
    issue_decade: dict[str, int] = {}
    for issuecode, date in stream(conn, sql.ISSUE_DATES):
        if not issuecode or not date or len(date) < 4 or not date[:4].isdigit():
            continue
        decade = int(date[:4]) // 10 * 10
        if MIN_DECADE <= decade <= MAX_DECADE:
            issue_decade[issuecode] = decade
    log.info("  %d issues with a usable publication date", len(issue_decade))

    log.info("streaming entries (printings)")
    raw.popularity = np.zeros(len(raw.sv_codes), dtype=np.int32)
    languages_of: dict[int, set[str]] = defaultdict(set)
    decades_of: dict[int, set[int]] = defaultdict(set)
    for svc, lang, issuecode in stream(conn, sql.ENTRIES):
        i = sv_pos.get(svc)
        if i is None:
            continue
        raw.popularity[i] += 1
        if lang:
            languages_of[i].add(lang)
        decade = issue_decade.get(issuecode)
        if decade is not None:
            decades_of[i].add(decade)
    raw.languages_of = dict(languages_of)
    raw.decades_of = dict(decades_of)
    log.info(
        "  %d of %d storyversions actually printed",
        int((raw.popularity > 0).sum()),
        len(raw.sv_codes),
    )

    log.info("streaming appearances")
    for svc, ccode, comment in stream(conn, sql.APPEARANCES):
        i = sv_pos.get(svc)
        if i is None or ccode in PLACEHOLDER_CHARACTERS:
            continue
        j = raw.char_pos.setdefault(ccode, len(raw.char_pos))
        raw.app_rows.append(i)
        raw.app_cols.append(j)
        if comment and UNSEEN_APPEARANCE.search(comment):
            raw.weak_rows.append(i)
            raw.weak_cols.append(j)
    log.info("  %d appearances over %d characters", len(raw.app_rows), len(raw.char_pos))

    log.info("streaming story credits")
    # `isfake` is Inducks' own marker for a placeholder standing in for a
    # creator nobody has identified — '?', 'various', 'unknown / mickey 7'.
    # Exactly the trap PLACEHOLDER_CHARACTERS exists for, one table over:
    # left in, the search box offers the reader "various" as an author.
    fake_persons: set[str] = set()
    for code, fullname, isfake in stream(conn, sql.PERSONS):
        if not code:
            continue
        raw.person_name[code] = fullname or code
        if isfake == "Y":
            fake_persons.add(code)

    person_aliases: dict[str, set[str]] = defaultdict(set)
    for code, surname, givenname in stream(conn, sql.PERSON_ALIASES):
        if not code or code in fake_persons:
            continue
        alias = " ".join(part for part in (givenname, surname) if part).strip()
        if alias and alias != raw.person_name.get(code):
            person_aliases[code].add(alias)
    raw.person_aliases = dict(person_aliases)

    creators_of: dict[int, set[str]] = defaultdict(set)
    for svc, personcode in stream(conn, sql.STORY_JOBS):
        i = sv_pos.get(svc)
        if i is None or not personcode or personcode in fake_persons:
            continue
        creators_of[i].add(personcode)
    raw.creators_of = dict(creators_of)
    log.info("  %d storyversions with a named writer or artist", len(raw.creators_of))

    log.info("streaming hero characters")
    # Hero is recorded per story, not per storyversion. Folded into the same
    # character matrix in `assemble`: for the reader it is the same observation.
    hero_by_story: dict[str, set[str]] = defaultdict(set)
    for sc, ccode in stream(conn, sql.HEROES):
        if sc and ccode not in PLACEHOLDER_CHARACTERS:
            hero_by_story[sc].add(ccode)
    raw.hero_by_story = dict(hero_by_story)

    log.info("loading catalogs")
    for code, name, _official, onetime, _heroonly in stream(conn, sql.CHARACTERS):
        if not code:
            continue
        raw.char_names_raw[code] = name
        # One-time characters are explicitly optional for indexers — "not
        # mandatory (not even in the xapp field)" — so a cast list that omits
        # one is not asserting the character is absent from the story.
        if onetime == "Y":
            raw.onetime_chars.add(code)
    for code, lang, name, pref in stream(conn, sql.CHARACTER_NAMES):
        if lang == cfg.desc_language and pref == "Y" and code and name:
            raw.preferred_char_names[code] = name

    for sc, orig, title, fpd in stream(conn, sql.STORIES):
        if not sc:
            continue
        raw.story_title[sc] = title or ""
        raw.story_year[sc] = to_int((fpd or "")[:4])
        if orig:
            raw.original_sv[sc] = orig

    log.info("streaming first-page scans")
    prefixes = site_prefixes(stream(conn, sql.IMAGE_SITES))
    raw.story_thumb = pick_thumbnails(prefixes, lambda: stream(conn, sql.STORY_SCANS))
    log.info("  %d stories with a first-page scan", len(raw.story_thumb))

    raw.language_name = dict(stream(conn, sql.LANGUAGE_NAMES, (cfg.desc_language,)))

    log.info("streaming descriptions (%s)", cfg.desc_language)
    for svc, text in stream(conn, sql.DESCRIPTIONS, (cfg.desc_language,)):
        if svc and text:
            raw.desc_by_sv[svc] = text

    return raw


def character_matrices(raw: Raw) -> tuple[sp.csr_matrix, sp.csr_matrix]:
    """The full appearance matrix, and the subset of it the reader cannot check.

    Heroes fold in here rather than in `extract` because a hero is recorded per
    story and has to be expanded across that story's versions.
    """
    for i, sc in enumerate(raw.sv_story):
        for ccode in raw.hero_by_story.get(sc, ()):
            j = raw.char_pos.setdefault(ccode, len(raw.char_pos))
            raw.app_rows.append(i)
            raw.app_cols.append(j)

    shape = (len(raw.sv_codes), len(raw.char_pos))
    char = boolean_matrix(raw.app_rows, raw.app_cols, shape)

    weak = boolean_matrix(raw.weak_rows, raw.weak_cols, shape)
    onetime_cols = [raw.char_pos[c] for c in raw.onetime_chars if c in raw.char_pos]
    if onetime_cols:
        onetime_mask = np.zeros(len(raw.char_pos), dtype=np.int8)
        onetime_mask[onetime_cols] = 1
        weak = weak + char.multiply(onetime_mask)
    # Never mark a cell weak that the matrix does not carry: a hero fold is a
    # title logo, which is exactly the appearance a reader cannot miss.
    weak = sp.csr_matrix(sp.csr_matrix(weak).multiply(char))
    weak.data[:] = 1
    return char, weak


def plot_matrix(raw: Raw, cfg: Settings) -> tuple[sp.csr_matrix, list[str]]:
    """Plot term occurrences per storyversion, and the vocabulary behind them.

    Plot text is resolved at story level then propagated to reprints: a reprint
    carries no description of its own, and the plot is a property of the story.
    """
    log.info("building plot vocabulary")
    text_by_story: dict[str, str] = {}
    # Which stories got real prose in the description language, as opposed to the
    # keywordsummary fallback. Only these get a say in *which words become
    # questions*; both get to match against them.
    native_stories: set[str] = set()
    for sc, orig in raw.original_sv.items():
        text = raw.desc_by_sv.get(orig)
        if text:
            text_by_story[sc] = text
            native_stories.add(sc)
    # Fallback for the stories with no description in that language:
    # keywordsummary has far better coverage but is a multilingual concatenation.
    for i, sc in enumerate(raw.sv_story):
        if sc in text_by_story:
            continue
        kw = raw.keywords.get(raw.original_sv.get(sc, ""), "") or raw.keywords.get(raw.sv_codes[i])
        if kw:
            text_by_story[sc] = kw

    tokens_by_story = {sc: plotlib.tokenize(t) for sc, t in text_by_story.items()}
    vocab = plotlib.build_vocabulary(
        tokens_by_story.values(),
        n_docs=max(len(tokens_by_story), 1),
        min_df=cfg.plot_min_df,
        max_df_ratio=cfg.plot_max_df_ratio,
        size=cfg.plot_vocab_size,
        native_docs=(toks for sc, toks in tokens_by_story.items() if sc in native_stories),
        min_native_lift=cfg.plot_min_native_lift,
    )
    term_pos = {t: j for j, t in enumerate(vocab)}
    log.info(
        "  %d plot terms over %d described stories (%d with %s prose)",
        len(vocab),
        len(tokens_by_story),
        len(native_stories),
        cfg.desc_language,
    )

    rows: list[int] = []
    cols: list[int] = []
    for i, sc in enumerate(raw.sv_story):
        hit = [term_pos[t] for t in tokens_by_story.get(sc, ()) if t in term_pos]
        rows.extend([i] * len(hit))
        cols.extend(hit)
    shape = (len(raw.sv_codes), max(len(vocab), 1))
    return boolean_matrix(rows, cols, shape), vocab


def assemble(raw: Raw, cfg: Settings) -> StoryIndex:
    """Turn extracted tables into the index the engine runs against.

    Restricted to storyversions with at least one recorded printing: an unprinted
    one cannot be the thing in the reader's hands.
    """
    char_all, weak_all = character_matrices(raw)
    plot_all, vocab = plot_matrix(raw, cfg)

    keep = np.flatnonzero(raw.popularity > 0)
    # `keep` fancy-indexes the numpy and sparse arrays; `keep_ids` is the same
    # rows as Python ints, for the loops that read the per-storyversion dicts and
    # lists. A numpy scalar keys those fine at runtime, but it is not an `int`.
    keep_ids: list[int] = keep.tolist()
    log.info("keeping %d printed storyversions", len(keep))

    story_codes = sorted({raw.sv_story[i] for i in keep_ids})
    story_number = {sc: k for k, sc in enumerate(story_codes)}

    lang_kept, languages = set_matrix(raw.languages_of, keep_ids)
    decade_kept, decade_starts = set_matrix(raw.decades_of, keep_ids, order="natural")
    creator_kept, creator_codes = set_matrix(raw.creators_of, keep_ids)

    def col(values: list[int | None], floor: int = 1) -> np.ndarray:
        return layout_column(values, keep, floor)

    length_col = np.array([raw.sv_length[i] for i in keep_ids], dtype=np.int16)
    cols_col = col(raw.sv_cols)
    cols_col[cols_col == DEFAULTED_COLUMNS_PER_PAGE] = UNKNOWN
    panels_col = col(raw.sv_panels)
    # A panel count derived from a length that isn't there is not a panel count.
    panels_col[length_col == UNKNOWN] = UNKNOWN
    # `MIN_CREDIBLE_PANELS` applies only where it can actually be judged: a full
    # page with one or two panels is not credible, but a quarter-page strip with
    # two panels is exactly right, so a floor written for whole-page stories must
    # not reach the 111k fraction-only rows and discard their honest counts.
    panels_col[(length_col >= PAGE_SCALE) & (panels_col < MIN_CREDIBLE_PANELS)] = UNKNOWN

    # Drop characters and terms that no longer occur in the kept rows.
    char_kept = char_all[keep]
    char_used = np.flatnonzero(char_kept.getnnz(axis=0) > 0)
    char_kept = sp.csr_matrix(char_kept[:, char_used])
    char_weak_kept = sp.csr_matrix(weak_all[keep][:, char_used])
    inv_char = {j: code for code, j in raw.char_pos.items()}
    char_codes = [inv_char[j] for j in char_used.tolist()]

    plot_kept = plot_all[keep]
    plot_used = np.flatnonzero(plot_kept.getnnz(axis=0) > 0)
    plot_kept = sp.csr_matrix(plot_kept[:, plot_used])
    plot_terms = [vocab[j] for j in plot_used]

    index = StoryIndex(
        svc=[raw.sv_codes[i] for i in keep_ids],
        story_id=np.array([story_number[raw.sv_story[i]] for i in keep_ids], dtype=np.int32),
        page_tenths=length_col,
        rows=col(raw.sv_rows),
        cols=cols_col,
        panels=panels_col,
        popularity=raw.popularity[keep],
        char=char_kept,
        char_weak=char_weak_kept,
        plot=plot_kept,
        lang=lang_kept,
        decade=decade_kept,
        creator=creator_kept,
        story_codes=story_codes,
        story_titles=[raw.story_title.get(sc, "") for sc in story_codes],
        story_years=[raw.story_year.get(sc) for sc in story_codes],
        story_thumbs=[raw.story_thumb.get(sc, "") for sc in story_codes],
        char_codes=char_codes,
        char_names=[
            raw.preferred_char_names.get(c) or raw.char_names_raw.get(c) or c for c in char_codes
        ],
        plot_terms=plot_terms,
        languages=languages,
        decade_starts=decade_starts,
        language_names=[raw.language_name.get(code) or code for code in languages],
        creator_codes=creator_codes,
        creator_names=[raw.person_name.get(c) or c for c in creator_codes],
        creator_aliases=[sorted(raw.person_aliases.get(c, ())) for c in creator_codes],
    )
    log.info(
        "index: %d storyversions / %d stories / %d characters / %d plot terms / %d decades",
        index.n_items,
        index.n_stories,
        len(index.char_codes),
        len(index.plot_terms),
        len(index.decade_starts),
    )
    log.info(
        "  %d of %d storyversions have a printing decade (%.2f decades each)",
        int(index.has_decade.sum()),
        index.n_items,
        float(decade_kept.sum() / max(index.n_items, 1)),
    )
    log.info(
        "  %.1f%% of stories have a first-page scan to show",
        100 * sum(1 for path in index.story_thumbs if path) / max(index.n_stories, 1),
    )
    log.info(
        "  %d creators over %.1f%% of storyversions",
        len(creator_codes),
        100 * float(index.has_creator.mean()),
    )
    log.info(
        "  length recorded for %.1f%% of rows (%.1f%% shorter than a page)",
        100 * float((index.page_tenths != UNKNOWN).mean()),
        100 * float(((index.page_tenths != UNKNOWN) & (index.page_tenths < PAGE_SCALE)).mean()),
    )
    return index


def build(cfg: Settings | None = None) -> StoryIndex:
    cfg = cfg or settings
    with connect(cfg) as conn:
        raw = extract(conn, cfg)
    return assemble(raw, cfg)


def build_and_save(cfg: Settings | None = None) -> Path:
    cfg = cfg or settings
    index = build(cfg)
    index.save(cfg.index_dir)
    log.info("wrote index to %s", cfg.index_dir)
    return cfg.index_dir
