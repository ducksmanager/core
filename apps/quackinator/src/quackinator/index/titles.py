"""Title tokenizer shared by the ETL and OCR matching; both sides must tokenize identically.

Folds case and accents only: titles are in every language, so no stemming or stopwords.
"""

from __future__ import annotations

import re
import unicodedata

_WORD = re.compile(r"\w+")

# Shorter words are mostly articles and OCR noise.
MIN_LENGTH = 3


def title_tokens(text: str) -> set[str]:
    folded = unicodedata.normalize("NFKD", text.casefold())
    folded = "".join(c for c in folded if not unicodedata.combining(c))
    return {
        word
        for word in _WORD.findall(folded)
        if len(word) >= MIN_LENGTH and not word.isdigit() and "_" not in word
    }
