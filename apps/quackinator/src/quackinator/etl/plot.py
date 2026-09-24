"""Plot vocabulary construction.

The measured reason this module exists: with character, language and layout
questions but no plot questions, top-1 accuracy roughly halves. Much of the
catalogue is one-page gags, thousands of which share an identical character set
and page count, and nothing else in the bank separates them.

This is the deliberately cheap version — frequency-filtered tokens from the
`inducks_storydescription` text in `desc_language`, with the multilingual
`keywordsummary` as fallback. Tokens answer "does the word 'pirate' occur in this
story's description", which correlates with but is not identical to "are there
pirates in this story", so the bank holds bare words rather than propositions.
Swapping in canonical propositions means replacing `build_vocabulary` and
nothing else — the engine only ever sees a sparse boolean matrix.

Every token here is a question put to a human, which makes an unanswerable one
worse than a merely weak one: it costs a turn and returns nothing. That is what
`min_native_lift` is for, and why the benchmark understates it — a simulated
reader answers "does the story involve topolino?" perfectly from the index, and a
real reader cannot answer it at all.
"""

from __future__ import annotations

import re
from collections import Counter
from collections.abc import Iterable

TOKEN_RE = re.compile(r"[a-zà-öø-ÿ]{4,}")

# Function words, Inducks description boilerplate, and the handful of lead
# characters whose names dominate description text.
#
# The name list is deliberately short and hand-picked. A plot token that is a
# character name is redundant — the character family already asks about it from
# appearance records rather than description text — but no cheap corpus rule
# separates the two populations. Counting how many characters a token names
# ranks "scrooge" (1 code, all localisations of one duck) below "agent" (18
# one-off "Agent 23"-style characters); excluding every token in an asked-about
# character's name takes "treasure", "pirate", "island" and "detective" with it,
# via Treasure Planet, Detective Casey and friends. Both were tried and both cost
# more than the redundancy does. Foreign-language names — dagobert, topolino,
# paperino — are a different and much worse problem, and `min_native_lift` in
# `build_vocabulary` removes those properly.
STOPWORDS = frozenset(
    [
        "that",
        "this",
        "with",
        "from",
        "they",
        "them",
        "their",
        "there",
        "then",
        "when",
        "what",
        "which",
        "while",
        "have",
        "has",
        "had",
        "been",
        "being",
        "were",
        "was",
        "are",
        "is",
        "his",
        "her",
        "its",
        "him",
        "she",
        "he",
        "it",
        "into",
        "out",
        "over",
        "under",
        "after",
        "before",
        "about",
        "again",
        "very",
        "can",
        "will",
        "just",
        "does",
        "did",
        "done",
        "make",
        "makes",
        "made",
        "take",
        "takes",
        "goes",
        "going",
        "gets",
        "back",
        "also",
        "more",
        "most",
        "than",
        "some",
        "any",
        "all",
        "one",
        "two",
        "three",
        "four",
        "both",
        "each",
        "other",
        "another",
        "such",
        "only",
        "same",
        "both",
        "because",
        "though",
        "although",
        "however",
        "still",
        "even",
        "much",
        "many",
        "story",
        "stories",
        "page",
        "pages",
        "part",
        "parts",
        "panel",
        "panels",
        "comic",
        "comics",
        "series",
        "version",
        "reprint",
        "reprinted",
        "printed",
        "title",
        "titled",
        "untitled",
        "unknown",
        "none",
        "donald",
        "mickey",
        "scrooge",
        "goofy",
        "daisy",
        "minnie",
        "huey",
        "dewey",
        "louie",
        "duck",
        "ducks",
        "mouse",
        "tries",
        "wants",
        "decides",
        "finds",
        "turns",
        "ends",
    ]
)


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
    """Pick tokens that actually split the corpus.

    A token appearing in 3 stories is useless (it can never be asked usefully);
    a token in 60% of stories carries under 1 bit. We keep the middle band and
    rank by how close each token is to a 50/50 split, which is where expected
    information gain peaks.

    `native_docs` are the documents known to be in the description language, as
    opposed to the `keywordsummary` fallback, which is a multilingual
    concatenation. A token attested almost exclusively in the fallback is a
    foreign word that reached the bank on volume, not a word of the description
    language: "dagobert" occurs in 2 English descriptions and 2,232 keyword
    summaries, "dans" in 10 and 2,518, while genuine plot words sit near parity
    ("treasure" 854 and 740).

    The cut is a *lift* — how much of the token's usage is native prose, against
    how much the corpus mix alone predicts — rather than a raw share, so it does
    not silently tighten when `desc_language` is switched to one with fewer
    descriptions and the native corpus shrinks. On the real corpus the two
    populations sit an order of magnitude apart, so the exact value is not
    delicate.
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
    # Rank by proximity to a balanced split rather than by raw frequency.
    candidates.sort(key=lambda tc: abs(0.5 - tc[1] / n_docs))
    return [t for t, _ in candidates[:size]]
