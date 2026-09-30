"""Figures the built index can answer on its own. `mise run facts`.

Everything here is a property of `data/index`, so it needs no simulation and no
database: how much of the catalogue has a title, how much of it is shorter than a
page, how many characters there are to ask about. The README states a lot of
these in passing, and every one of them moves when the dump is rebuilt.

Figures that need a session played are in `engine/benchmark.py`; figures that
only exist in the dump — rows the ETL drops, columns it distrusts — are in
`etl/facts.py`, which needs the database up.
"""

from __future__ import annotations

import logging
from pathlib import Path

import numpy as np

from quackinator import figures
from quackinator.config import settings
from quackinator.index.model import PAGE_SCALE, UNKNOWN, StoryIndex

log = logging.getLogger(__name__)


def _share(part: float, whole: float) -> str:
    return f"{100 * part / whole:.0f}%" if whole else "—"


def _precise_share(part: float, whole: float) -> str:
    return f"{100 * part / whole:.1f}%" if whole else "—"


def _count(n: int) -> str:
    return f"{n:,}"


def index_figures(index: StoryIndex) -> dict[str, str]:
    """Every README figure that is a fact about the index."""
    n, stories = index.n_items, index.n_stories
    known_pages = index.page_tenths != UNKNOWN
    titled = sum(1 for t in index.story_titles if t)
    scanned = sum(1 for t in index.story_thumbs if t)
    weak = index.char_weak.nnz if index.char_weak is not None else 0

    # What a host system's candidate list is worth, and what it costs when it is
    # wrong. Both fall out of the prior and `seed_boost`, so neither needs a
    # simulation — see `Session.boost`.
    prior = np.maximum(index.popularity.astype(np.float64), 1.0) ** (
        settings.popularity_prior_weight
    )
    prior /= prior.sum()
    story_prior = np.bincount(index.story_id, weights=prior, minlength=stories)
    # Worst case: the five stories carrying the most prior mass are the most
    # expensive five a shortlist can name without naming the reader's.
    fattest_five = float(np.sort(story_prior)[-5:].sum())
    kept = 1.0 / (1.0 + (settings.seed_boost - 1.0) * fattest_five)

    return {
        # --- the size of the problem ---
        "storyversions": _count(n),
        "stories": _count(stories),
        "session-start-bits": f"{np.log2(stories):.0f} bits",
        "characters": _count(len(index.char_codes)),
        "plot-terms": _count(len(index.plot_terms)),
        "creators": _count(len(index.creator_codes)),
        "languages": _count(len(index.languages)),
        "decades": _count(len(index.decade_starts)),
        # --- what the catalogue is missing ---
        "stories-without-title": _share(stories - titled, stories),
        "scan-coverage": _precise_share(scanned, stories),
        "stories-without-scan": _share(stories - scanned, stories),
        # --- what the layout columns hold ---
        # The 38% that reading `entirepages` alone recorded as "length unknown".
        "sub-page-share": _share(int((known_pages & (index.page_tenths < PAGE_SCALE)).sum()), n),
        "length-known-share": _share(int(known_pages.sum()), n),
        "defaulted-cols-share": _share(int((index.cols == UNKNOWN).sum()), n),
        # --- what a seeded session starts from ---
        "seed-boost-lift": f"{settings.seed_boost:.0f}x",
        "seed-miss-cost": _precise_share(1.0 - kept, 1.0),
        # --- cells the reader cannot be asked to confirm ---
        "weak-character-cells": _precise_share(weak, index.char.nnz),
        "weak-character-count": _count(weak),
    }


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    index = StoryIndex.load(Path(settings.index_dir))
    values = index_figures(index)
    written, missing = figures.fill(values)
    log.info("index figures written: %s", ", ".join(written) or "none")
    if missing:
        # A figure nothing says any more is dead weight in here.
        log.info("computed but not used by the README: %s", ", ".join(missing))
    left = figures.audit()
    log.info("figures still unsourced in the README: %d", len(left))


if __name__ == "__main__":
    main()
