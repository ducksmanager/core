"""What tools looking at the page can tell the engine before the first question.

Three of them, all run by whoever holds the scan — Dumili over an indexation, or
the standalone app over the reader's upload — and judged here, where the belief
they feed is:

- reverse image search, a cosine score per storycode;
- OCR of the first panel, which is where a title is printed;
- Kumiko's panel segmentation, which gives a row count and a panel count.

Image search and OCR name stories, so they become per-story likelihood ratios.
Kumiko measures the same things the layout questions ask, so it answers those
questions — at its own error rate, not a reader's.
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

    The same clustering as Dumili's `getPanelRows` (packages/types/panelRows.ts),
    which `measure-kumiko-accuracy.ts` scores: a panel whose top is within
    `tolerance` pixels of a row already seen belongs to it.
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

    Several scans of one story are not independent evidence — they are the same
    drawing — so a story keeps its best score rather than a product.
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
    """Per-story multiplier from OCR text, and the title words it matched.

    None where the index carries no titles. A word scores its IDF over stories,
    so a title's rare words carry it and a word in a hundred titles barely
    moves anything.
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

    Rows is the median over segmented pages, never one page's count: a splash
    page or a half-page ending is normal, and either taken as the answer is a
    wrong answer rather than a missing one. Total panels is a sum, so it needs
    every page of the story segmented, which only a host holding the whole
    story can say.
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
