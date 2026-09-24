"""Expected information gain, in closed form.

Every question is modelled identically: it partitions the candidates into K
categories, and a confusion matrix L gives P(answer a | true category k). The
reader's fallibility lives entirely in L — there is no hard filtering anywhere
in the engine.

The point of this module is that EIG never needs the posterior to be
materialised. For a belief w over candidates, everything reduces to two moments
per category:

    A_k = sum of w over candidates in category k
    S_k = sum of w*log(w) over candidates in category k

Given those, for answer a:

    Z_a = sum_k L[a,k] * A_k                        (probability of answer a)
    T_a = sum_k L[a,k] * (S_k + A_k * log L[a,k])   (= sum_i u_i log u_i)
    H_a = log Z_a - T_a / Z_a                       (posterior entropy)

so EIG = H(w) - sum_a Z_a * H_a. Both A and S are matrix products against the
feature matrix, so all 17k candidate questions are scored in two sparse
matvecs rather than 17k posterior computations.
"""

from __future__ import annotations

import numpy as np

# Guards a log() of an exactly-zero mass; contributes nothing because it is
# always multiplied by that same zero mass.
_TINY = 1e-300


def safe_xlogx(x: np.ndarray) -> np.ndarray:
    """x*log(x), defined as 0 at x=0."""
    out = np.zeros_like(x, dtype=np.float64)
    nz = x > 0
    out[nz] = x[nz] * np.log(x[nz])
    return out


def expected_information_gain(
    A: np.ndarray, S: np.ndarray, L: np.ndarray, prior_entropy: float
) -> np.ndarray:
    """Score a batch of questions.

    Args:
        A: (Q, K) mass per category, rows summing to ~1.
        S: (Q, K) sum of w*log(w) per category.
        L: (n_answers, K) likelihood P(answer | category); columns sum to 1.
        prior_entropy: H(w) in nats.

    Returns:
        (Q,) expected information gain in nats. Non-negative up to float error.
    """
    LT = L.T  # (K, n_answers)
    Z = A @ LT  # (Q, n_answers)
    LlogL = np.where(L > 0, L * np.log(np.maximum(L, _TINY)), 0.0)
    T = S @ LT + A @ LlogL.T  # (Q, n_answers)

    with np.errstate(divide="ignore", invalid="ignore"):
        H = np.log(np.maximum(Z, _TINY)) - T / np.maximum(Z, _TINY)
    # An answer that cannot occur contributes nothing to the expectation.
    H = np.where(Z > 0, H, 0.0)
    posterior = np.sum(Z * H, axis=1)
    return prior_entropy - posterior


def entropy(w: np.ndarray) -> float:
    """Shannon entropy in nats of a normalised weight vector."""
    return float(-np.sum(safe_xlogx(w)))


def binary_confusion(noise: float, weak: float = 0.5) -> np.ndarray:
    """P(answer | category) for a yes/no question.

    Categories: 0 = feature present, 1 = absent, 2 = no data indexed,
                3 = indexed but not reliable evidence either way.
    Answers:    0 = "yes", 1 = "no".

    The unknown column is deliberately uninformative (0.5/0.5) so that stories
    Inducks has not indexed are neither favoured nor eliminated by a question
    that cannot apply to them.

    Category 3 is the same idea at cell granularity rather than row granularity:
    a cameo the reader cannot be expected to have spotted, or a character absent
    from a cast list Inducks itself flags as incomplete. `weak` is P("yes") for
    those, and defaults to fully neutral — the claim being made is only that the
    cell is not evidence, not that it leans one way.
    """
    return np.array(
        [
            [1.0 - noise, noise, 0.5, weak],
            [noise, 1.0 - noise, 0.5, 1.0 - weak],
        ],
        dtype=np.float64,
    )


def _with_mismatch(core: np.ndarray, mismatch: float) -> np.ndarray:
    """Mix a uniform component into a banded confusion core.

    The band models the reader miscounting. It does not model the other, larger
    failure of a layout question: Inducks records rows/columns/pages/panels per
    *storyversion*, but one storyversion is printed with different layouts in
    different issues (`fr/IRS 1` reprints `I TL 116-AP` re-laid-out, under the
    same storyversion code, and `inducks_entry` carries no layout columns at
    all). When that happens the indexed layout is not the layout in the reader's
    hands, and the true answer is not a neighbour of the recorded one — it is
    unrelated to it. A geometric band puts ~1e-3 on "unrelated", so a reader
    holding a re-laid-out reprint is eliminated; the uniform component is what
    keeps them alive.

    Columns of `core` sum to 1, and the added component contributes
    `mismatch * n * (1/n) = mismatch`, so column sums are preserved.
    """
    if mismatch <= 0.0:
        return core
    n = core.shape[0]
    return (1.0 - mismatch) * core + mismatch / n


def _band_core(n: int, noise: float, spread: float) -> np.ndarray:
    """Geometric band over `n` unit-spaced categories, unnormalised."""
    d = np.abs(np.arange(n)[:, None] - np.arange(n)[None, :])
    return np.where(d == 0, 1.0 - noise, noise * spread**d)


def _with_unknown(core: np.ndarray, mismatch: float) -> np.ndarray:
    """Normalise the columns, mix in `mismatch`, append the unknown column.

    The trailing column is the unknown category, left uniform: a candidate the
    index has no value for must not be moved by the answer either way.
    """
    n = core.shape[0]
    core = core / core.sum(axis=0, keepdims=True)
    L = np.zeros((n, n + 1), dtype=np.float64)
    L[:, :n] = _with_mismatch(core, mismatch)
    L[:, n] = 1.0 / n
    return L


def banded_confusion(
    n_categories: int, noise: float, spread: float = 0.35, mismatch: float = 0.0
) -> np.ndarray:
    """Confusion for an ordered categorical question (page counts, panel counts).

    Mistakes are local: a reader who miscounts a 12-page story says 11 or 13,
    never 4. Off-by-one carries most of the noise, decaying geometrically.

    `mismatch` adds a flat "the indexed layout is not the one in front of the
    reader" component on top of the band; see `_with_mismatch`.
    """
    return _with_unknown(_band_core(n_categories, noise, spread), mismatch)


def merged_confusion(
    groups: list[tuple[int, int]],
    n_buckets: int,
    noise: float,
    spread: float = 0.35,
    mismatch: float = 0.0,
) -> np.ndarray:
    """Confusion for an ordered scale shown at a coarser resolution.

    `groups` are the spans of buckets — inclusive, contiguous, covering the
    whole scale — that the reader is shown as single options. The likelihoods
    are the fine-grained band marginalised over those spans: summed over the
    buckets a coarse *answer* stands for, averaged over the buckets a coarse
    *category* holds. A wide option therefore absorbs the miscounts that fall
    inside it, which is the point of merging, while a narrow one keeps the full
    band's discrimination.

    The average over the truth side is uniform. Belief says which buckets in a
    span are likely, but the reader's counting error does not care, and making
    the likelihoods depend on the current belief would double-count it.
    """
    fine = banded_confusion(n_buckets, noise, spread, mismatch)  # (n, n + 1)
    g = len(groups)
    L = np.zeros((g, g + 1), dtype=np.float64)
    for a, (a_lo, a_hi) in enumerate(groups):
        answered = fine[a_lo : a_hi + 1]
        for k, (k_lo, k_hi) in enumerate(groups):
            L[a, k] = answered[:, k_lo : k_hi + 1].sum(axis=0).mean()
    # Unknown, as everywhere else: a candidate the index has no value for must
    # not be moved by the answer either way.
    L[:, g] = 1.0 / g
    return L


def truthful_information_gain(A: np.ndarray, S: np.ndarray, L: np.ndarray, prior: float) -> float:
    """EIG for a set-valued question, over readers who answer *truthfully*.

    `set_valued_information_gain` weights each answer by how likely the model
    thinks it is — which is what question selection needs, and which is useless
    for comparing a 3,102-label question against an 8-label one. Spread thin
    enough, the noise floor swamps the answer distribution: every label is
    slightly plausible for every candidate, so the average posterior barely moves
    and a question that would identify a story outright scores near zero.

    This weights each answer by the belief that actually *carries* it — the
    readers who would give that answer because it is true of their story — and
    asks what their answer buys them. It is the honest measure of what a label is
    worth to the reader who can supply it, and the reason the author box is a box
    rather than a list. It is not a selection criterion: an answer nobody can
    give would score just as well, which is exactly the failure the author box's
    other half — the turn it would cost — is about.
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
    """EIG for one single-select question whose ground truth is a *set*.

    "What language is the magazine printed in?" has one answer but many true
    labels per candidate: `I TL 116-AP` was printed in nine languages. Modelling
    it as a partition (one language per candidate) is what made answering
    "French" correctly eliminate the French printing of a Finnish-plurality
    storyversion.

    So the categories are per answer, not global, and both moments and
    likelihoods are indexed by answer:

        A: (F, K) mass per category, per answer
        S: (F, K) sum of w*log(w) per category, per answer
        L: (F, K) P(reader gives answer f | candidate is in category k)

    The reader picks exactly one option, so the answer distribution is
    renormalised across answers; posterior entropies are unaffected by that
    scaling because each is computed from its own normalised posterior.
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
