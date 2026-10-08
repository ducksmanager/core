"""The belief w over storyversions, with the sums EIG needs precomputed."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from quackinator.engine import information as info


@dataclass(frozen=True)
class Belief:
    w: np.ndarray
    wlogw: np.ndarray
    stacked: np.ndarray  # (N, 2): w and wlogw side by side, for sparse products
    mass: float
    log_mass: float
    entropy: float  # nats

    @classmethod
    def over(cls, w: np.ndarray) -> Belief:
        wlogw = info.safe_xlogx(w)
        return cls(
            w=w,
            wlogw=wlogw,
            stacked=np.column_stack([w, wlogw]),
            mass=float(w.sum()),
            log_mass=float(wlogw.sum()),
            entropy=float(-wlogw.sum()),
        )
