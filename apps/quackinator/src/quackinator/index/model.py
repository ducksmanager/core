"""The precomputed index the engine runs against.

One row per storyversion, not per story: reprints can be re-laid-out, changing
page and panel counts. Guesses are summed back per story. Inducks does not always
mint a new storyversion for a re-layout, so the recorded layout is only one of them.
See README § The unit of identification is the storyversion.
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
TITLE_FILE = "title.npz"
META_FILE = "meta.json.gz"

UNKNOWN = -1

# Lengths are in tenths of a page: many short strips have `entirepages` = 0 and
# their whole length in `brokenpagenumerator/denominator`.
PAGE_SCALE = 10


def _load_csr(path: Path) -> sp.csr_matrix:
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
    popularity: np.ndarray  # int32, number of printings (as a cover, for covers)

    # --- sparse boolean feature matrices (N x F), CSR for row slicing ---
    char: sp.csr_matrix
    plot: sp.csr_matrix
    # Every language / decade it was printed in (sets, not single values).
    lang: sp.csr_matrix
    decade: sp.csr_matrix
    # Writers and artists; only used by the author box, never asked as a question.
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
    # First-page scan path per story, "" if none. Relative to `Settings.thumbnail_base`.
    story_thumbs: list[str] = field(default_factory=list)
    # Column order of `decade`, chronological.
    decade_starts: list[int] = field(default_factory=list)
    # Human-readable names for `languages`.
    language_names: list[str] = field(default_factory=list)
    # Column order of `creator`, ordered by how many storyversions each worked on.
    creator_codes: list[str] = field(default_factory=list)
    creator_names: list[str] = field(default_factory=list)
    # Alternative spellings and pseudonyms, for creator search only.
    creator_aliases: list[list[str]] = field(default_factory=list)

    # bool per storyversion: a cover rather than a story. Empty means all stories.
    cover: np.ndarray = field(default_factory=lambda: np.zeros(0, dtype=bool))

    # Cells of `char` a reader can't be expected to confirm (background cameo, statue...).
    # A "no" on these is neutral, not a contradiction.
    char_weak: sp.csr_matrix | None = None

    # Words of every title the story was printed under, in any language
    # (n_stories x len(title_terms)), for OCR matching.
    title: sp.csr_matrix | None = None
    title_terms: list[str] = field(default_factory=list)

    # Reverse of `story_codes`.
    _story_number: dict[str, int] = field(
        default_factory=dict, init=False, repr=False, compare=False
    )
    _fingerprint: str = field(default="", init=False, repr=False, compare=False)

    def __post_init__(self) -> None:
        if len(self.cover) != len(self.svc):
            self.cover = np.zeros(len(self.svc), dtype=bool)
        if not self.language_names:
            self.language_names = list(self.languages)
        self._story_number = {code: i for i, code in enumerate(self.story_codes)}

    def story_number(self, storycode: str) -> int | None:
        return self._story_number.get(storycode)

    @property
    def fingerprint(self) -> str:
        """Hash of what stored answers are keyed on (story, character and plot codes).

        Changes only when saved answers may no longer replay, not on every rebuild.
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

    # Rows with no data in a family count as "unknown" for its questions.

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

    @cached_property
    def title_pos(self) -> dict[str, int]:
        return {word: j for j, word in enumerate(self.title_terms)}

    @cached_property
    def title_idf(self) -> np.ndarray:
        """log(n_stories / stories containing the word), per column of `title`."""
        if self.title is None:
            return np.zeros(0)
        df = np.maximum(self.title.getnnz(axis=0), 1)
        return np.log(max(self.n_stories, 1) / df)

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
            cover=self.cover,
        )
        sp.save_npz(directory / CHAR_FILE, self.char.tocsr())
        weak = self.char_weak if self.char_weak is not None else sp.csr_matrix(self.char.shape)
        sp.save_npz(directory / CHAR_WEAK_FILE, weak.tocsr())
        sp.save_npz(directory / PLOT_FILE, self.plot.tocsr())
        sp.save_npz(directory / LANG_FILE, self.lang.tocsr())
        sp.save_npz(directory / DECADE_FILE, self.decade.tocsr())
        sp.save_npz(directory / CREATOR_FILE, self.creator.tocsr())
        if self.title is not None:
            sp.save_npz(directory / TITLE_FILE, self.title.tocsr())
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
            "title_terms": self.title_terms,
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
            cover=arrays["cover"],
            char=_load_csr(directory / CHAR_FILE),
            char_weak=_load_csr(directory / CHAR_WEAK_FILE),
            plot=_load_csr(directory / PLOT_FILE),
            lang=_load_csr(directory / LANG_FILE),
            decade=_load_csr(directory / DECADE_FILE),
            creator=_load_csr(directory / CREATOR_FILE),
            story_codes=meta["story_codes"],
            story_titles=meta["story_titles"],
            story_years=meta["story_years"],
            story_thumbs=meta["story_thumbs"],
            char_codes=meta["char_codes"],
            char_names=meta["char_names"],
            plot_terms=meta["plot_terms"],
            languages=meta["languages"],
            language_names=meta["language_names"],
            decade_starts=meta["decade_starts"],
            creator_codes=meta["creator_codes"],
            creator_names=meta["creator_names"],
            creator_aliases=meta["creator_aliases"],
            title=_load_csr(directory / TITLE_FILE),
            title_terms=meta["title_terms"],
        )

    def first_decade(self) -> np.ndarray:
        """Per storyversion, the decade its story was first published, or UNKNOWN.

        A lower bound on the reader's magazine date, even for unindexed printings.
        """
        years = np.array([y if y else UNKNOWN for y in self.story_years], dtype=np.int32)
        per_story = np.where(years == UNKNOWN, UNKNOWN, years // 10 * 10)
        return per_story[self.story_id]
