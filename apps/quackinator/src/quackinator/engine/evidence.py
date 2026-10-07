"""Turns scan analysis (image search, first-panel OCR, Kumiko panels) into evidence.

Image search and OCR become per-story multipliers; Kumiko answers the layout
questions, with its own error rate instead of a reader's.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass

import numpy as np

from quackinator.config import Settings
from quackinator.index.model import StoryIndex
from quackinator.index.titles import title_tokens


@dataclass(frozen=True)
class KumikoPage:
    rows: int
    panels: int


@dataclass(frozen=True)
class KumikoFact:
    key: str
    value: int
    noise: float


def panel_rows(panels: Iterable[Sequence[int]], tolerance: int) -> int:
    """Rows of panels on one page, from Kumiko's `[x, y, width, height]` boxes.

    Must match Dumili's `getPanelRows` (packages/types/panelRows.ts).
    """
    rows: list[int] = []
    for y in sorted(box[1] for box in panels):
        if not any(abs(y - row) <= tolerance for row in rows):
            rows.append(y)
    return len(rows)


def image_lifts(
    index: StoryIndex, matches: Iterable[tuple[str, float]], cfg: Settings
) -> tuple[np.ndarray, list[str]]:
    """Per-story multiplier from reverse image search, and the codes not in the index.

    Several matches for one story are the same drawing, so it keeps the best, not the product.
    """
    lift = np.ones(index.n_stories)
    unknown: list[str] = []
    span = max(1.0 - cfg.image_min_score, 1e-9)
    for storycode, score in matches:
        story = index.story_number(storycode)
        if story is None:
            unknown.append(storycode)
            continue
        strength = min(max((score - cfg.image_min_score) / span, 0.0), 1.0)
        lift[story] = max(lift[story], cfg.image_boost**strength)
    return lift, unknown


def ocr_lifts(
    index: StoryIndex, texts: Iterable[tuple[str, float]], cfg: Settings
) -> tuple[np.ndarray, list[str]] | None:
    """Per-story multiplier from OCR text, and the title words it matched; None without titles.

    Matched words are weighted by IDF, so rare title words count most.
    """
    if index.title is None or not index.title_terms:
        return None
    words: set[str] = set()
    for text, confidence in texts:
        if confidence >= cfg.ocr_min_confidence:
            words |= title_tokens(text)
    cols = sorted(index.title_pos[w] for w in words if w in index.title_pos)
    lift = np.ones(index.n_stories)
    if not cols:
        return lift, []

    query = np.zeros(len(index.title_terms))
    query[cols] = index.title_idf[cols]
    matched = np.asarray(index.title @ query).ravel()
    strength = np.minimum(matched / cfg.ocr_full_match_idf, 1.0)
    lift = cfg.ocr_boost**strength
    return lift, [index.title_terms[j] for j in cols]


def kumiko_facts(
    pages: Sequence[KumikoPage | None], whole_story: bool, cfg: Settings
) -> list[KumikoFact]:
    """Layout answers Kumiko's segmentation supports.

    Rows is the median over pages (splash pages are common). Panels is a total, so
    it is only given when every page of the whole story was segmented.
    """
    segmented = [page for page in pages if page is not None and page.panels > 0]
    facts: list[KumikoFact] = []
    rows = sorted(page.rows for page in segmented if page.rows > 0)
    if rows:
        noise = cfg.kumiko_rows_noise if len(rows) > 1 else cfg.kumiko_single_page_rows_noise
        facts.append(KumikoFact("rows", rows[len(rows) // 2], noise))
    if whole_story and pages and len(segmented) == len(pages):
        facts.append(
            KumikoFact("panels", sum(page.panels for page in segmented), cfg.kumiko_panels_noise)
        )
    return facts
