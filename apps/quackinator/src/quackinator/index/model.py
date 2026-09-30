"""The precomputed index the engine runs against.

The identification unit is the *storyversion*, not the story. A Dutch reprint
is re-laid-out and sometimes cut, so its page and panel counts differ from the
original — and the page count is something the reader counts directly. Guesses
are aggregated back to storycode at the end.

Two caveats on how far that unit goes. Inducks does not mint a storyversion for
every re-layout: `fr/IRS 1` prints `I TL 116-AP` re-laid-out under the original
code, and `inducks_entry` has no layout columns, so the recorded layout is only
ever *a* layout the story was printed in. And a storyversion is not
single-language — 37% of the printed ones carry more than one — so language is a
sparse set per row, not a scalar.
"""

from __future__ import annotations

import gzip
import hashlib
import json
from dataclasses import dataclass, field
from functools import cached_property
from pathlib import Path

import numpy as np
import scipy.sparse as sp

ARRAYS_FILE = "arrays.npz"
CHAR_FILE = "char.npz"
CHAR_WEAK_FILE = "char_weak.npz"
PLOT_FILE = "plot.npz"
LANG_FILE = "lang.npz"
DECADE_FILE = "decade.npz"
CREATOR_FILE = "creator.npz"
META_FILE = "meta.json.gz"

UNKNOWN = -1

# Story length is held in tenths of a page, not whole pages. 111,350 comic
# storyversions — 38% of the index — are *fraction-only*: `entirepages` is 0 and
# the whole length lives in `brokenpagenumerator/denominator`, because the story
# is a half-page or quarter-page strip. Read as whole pages those all collapse to
# "not recorded", which threw away the length of more than a third of the
# catalogue and blanked its panel counts along with it.
PAGE_SCALE = 10


def _load_csr(path: Path) -> sp.csr_matrix:
    """Read a saved sparse matrix back as CSR, whatever format it was stored in."""
    return sp.csr_matrix(sp.load_npz(path))


@dataclass
class StoryIndex:
    # --- per storyversion (length N) ---
    svc: list[str]
    story_id: np.ndarray  # int32, index into story_codes
    page_tenths: np.ndarray  # int16, tenths of a page (see PAGE_SCALE), UNKNOWN where absent
    rows: np.ndarray  # int16
    cols: np.ndarray  # int16
    panels: np.ndarray  # int16
    popularity: np.ndarray  # int32, number of non-cover printings

    # --- sparse boolean feature matrices (N x F), CSR for row slicing ---
    char: sp.csr_matrix
    plot: sp.csr_matrix
    # Every language this storyversion has been printed in, not just the most
    # frequent one: a reader holding the sole French printing of an otherwise
    # Finnish-heavy storyversion must still match it.
    lang: sp.csr_matrix
    # Every decade this storyversion is *recorded* as having been printed in.
    # Set-valued for the same reason language is, and then some: a popular story
    # is reprinted for fifty years.
    decade: sp.csr_matrix
    # Who wrote and drew it. Not a question — a reader holding a foreign reprint
    # usually cannot see it — but when the first page does print the credit it is
    # the strongest single thing they can tell us, and unlike language or decade
    # it is a fact about the *story*, so the reader's unindexed magazine cannot
    # invalidate it.
    creator: sp.csr_matrix

    # --- catalogs ---
    story_codes: list[str]
    story_titles: list[str]
    story_years: list[int | None]
    char_codes: list[str]
    char_names: list[str]
    plot_terms: list[str]
    # Ordered most-printed first, so the shortlist shown to a reader is stable.
    languages: list[str]
    # Path of a scan of each story's first page, "" where there is none — which
    # is 5% of stories, so nothing may depend on having one. A path, not a URL:
    # the mirror serving it is `Settings.thumbnail_base`, and it moves without a
    # rebuild. Only ever shown to the reader; the engine never reads it.
    story_thumbs: list[str] = field(default_factory=list)
    # Chronological, and the column order of `decade`. Not prevalence-ordered
    # like `languages`: a reader scans a list of dates in date order.
    decade_starts: list[int] = field(default_factory=list)
    # Display names in `desc_language`; a reader cannot pick "sr-cyrl" off a cover.
    language_names: list[str] = field(default_factory=list)
    # Column order of `creator`, ordered by how many storyversions each worked on.
    creator_codes: list[str] = field(default_factory=list)
    creator_names: list[str] = field(default_factory=list)
    # Alternative spellings and pseudonyms per creator, for the search box only:
    # a printed page may say "Romano Scarpa" where Inducks has a different form.
    creator_aliases: list[list[str]] = field(default_factory=list)

    # Subset of `char` whose cells are listed but are not evidence the reader can
    # check: a cameo in one background panel, a character present only as a photo
    # or a statue, or a one-time character indexers are not required to list. A
    # "no" from the reader on one of these is uninformative, not a contradiction.
    char_weak: sp.csr_matrix | None = None

    # Reverse of `story_codes`. Derived, so never serialised.
    _story_number: dict[str, int] = field(
        default_factory=dict, init=False, repr=False, compare=False
    )
    # Cache for `fingerprint`, which hashes three lists of six figures.
    _fingerprint: str = field(default="", init=False, repr=False, compare=False)

    def __post_init__(self) -> None:
        if not self.language_names:
            self.language_names = list(self.languages)
        # An index built before scans were extracted has none of these, and one
        # story without a scan is not different from all of them: pad rather
        # than making every reader of the list check its length.
        if len(self.story_thumbs) < len(self.story_codes):
            self.story_thumbs = list(self.story_thumbs) + [""] * (
                len(self.story_codes) - len(self.story_thumbs)
            )
        self._story_number = {code: i for i, code in enumerate(self.story_codes)}

    def story_number(self, storycode: str) -> int | None:
        """Row in the story catalog for a story code, or None if it is not in it."""
        return self._story_number.get(storycode)

    @property
    def fingerprint(self) -> str:
        """Short stable id for everything an answer stored outside a session
        depends on.

        Deliberately not a build timestamp. A caller holding a reader's answers
        from last week wants one question answered — can these still be replayed
        into a session? — and most rebuilds do not touch it. What does is the set
        of things answers are keyed on: the stories they can name and the family
        columns they address. A rebuild that only moves a page count leaves this
        alone, and a caller keyed on it does not throw away answers that are
        still good.
        """
        if not self._fingerprint:
            digest = hashlib.sha256()
            for part in (self.story_codes, self.char_codes, self.plot_terms):
                digest.update(str(len(part)).encode())
                for item in part:
                    digest.update(item.encode("utf-8"))
                    digest.update(b"\0")
            self._fingerprint = digest.hexdigest()[:16]
        return self._fingerprint

    # Items with no data at all for a family answer "unknown" to every question
    # in it, and must not be penalised for it. Derived rather than stored: a row
    # has data for a family exactly when it carries a cell in it, and column
    # pruning drops only all-zero columns, so no row's count can change — which
    # is five arrays `arrays.npz` does not have to carry.

    @cached_property
    def has_char(self) -> np.ndarray:
        return self.char.getnnz(axis=1) > 0

    @cached_property
    def has_plot(self) -> np.ndarray:
        return self.plot.getnnz(axis=1) > 0

    @cached_property
    def has_lang(self) -> np.ndarray:
        return self.lang.getnnz(axis=1) > 0

    @cached_property
    def has_decade(self) -> np.ndarray:
        return self.decade.getnnz(axis=1) > 0

    @cached_property
    def has_creator(self) -> np.ndarray:
        return self.creator.getnnz(axis=1) > 0

    @property
    def n_items(self) -> int:
        return len(self.svc)

    @property
    def n_stories(self) -> int:
        return len(self.story_codes)

    def save(self, directory: Path) -> None:
        directory.mkdir(parents=True, exist_ok=True)
        np.savez_compressed(
            directory / ARRAYS_FILE,
            story_id=self.story_id,
            page_tenths=self.page_tenths,
            rows=self.rows,
            cols=self.cols,
            panels=self.panels,
            popularity=self.popularity,
        )
        sp.save_npz(directory / CHAR_FILE, self.char.tocsr())
        weak = self.char_weak if self.char_weak is not None else sp.csr_matrix(self.char.shape)
        sp.save_npz(directory / CHAR_WEAK_FILE, weak.tocsr())
        sp.save_npz(directory / PLOT_FILE, self.plot.tocsr())
        sp.save_npz(directory / LANG_FILE, self.lang.tocsr())
        sp.save_npz(directory / DECADE_FILE, self.decade.tocsr())
        sp.save_npz(directory / CREATOR_FILE, self.creator.tocsr())
        meta = {
            "svc": self.svc,
            "story_codes": self.story_codes,
            "story_titles": self.story_titles,
            "story_years": self.story_years,
            "story_thumbs": self.story_thumbs,
            "char_codes": self.char_codes,
            "char_names": self.char_names,
            "plot_terms": self.plot_terms,
            "languages": self.languages,
            "language_names": self.language_names,
            "decade_starts": self.decade_starts,
            "creator_codes": self.creator_codes,
            "creator_names": self.creator_names,
            "creator_aliases": self.creator_aliases,
        }
        with gzip.open(directory / META_FILE, "wt", encoding="utf-8") as fh:
            json.dump(meta, fh)

    @classmethod
    def load(cls, directory: Path) -> StoryIndex:
        arrays = np.load(directory / ARRAYS_FILE)
        with gzip.open(directory / META_FILE, "rt", encoding="utf-8") as fh:
            meta = json.load(fh)
        return cls(
            svc=meta["svc"],
            story_id=arrays["story_id"],
            page_tenths=arrays["page_tenths"],
            rows=arrays["rows"],
            cols=arrays["cols"],
            panels=arrays["panels"],
            popularity=arrays["popularity"],
            char=_load_csr(directory / CHAR_FILE),
            char_weak=_load_csr(directory / CHAR_WEAK_FILE),
            plot=_load_csr(directory / PLOT_FILE),
            lang=_load_csr(directory / LANG_FILE),
            decade=_load_csr(directory / DECADE_FILE),
            creator=_load_csr(directory / CREATOR_FILE),
            story_codes=meta["story_codes"],
            story_titles=meta["story_titles"],
            story_years=meta["story_years"],
            story_thumbs=meta.get("story_thumbs", []),
            char_codes=meta["char_codes"],
            char_names=meta["char_names"],
            plot_terms=meta["plot_terms"],
            languages=meta["languages"],
            language_names=meta.get("language_names", []),
            decade_starts=meta.get("decade_starts", []),
            creator_codes=meta.get("creator_codes", []),
            creator_names=meta.get("creator_names", []),
            creator_aliases=meta.get("creator_aliases", []),
        )

    def first_decade(self) -> np.ndarray:
        """Per storyversion, the decade its *story* was first published in.

        The one thing about a story's own date that a reader can legitimately be
        scored against. They cannot see it — which is why it is not a question —
        but it bounds the answer to a question they *can* see, the date on the
        cover: no magazine prints a story before the story exists. Unlike the
        recorded printing decades this holds whether or not Inducks has indexed
        the issue in the reader's hands, which is the whole point of it.
        """
        years = np.array([y if y else UNKNOWN for y in self.story_years], dtype=np.int32)
        per_story = np.where(years == UNKNOWN, UNKNOWN, years // 10 * 10)
        return per_story[self.story_id]
