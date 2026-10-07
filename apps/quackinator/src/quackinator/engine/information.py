"""Expected information gain (EIG), in closed form, in nats.

A question splits candidates into K categories; L[a, k] = P(answer a | category k).
EIG needs only two sums per category of the belief w, never the posterior itself:

    A_k = sum of w       over candidates in category k
    S_k = sum of w*log w over candidates in category k

    Z_a = sum_k L[a,k] * A_k                        (probability of answer a)
    T_a = sum_k L[a,k] * (S_k + A_k * log L[a,k])
    H_a = log Z_a - T_a / Z_a                       (entropy after answer a)
    EIG = H(w) - sum_a Z_a * H_a

A and S are sparse matrix products, so the whole bank is scored at once.
"""

from __future__ import annotations

import numpy as np

# Guards log(0); always multiplied by that same zero, so it contributes nothing.
_TINY = 1e-300


def safe_xlogx(x: np.ndarray) -> np.ndarray:
    out = np.zeros_like(x, dtype=np.float64)
    nz = x > 0
    out[nz] = x[nz] * np.log(x[nz])
    return out


def expected_information_gain(
    A: np.ndarray, S: np.ndarray, L: np.ndarray, prior_entropy: float
) -> np.ndarray:
    """(Q,) EIG for Q questions sharing one L; A and S are (Q, K), L is (n_answers, K)."""
    LT = L.T  # (K, n_answers)
    Z = A @ LT  # (Q, n_answers)
    LlogL = np.where(L > 0, L * np.log(np.maximum(L, _TINY)), 0.0)
    T = S @ LT + A @ LlogL.T  # (Q, n_answers)

    with np.errstate(divide="ignore", invalid="ignore"):
        H = np.log(np.maximum(Z, _TINY)) - T / np.maximum(Z, _TINY)
    H = np.where(Z > 0, H, 0.0)
    posterior = np.sum(Z * H, axis=1)
    return prior_entropy - posterior


def entropy(w: np.ndarray) -> float:
    return float(-np.sum(safe_xlogx(w)))


def binary_confusion(noise: float, weak: float = 0.5) -> np.ndarray:
    """L for a yes/no question. Rows: yes, no. Columns: present, absent, not indexed, weak.

    "Not indexed" and "weak" (e.g. a background cameo) are 0.5/0.5 by default, so
    the answer neither favours nor eliminates those candidates.
    """
    return np.array(
        [
            [1.0 - noise, noise, 0.5, weak],
            [noise, 1.0 - noise, 0.5, 1.0 - weak],
        ],
        dtype=np.float64,
    )


# Per-bucket decay of a miscount's probability with distance from the truth.
SPREAD = 0.35


def banded_confusion(n_categories: int, noise: float, mismatch: float = 0.0) -> np.ndarray:
    """L for an ordered scale (pages, panels), shape (n, n + 1); last column is "not indexed".

    `mismatch` adds a flat share for a reprint laid out differently from the indexed one.
    """
    n = n_categories
    d = np.abs(np.arange(n)[:, None] - np.arange(n)[None, :])
    core = np.where(d == 0, 1.0 - noise, noise * SPREAD**d)
    core = core / core.sum(axis=0, keepdims=True)
    L = np.empty((n, n + 1), dtype=np.float64)
    L[:, :n] = (1.0 - mismatch) * core + mismatch / n
    L[:, n] = 1.0 / n
    return L


def merged_confusion(
    groups: list[tuple[int, int]],
    n_buckets: int,
    noise: float,
    mismatch: float = 0.0,
) -> np.ndarray:
    """`banded_confusion` with buckets merged into `groups` (inclusive, contiguous spans).

    Summed over the buckets an answer covers, averaged uniformly (not by belief)
    over the buckets a category covers.
    """
    fine = banded_confusion(n_buckets, noise, mismatch)  # (n, n + 1)
    g = len(groups)
    L = np.zeros((g, g + 1), dtype=np.float64)
    for a, (a_lo, a_hi) in enumerate(groups):
        answered = fine[a_lo : a_hi + 1]
        for k, (k_lo, k_hi) in enumerate(groups):
            L[a, k] = answered[:, k_lo : k_hi + 1].sum(axis=0).mean()
    L[:, g] = 1.0 / g
    return L


def truthful_information_gain(A: np.ndarray, S: np.ndarray, L: np.ndarray, prior: float) -> float:
    """`set_valued_information_gain`, weighting each answer by the mass that truly carries it.

    Used to compare questions with very different label counts, where noise makes
    the model-weighted EIG of a many-label question look near zero. Not for selection.
    """
    LlogL = np.where(L > 0, L * np.log(np.maximum(L, _TINY)), 0.0)
    Z = np.einsum("fk,fk->f", A, L)
    T = np.einsum("fk,fk->f", S, L) + np.einsum("fk,fk->f", A, LlogL)
    with np.errstate(divide="ignore", invalid="ignore"):
        H = np.log(np.maximum(Z, _TINY)) - T / np.maximum(Z, _TINY)
    H = np.where(Z > 0, H, 0.0)
    # Category 0 is "the candidate carries this label" in every set-valued shape.
    carried = A[:, 0]
    total = carried.sum()
    if total <= 0:
        return 0.0
    return prior - float((carried / total) @ H)


def set_valued_information_gain(
    A: np.ndarray, S: np.ndarray, L: np.ndarray, prior_entropy: float
) -> float:
    """EIG for a single-choice question where a candidate can match several answers (e.g. language).

    Categories are per answer: A, S and L are all (F, K), row f for answer f.
    The answer probabilities are renormalised to sum to 1.
    """
    LlogL = np.where(L > 0, L * np.log(np.maximum(L, _TINY)), 0.0)
    Z = np.einsum("fk,fk->f", A, L)
    T = np.einsum("fk,fk->f", S, L) + np.einsum("fk,fk->f", A, LlogL)
    with np.errstate(divide="ignore", invalid="ignore"):
        H = np.log(np.maximum(Z, _TINY)) - T / np.maximum(Z, _TINY)
    H = np.where(Z > 0, H, 0.0)
    total = Z.sum()
    if total <= 0:
        return 0.0
    return prior_entropy - float((Z / total) @ H)
