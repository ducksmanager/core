"""Title words, as both the ETL and OCR evidence see them.

One tokenizer for both sides on purpose: a title indexed one way and read back
another matches nothing. Titles come from every printing in every language and
OCR reads whatever the magazine in the reader's hands prints, so this folds case
and diacritics and nothing else — no stemming, no stopwords, both of which are
per-language.
"""

from __future__ import annotations

import re
import unicodedata

_WORD = re.compile(r"\w+")

# Shorter words are articles and OCR debris in every language the dump carries.
MIN_LENGTH = 3


def title_tokens(text: str) -> set[str]:
    folded = unicodedata.normalize("NFKD", text.casefold())
    folded = "".join(c for c in folded if not unicodedata.combining(c))
    return {
        word
        for word in _WORD.findall(folded)
        if len(word) >= MIN_LENGTH and not word.isdigit() and "_" not in word
    }
