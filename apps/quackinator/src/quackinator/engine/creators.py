"""Autocomplete from a typed creator name to a column of `index.creator`."""

from __future__ import annotations

import unicodedata
from dataclasses import dataclass, field

import numpy as np
import scipy.sparse as sp

from quackinator.index.model import StoryIndex


def fold(text: str) -> str:
    """Casefold and strip accents: readers often cannot type the diacritics they see."""
    stripped = unicodedata.normalize("NFKD", text)
    return "".join(c for c in stripped if not unicodedata.combining(c)).casefold()


@dataclass(frozen=True)
class CreatorMatch:
    creator: int
    name: str
    matched: str  # the spelling that matched, possibly an alias
    stories: int


@dataclass
class CreatorSearch:
    """Search over creator names and aliases; build once at engine load, it is expensive."""

    names: list[str]
    aliases: list[list[str]]
    # (F,) storyversions each creator worked on.
    counts: np.ndarray
    limit: int
    # (folded name or alias, creator column)
    _folded: list[tuple[str, int]] = field(init=False, repr=False)

    def __post_init__(self) -> None:
        self._folded = []
        for j, name in enumerate(self.names):
            self._folded.append((fold(name), j))
            for alias in self.aliases[j]:
                self._folded.append((fold(alias), j))

    @classmethod
    def build(cls, index: StoryIndex, limit: int) -> CreatorSearch | None:
        if index.creator.shape[1] == 0 or not index.creator_names:
            return None
        names = list(index.creator_names)
        aliases = list(index.creator_aliases) or [[] for _ in names]
        aliases += [[] for _ in range(len(names) - len(aliases))]
        return cls(
            names=names,
            aliases=aliases,
            counts=np.diff(sp.csc_matrix(index.creator).indptr),
            limit=limit,
        )

    def matches(self, query: str) -> list[CreatorMatch]:
        """Matching creators: prefix matches first, then by number of storyversions."""
        needle = fold(query).strip()
        if len(needle) < 2:
            return []

        best: dict[int, int] = {}
        for folded, j in self._folded:
            at = folded.find(needle)
            if at < 0:
                continue
            # 0 = starts with the query, 1 = starts a later word, 2 = anywhere.
            rank = 0 if at == 0 else 1 if folded[at - 1] == " " else 2
            if j not in best or rank < best[j]:
                best[j] = rank
        if not best:
            return []

        order = sorted(best, key=lambda j: (best[j], -int(self.counts[j]), self.names[j]))
        out = []
        for j in order[: self.limit]:
            name = self.names[j]
            matched = name
            if needle not in fold(name):
                matched = next((a for a in self.aliases[j] if needle in fold(a)), name)
            out.append(
                CreatorMatch(creator=j, name=name, matched=matched, stories=int(self.counts[j]))
            )
        return out
