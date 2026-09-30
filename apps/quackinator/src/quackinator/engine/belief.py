"""The belief, and the part of it worth scoring a question against.

A session's belief concentrates fast: ten answers in, nine tenths of the
catalogue holds none of it worth the name. Scoring the bank against those rows
is arithmetic on zeros, and it is most of what a turn costs, because every
question's moments are a pass over every candidate.

`Support` keeps the rows that hold the belief, and the matrix views restricted
to them, so the cost of a turn falls with the field instead of staying at the
size of the index.

The restriction is an approximation, bounded by the mass it drops: at most
`floor` times the number of candidates, which `Settings.selection_floor` keeps
some five orders of magnitude below any gain worth acting on. It changes which
question the engine *asks*. It never changes what an answer *does* — the update
in `selector.posterior` always runs over the whole belief, so a candidate that
falls out of the support keeps its mass and can climb back in.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import scipy.sparse as sp

from quackinator.engine import information as info


class Support:
    """The rows a session scores against, and the views restricted to them.

    Re-slicing the feature matrices costs about what scoring them does, so the
    support is only narrowed when it has shrunk enough to pay for itself, or
    when it has stopped covering the belief. Between those points the rows are
    stale in the safe direction: a superset, scored slightly more slowly than
    necessary.
    """

    __slots__ = ("_views", "drop", "rows", "shrink", "threshold")

    # Rows are picked by a belief threshold, and the threshold is estimated from
    # a sample rather than by sorting the whole belief: a sort costs more than
    # the turn it is trying to save. The estimate is then checked exactly, and
    # lowered until it drops no more mass than it is allowed to.
    SAMPLE = 8192

    def __init__(self, drop: float = 0.0, shrink: float = 0.7) -> None:
        self.drop = drop
        self.shrink = shrink
        # None means "every candidate", which is also what a fresh session has.
        self.rows: np.ndarray | None = None
        self.threshold = 0.0
        self._views: dict[int, tuple[Any, Any]] = {}

    def _estimate(self, w: np.ndarray) -> float:
        """A belief threshold that leaves out no more than `drop` of the mass."""
        sample = w if w.size <= self.SAMPLE else w[:: max(w.size // self.SAMPLE, 1)]
        ordered = np.sort(sample)[::-1]
        total = ordered.sum()
        if total <= 0:
            return 0.0
        cut = np.searchsorted(np.cumsum(ordered), (1.0 - self.drop) * total)
        threshold = float(ordered[min(cut, ordered.size - 1)])
        # The sample can be optimistic. Check against the whole belief, and back
        # off until it is not.
        for _ in range(8):
            if threshold <= 0.0 or float(w[w < threshold].sum()) <= self.drop:
                return threshold
            threshold /= 8.0
        return 0.0

    def refresh(self, w: np.ndarray) -> None:
        """Narrow to the candidates still holding belief, when that is worth doing."""
        if self.drop <= 0.0:
            return
        if self.threshold > 0.0:
            kept = np.flatnonzero(w >= self.threshold)
            dropped = float(w[w < self.threshold].sum())
            held = kept.size if self.rows is None else self.rows.size
            if dropped <= self.drop and kept.size > self.shrink * held:
                return
        self.threshold = self._estimate(w)
        if self.threshold <= 0.0:
            return
        self.rows = np.flatnonzero(w >= self.threshold)
        # The views describe the old rows and nothing may keep using them.
        self._views.clear()

    def restrict(self, matrix: sp.csr_matrix) -> sp.csr_matrix:
        """`matrix` with only the supported rows, cached until the support moves.

        The cache holds the original alongside its view, so the key — the
        matrix's identity — cannot be recycled under it by a condensed question
        that has since been thrown away.
        """
        if self.rows is None:
            return matrix
        found = self._views.get(id(matrix))
        if found is None or found[0] is not matrix:
            found = (matrix, matrix[self.rows])
            self._views[id(matrix)] = found
        return found[1]

    def take(self, values: np.ndarray) -> np.ndarray:
        """The supported entries of a per-candidate array, cached the same way."""
        if self.rows is None:
            return values
        found = self._views.get(id(values))
        if found is None or found[0] is not values:
            found = (values, values[self.rows])
            self._views[id(values)] = found
        return found[1]


@dataclass(frozen=True)
class Belief:
    """One turn's belief, in the form every question's `moments` needs.

    `mass` and `log_mass` are the totals *over the support*, not over the whole
    belief, and the moment computations subtract against them. A question whose
    "everything else" category falls out by subtraction stays consistent that
    way, whatever the support is.
    """

    w: np.ndarray
    support: Support
    # The same two vectors twice: contiguous for a weighted count, paired for a
    # matvec. A column of the paired form is strided, and a strided weight
    # vector costs a `bincount` more than the count itself.
    ws: np.ndarray
    wlogws: np.ndarray
    stacked: np.ndarray  # (rows, 2), for the sparse products
    mass: float
    log_mass: float
    entropy: float  # H(w) in nats, over the whole belief

    # Handles the questions reach for, so nothing downstream touches `support`.
    restrict = property(lambda self: self.support.restrict)
    take = property(lambda self: self.support.take)

    @classmethod
    def over(cls, w: np.ndarray, support: Support | None = None) -> Belief:
        support = support if support is not None else Support()
        support.refresh(w)
        rows = support.rows
        ws = w if rows is None else w[rows]
        wlogws = info.safe_xlogx(ws)
        # The prior entropy is a property of the whole belief, so the dropped
        # rows are counted here even though nothing scores against them.
        entropy = float(-info.safe_xlogx(w).sum()) if rows is not None else float(-wlogws.sum())
        return cls(
            w=w,
            support=support,
            ws=ws,
            wlogws=wlogws,
            stacked=np.column_stack([ws, wlogws]),
            mass=float(ws.sum()),
            log_mass=float(wlogws.sum()),
            entropy=entropy,
        )
