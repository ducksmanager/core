"""Build the story index from MariaDB: stream flat tables, join in Python."""

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
from quackinator.index.titles import title_tokens

log = logging.getLogger(__name__)

# Decades outside this range are data errors.
MIN_DECADE, MAX_DECADE = 1930, 2030

# Inducks marker codes, not characters ('--' = "No one"); left in, they'd become
# questions like "Does No one appear in the story?".
PLACEHOLDER_CHARACTERS = frozenset({"--", "-", "?", "!", "$", ""})

# `estimatedpanels` is derived, so a missing length shows up as a tiny panel count.
# Applied to whole-page rows only: a quarter-page strip really can be two panels.
MIN_CREDIBLE_PANELS = 3

# Inducks fills `columnsperpage` with 2 when the indexer recorded nothing, so a 2
# can't be told from a blank and is treated as unknown.
DEFAULTED_COLUMNS_PER_PAGE = 2

# Appearance comments for a character the reader won't notice (cameo, photo,
# dream...). Kept as appearances but marked weak. `BB(12;cameo)` arrives as "12;cameo".
UNSEEN_APPEARANCE = re.compile(
    r"\b(cameo|photo|picture|statue|portrait|painting|silhouette|logo|thought"
    r"|dream|flashback|head)\b",
    re.IGNORECASE,
)


def layout_column(values: list[int | None], keep: np.ndarray, floor: int = 1) -> np.ndarray:
    """Project a layout column onto the kept rows; values below `floor` become UNKNOWN.

    Inducks stores "not recorded" as 0, not NULL, in the layout columns.
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

    Many strips have `entirepages = 0` and their whole length in the fraction.
    `brokenpageunspecified = 'Y'` means a fraction of unknown size.
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


# Country prefix of a scan filename, e.g. `us_wdc_608g_001.jpg`.
SCAN_COUNTRY = re.compile(r"([a-z]{2})_")

# Prefix of sites holding resized copies of other sites' scans; skipped.
DERIVATIVE_SCAN_SITES = "thumbnails"


def scan_country(url: str) -> str:
    """Which country's collection a scan path belongs to, "" if unreadable."""
    match = SCAN_COUNTRY.match(url.rsplit("/", 1)[-1])
    return match.group(1) if match else ""


def site_prefixes(sites: Iterable[tuple[str, str]]) -> dict[str, str]:
    """Site code -> path of that site's tree under the root all sites share.

    Taken from the path part of `urlbase`. Sites in `DERIVATIVE_SCAN_SITES` are dropped.
    """
    prefixes = {}
    for sitecode, urlbase in sites:
        if not sitecode or not urlbase or sitecode.startswith(DERIVATIVE_SCAN_SITES):
            continue
        prefixes[sitecode] = urlparse(urlbase).path.lstrip("/")
    return prefixes


def pick_thumbnails(
    prefixes: Mapping[str, str],
    rows: Callable[[], Iterable[tuple[str, str, str]]],
) -> dict[str, str]:
    """One first-page scan per story, as a path relative to the shared site root.

    Prefers the country collection with the most scans overall; alphabetical
    order would favour tiny collections, including mirrored right-to-left
    reprints. `rows` is a factory because it is iterated twice.
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
            # Ranked behind every real collection below.
            unreadable += 1
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

    A row gets every code it carries (a story printed in several languages is in
    all of them). `prevalence` orders columns by how many rows carry them, so
    shortlists are stable; `natural` sorts the codes (for decades).
    """
    prevalence: Counter[Code] = Counter()
    for i in keep_ids:
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
    """Everything read from MariaDB, before assembly.

    Kept separate so `assemble` is testable without a database. Rows are
    identified by their position in `sv_codes`.
    """

    # --- per storyversion, parallel to sv_codes ---
    sv_codes: list[str] = field(default_factory=list)
    sv_story: list[str] = field(default_factory=list)
    sv_length: list[int] = field(default_factory=list)
    sv_rows: list[int | None] = field(default_factory=list)
    sv_cols: list[int | None] = field(default_factory=list)
    sv_panels: list[int | None] = field(default_factory=list)
    sv_cover: list[bool] = field(default_factory=list)
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
    # Words of every title the story was printed under, in any language.
    title_words: dict[str, set[str]] = field(default_factory=dict)
    story_year: dict[str, int | None] = field(default_factory=dict)
    # First-page scan path, relative to `Settings.thumbnail_base`.
    story_thumb: dict[str, str] = field(default_factory=dict)
    original_sv: dict[str, str] = field(default_factory=dict)
    language_name: dict[str, str] = field(default_factory=dict)
    person_name: dict[str, str] = field(default_factory=dict)
    person_aliases: dict[str, set[str]] = field(default_factory=dict)

    # --- plot text ---
    keywords: dict[str, str] = field(default_factory=dict)
    desc_by_sv: dict[str, str] = field(default_factory=dict)


def extract(conn: pymysql.Connection, cfg: Settings) -> Raw:
    """Stream every table the index needs. No cleaning beyond dropping junk rows."""
    raw = Raw()

    log.info("streaming comic and cover storyversions")
    for svc, sc, pages, rr, cc, pn, kw, bnum, bden, bunspec, kind in stream(
        conn, sql.STORYVERSIONS
    ):
        if not svc or not sc:
            continue
        cover = kind == "c"
        raw.sv_codes.append(svc)
        raw.sv_story.append(sc)
        raw.sv_cover.append(cover)
        # A cover has no panels, so its layout columns mean nothing.
        if cover:
            raw.sv_length.append(UNKNOWN)
            raw.sv_rows.append(None)
            raw.sv_cols.append(None)
            raw.sv_panels.append(None)
        else:
            raw.sv_length.append(
                page_length_tenths(to_int(pages), to_int(bnum), to_int(bden), bunspec)
            )
            raw.sv_rows.append(to_int(rr))
            raw.sv_cols.append(to_int(cc))
            raw.sv_panels.append(to_int(pn))
        if kw:
            raw.keywords[svc] = kw
    log.info("  %d storyversions, %d of them covers", len(raw.sv_codes), sum(raw.sv_cover))

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
    title_words: dict[str, set[str]] = defaultdict(set)
    for svc, lang, issuecode, title, is_cover in stream(conn, sql.ENTRIES):
        i = sv_pos.get(svc)
        # Count a printing only for its own kind (comic vs cover).
        if i is None or bool(to_int(is_cover)) != raw.sv_cover[i]:
            continue
        raw.popularity[i] += 1
        if title:
            title_words[raw.sv_story[i]] |= title_tokens(title)
        if lang:
            languages_of[i].add(lang)
        decade = issue_decade.get(issuecode)
        if decade is not None:
            decades_of[i].add(decade)
    raw.languages_of = dict(languages_of)
    raw.decades_of = dict(decades_of)
    raw.title_words = dict(title_words)
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
    # `isfake` marks placeholder creators ('?', 'various'); keep them out of search.
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
    # Per story, not per storyversion; folded into the character matrix later.
    hero_by_story: dict[str, set[str]] = defaultdict(set)
    for sc, ccode in stream(conn, sql.HEROES):
        if sc and ccode not in PLACEHOLDER_CHARACTERS:
            hero_by_story[sc].add(ccode)
    raw.hero_by_story = dict(hero_by_story)

    log.info("loading catalogs")
    for code, name, onetime in stream(conn, sql.CHARACTERS):
        if not code:
            continue
        raw.char_names_raw[code] = name
        # Indexers may omit one-time characters, so their absence proves nothing.
        if onetime == "Y":
            raw.onetime_chars.add(code)
    for code, lang, name, pref in stream(conn, sql.CHARACTER_NAMES):
        if lang == cfg.desc_language and pref == "Y" and code and name:
            raw.preferred_char_names[code] = name

    for sc, orig, title, fpd in stream(conn, sql.STORIES):
        if not sc:
            continue
        raw.story_title[sc] = title or ""
        if title:
            raw.title_words.setdefault(sc, set()).update(title_tokens(title))
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
    """The full appearance matrix (heroes included), and its weak subset."""
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
    # Weak only where the cell exists in `char`.
    weak = sp.csr_matrix(sp.csr_matrix(weak).multiply(char))
    weak.data[:] = 1
    return char, weak


def plot_matrix(raw: Raw, cfg: Settings) -> tuple[sp.csr_matrix, list[str]]:
    """Plot term occurrences per storyversion, and the vocabulary behind them.

    Text is taken from the original storyversion and shared by its reprints.
    """
    log.info("building plot vocabulary")
    text_by_story: dict[str, str] = {}
    # Stories with a real description, as opposed to the keywordsummary fallback.
    native_stories: set[str] = set()
    for sc, orig in raw.original_sv.items():
        text = raw.desc_by_sv.get(orig)
        if text:
            text_by_story[sc] = text
            native_stories.add(sc)
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


def title_matrix(
    raw: Raw, story_codes: list[str], cfg: Settings
) -> tuple[sp.csr_matrix, list[str]]:
    """Title words per story, minus words in over `title_max_df_ratio` of stories."""
    df: Counter[str] = Counter()
    for sc in story_codes:
        df.update(raw.title_words.get(sc, ()))
    ceiling = cfg.title_max_df_ratio * max(len(story_codes), 1)
    terms = sorted(word for word, n in df.items() if n <= ceiling)
    term_pos = {word: j for j, word in enumerate(terms)}

    rows: list[int] = []
    cols: list[int] = []
    for k, sc in enumerate(story_codes):
        hit = [term_pos[w] for w in raw.title_words.get(sc, ()) if w in term_pos]
        rows.extend([k] * len(hit))
        cols.extend(hit)
    shape = (len(story_codes), max(len(terms), 1))
    return boolean_matrix(rows, cols, shape), terms


def assemble(raw: Raw, cfg: Settings) -> StoryIndex:
    """Turn extracted tables into the index, keeping only printed storyversions."""
    char_all, weak_all = character_matrices(raw)
    plot_all, vocab = plot_matrix(raw, cfg)

    keep = np.flatnonzero(raw.popularity > 0)
    # Same rows as plain ints, for the dict/list lookups.
    keep_ids: list[int] = keep.tolist()
    log.info("keeping %d printed storyversions", len(keep))

    story_codes = sorted({raw.sv_story[i] for i in keep_ids})
    story_number = {sc: k for k, sc in enumerate(story_codes)}

    title_kept, title_terms = title_matrix(raw, story_codes, cfg)
    lang_kept, languages = set_matrix(raw.languages_of, keep_ids)
    decade_kept, decade_starts = set_matrix(raw.decades_of, keep_ids, order="natural")
    creator_kept, creator_codes = set_matrix(raw.creators_of, keep_ids)

    def col(values: list[int | None], floor: int = 1) -> np.ndarray:
        return layout_column(values, keep, floor)

    length_col = np.array([raw.sv_length[i] for i in keep_ids], dtype=np.int16)
    cols_col = col(raw.sv_cols)
    cols_col[cols_col == DEFAULTED_COLUMNS_PER_PAGE] = UNKNOWN
    panels_col = col(raw.sv_panels)
    # A panel count derived from a missing length is meaningless.
    panels_col[length_col == UNKNOWN] = UNKNOWN
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
        cover=np.array([raw.sv_cover[i] for i in keep_ids], dtype=bool),
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
        title=title_kept,
        title_terms=title_terms,
    )
    log.info(
        "index: %d storyversions (%d covers) / %d stories / %d characters / %d plot terms"
        " / %d decades",
        index.n_items,
        int(index.cover.sum()),
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
        "  %d title words over %.1f%% of stories",
        len(title_terms),
        100 * float((title_kept.getnnz(axis=1) > 0).mean()),
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
