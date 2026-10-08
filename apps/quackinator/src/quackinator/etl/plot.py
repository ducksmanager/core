"""Plot vocabulary: words from story descriptions, asked as yes/no questions.

Tokens come from `inducks_storydescription` in `desc_language`, falling back to
the multilingual `keywordsummary`. The engine sees only a sparse boolean matrix.
"""

from __future__ import annotations

import re
from collections import Counter
from collections.abc import Iterable

TOKEN_RE = re.compile(r"[a-zà-öø-ÿ]{4,}")

# Function words, description boilerplate, and the main characters' names
# (the character questions already cover those).
_STOPWORDS = """
    that this with from they them their there then when what which while have
    has had been being were was are is his her its him she he it into out over
    under after before about again very can will just does did done make makes
    made take takes goes going gets back also more most than some any all one
    two three four both each other another such only same because though
    although however still even much many story stories page pages part parts
    panel panels comic comics series version reprint reprinted printed title
    titled untitled unknown none donald mickey scrooge goofy daisy minnie huey
    dewey louie duck ducks mouse tries wants decides finds turns ends
"""
STOPWORDS = frozenset(_STOPWORDS.split())


def tokenize(text: str) -> set[str]:
    return {t for t in TOKEN_RE.findall(text.lower()) if t not in STOPWORDS}


def build_vocabulary(
    docs: Iterable[set[str]],
    *,
    n_docs: int,
    min_df: int,
    max_df_ratio: float,
    size: int,
    native_docs: Iterable[set[str]] = (),
    min_native_lift: float = 0.0,
) -> list[str]:
    """Pick tokens that split the corpus best.

    Keeps tokens with `min_df` <= doc frequency <= `max_df_ratio` * n_docs, then
    ranks them by closeness to a 50/50 split. `min_native_lift` drops tokens whose
    share of use in `native_docs` (real descriptions, not the keywordsummary
    fallback) is below that multiple of the corpus-wide native share: foreign
    words like "dagobert" that a reader can't answer.
    """
    df: Counter[str] = Counter()
    for doc in docs:
        df.update(doc)
    native_df: Counter[str] = Counter()
    n_native = 0
    for doc in native_docs:
        native_df.update(doc)
        n_native += 1

    expected = (n_native / n_docs) if n_docs else 0.0
    floor = min_native_lift * expected
    max_df = int(n_docs * max_df_ratio)
    candidates = [
        (t, c)
        for t, c in df.items()
        if min_df <= c <= max_df and (not floor or native_df[t] / c >= floor)
    ]
    # The token breaks ties: `df` was filled from sets, whose order changes between runs.
    candidates.sort(key=lambda tc: (abs(0.5 - tc[1] / n_docs), tc[0]))
    return [t for t, _ in candidates[:size]]
