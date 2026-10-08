"""The closed-form EIG is the one piece of this codebase that is easy to get
subtly wrong and impossible to notice: a wrong constant just makes the engine
ask slightly worse questions forever. So check it against a brute-force
posterior computation."""

import numpy as np
import pytest

from quackinator.engine import information as info
from quackinator.engine.belief import Belief


def brute_force_eig(w, assign, L):
    """Materialise every posterior and average its entropy. O(n) per answer."""
    prior_h = info.entropy(w)
    total = 0.0
    for a in range(L.shape[0]):
        u = w * L[a][assign]
        z = u.sum()
        if z <= 0:
            continue
        total += z * info.entropy(u / z)
    return prior_h - total


@pytest.mark.parametrize("seed", range(8))
def test_closed_form_matches_brute_force_binary(seed):
    rng = np.random.default_rng(seed)
    n = 400
    w = rng.random(n) + 1e-3
    w /= w.sum()
    assign = rng.integers(0, 4, size=n)  # present / absent / unknown / weak
    L = info.binary_confusion(0.05, weak=0.4)

    wlogw = info.safe_xlogx(w)
    A = np.array([[w[assign == k].sum() for k in range(4)]])
    S = np.array([[wlogw[assign == k].sum() for k in range(4)]])

    got = info.expected_information_gain(A, S, L, info.entropy(w))[0]
    assert got == pytest.approx(brute_force_eig(w, assign, L), rel=1e-9, abs=1e-12)


@pytest.mark.parametrize("n_cat", [3, 6, 12])
def test_closed_form_matches_brute_force_categorical(n_cat):
    rng = np.random.default_rng(n_cat)
    n = 500
    w = rng.random(n) + 1e-3
    w /= w.sum()
    assign = rng.integers(0, n_cat + 1, size=n)  # last category is "unknown"
    L = info.banded_confusion(n_cat, 0.05)

    wlogw = info.safe_xlogx(w)
    k = n_cat + 1
    A = np.bincount(assign, weights=w, minlength=k).reshape(1, k)
    S = np.bincount(assign, weights=wlogw, minlength=k).reshape(1, k)

    got = info.expected_information_gain(A, S, L, info.entropy(w))[0]
    assert got == pytest.approx(brute_force_eig(w, assign, L), rel=1e-9, abs=1e-12)


def test_confusion_columns_are_distributions():
    for L in (
        info.binary_confusion(0.05),
        info.binary_confusion(0.05, weak=0.4),
        info.banded_confusion(8, 0.05),
        info.banded_confusion(8, 0.05, mismatch=0.35),
        info.merged_confusion([(0, 0), (1, 3), (4, 9)], 10, 0.05, mismatch=0.35),
    ):
        assert np.allclose(L.sum(axis=0), 1.0)
        assert (L > 0).all(), "a zero likelihood would hard-eliminate candidates"


def test_mismatch_keeps_a_re_laid_out_reprint_alive():
    """A distant answer must cost a factor, not an elimination.

    The reader holding `fr/IRS 1` counts 6 tiers per page; the index records the
    Italian 3 from `I TL 116-AP`, the same storyversion re-laid-out. Under a pure
    band that is a ~400x penalty, which no later question recovers from.
    """
    from quackinator.config import settings

    plain = info.banded_confusion(6, 0.05)
    mixed = info.banded_confusion(6, 0.05, mismatch=settings.layout_mismatch)
    # true category 2 ("3 tiers"), reader answers 5 ("6 or more")
    assert plain[5, 2] / plain[2, 2] < 1 / 300
    assert mixed[5, 2] / mixed[2, 2] > 1 / 60
    # ...while a correct answer still carries several bits, so a layout question
    # the index does describe correctly is not wasted.
    assert np.log2(mixed[2, 2] / mixed[5, 2]) > 3


def test_mismatch_leaves_the_ranking_of_answers_untouched():
    mixed = info.banded_confusion(7, 0.05, mismatch=0.4)
    core = mixed[:, :-1]
    assert (np.diag(core) == core.max(axis=0)).all()
    for k in range(7):
        distances = np.abs(np.arange(7) - k)
        assert (np.argsort(-core[:, k]) == np.argsort(distances, kind="stable")).all()


def test_information_gain_is_non_negative():
    rng = np.random.default_rng(0)
    w = rng.random(200)
    w /= w.sum()
    assign = rng.integers(0, 4, size=200)
    wlogw = info.safe_xlogx(w)
    A = np.array([[w[assign == k].sum() for k in range(4)]])
    S = np.array([[wlogw[assign == k].sum() for k in range(4)]])
    gain = info.expected_information_gain(A, S, info.binary_confusion(0.1), info.entropy(w))
    assert gain[0] >= -1e-12


def test_perfectly_split_question_yields_one_bit():
    n = 1000
    w = np.full(n, 1.0 / n)
    assign = np.array([0] * (n // 2) + [1] * (n // 2))
    wlogw = info.safe_xlogx(w)
    A = np.array([[w[assign == k].sum() for k in range(4)]])
    S = np.array([[wlogw[assign == k].sum() for k in range(4)]])
    # A noiseless 50/50 split is exactly one bit of information.
    L = info.binary_confusion(1e-12)
    gain = info.expected_information_gain(A, S, L, info.entropy(w))[0]
    assert gain / np.log(2) == pytest.approx(1.0, abs=1e-6)


def test_merged_confusion_widens_the_options_that_absorb_a_miscount():
    """A wide option is answered right more often than a narrow one.

    Merging neighbouring buckets is not free — it gives up resolution — but the
    resolution it gives up is exactly where the reader miscounts, so the option
    the reader picks becomes more reliable. That has to show in the likelihoods,
    or the selector cannot see the trade it is making.
    """
    L = info.merged_confusion([(0, 0), (1, 1), (2, 9)], 10, 0.05)
    assert np.allclose(L.sum(axis=0), 1.0)
    assert (L > 0).all()
    # The eight-bucket option keeps its own miscounts; the singletons leak into
    # their neighbours.
    assert L[2, 2] > L[0, 0]
    # A bucket in the middle of a wide option cannot be confused out of it.
    assert L[2, 2] == pytest.approx(1.0, abs=0.02)


def test_merged_confusion_is_diagonally_dominant():
    L = info.merged_confusion([(0, 2), (3, 3), (4, 5), (6, 9)], 10, 0.05)
    core = L[:, :-1]
    assert (np.diag(core) == core.max(axis=0)).all()


def test_merging_costs_information_and_nothing_else():
    """The merged scale can only be worse than the full one, never better.

    Condensing is a UI concession, and `QuestionBank.candidates` scores the
    condensed question precisely so the concession is priced. If a merge ever
    scored *higher* than the scale it came from, the selector would be reading
    its own resolution loss as evidence.
    """
    rng = np.random.default_rng(11)
    n, n_cat = 800, 10
    w = rng.random(n) + 1e-3
    w /= w.sum()
    assign = rng.integers(0, n_cat + 1, size=n)
    wlogw = info.safe_xlogx(w)
    prior = info.entropy(w)

    def eig(L, a):
        k = a.max() + 1
        A = np.bincount(a, weights=w, minlength=k).reshape(1, k)
        S = np.bincount(a, weights=wlogw, minlength=k).reshape(1, k)
        return info.expected_information_gain(A, S, L, prior)[0]

    groups = [(0, 1), (2, 2), (3, 5), (6, 7), (8, 9)]
    remap = np.array([g for g, (lo, hi) in enumerate(groups) for _ in range(lo, hi + 1)] + [5])
    full = eig(info.banded_confusion(n_cat, 0.05), assign)
    merged = eig(info.merged_confusion(groups, n_cat, 0.05), remap[assign])
    assert 0 < merged < full


def set_valued_moments(w, wlogw, carries, n_labels):
    """(A, S) for a question where each candidate carries one of `n_labels`."""
    A = np.empty((n_labels, 2))
    S = np.empty((n_labels, 2))
    for label in range(n_labels):
        mine = carries == label
        A[label] = [w[mine].sum(), w[~mine].sum()]
        S[label] = [wlogw[mine].sum(), wlogw[~mine].sum()]
    return A, S


def test_labels_nobody_carries_cost_the_model_weighted_gain_but_not_the_truthful_one():
    """Why the author box needed a second measure.

    Model-weighted EIG is what question selection needs, and it is the right
    answer to "should I ask this". It is the wrong answer to "what is a name
    worth to the reader who knows it": every label the noise floor makes
    slightly plausible dilutes the answer distribution, so a question spread over
    3,102 creators scores near zero however well a real answer identifies a
    story. Padding a question with labels nobody carries must therefore leave
    the truthful figure alone and drag the model-weighted one down — which is
    exactly the difference between the two columns in the author-box table.
    """
    rng = np.random.default_rng(4)
    n, used, hi, lo = 400, 60, 0.95, 0.05
    w = rng.random(n) + 1e-3
    w /= w.sum()
    wlogw = info.safe_xlogx(w)
    prior = info.entropy(w)
    carries = rng.integers(0, used, size=n)

    def gains(n_labels):
        A, S = set_valued_moments(w, wlogw, carries, n_labels)
        L = np.column_stack([np.full(n_labels, hi), np.full(n_labels, lo)])
        return (
            info.set_valued_information_gain(A, S, L, prior),
            info.truthful_information_gain(A, S, L, prior),
        )

    tight_model, tight_truthful = gains(used)
    padded_model, padded_truthful = gains(used * 20)

    assert padded_truthful == pytest.approx(tight_truthful)
    assert padded_model < tight_model / 4
    # And the truthful figure is a real information gain, not an artefact.
    assert 0 < tight_truthful <= prior


def brute_force_bounded_eig(w, membership, ruled_out, has_data, hi, lo, imp, neutral):
    """Materialise every posterior for a set-valued question with a bound."""
    prior_h = info.entropy(w)
    zs, hs = [], []
    for a in range(membership.shape[1]):
        lik = np.where(
            membership[:, a],
            hi,
            np.where(ruled_out[:, a], imp, np.where(has_data, lo, neutral[a])),
        )
        u = w * lik
        z = u.sum()
        zs.append(z)
        hs.append(info.entropy(u / z) if z > 0 else 0.0)
    zs = np.array(zs)
    return prior_h - float((zs / zs.sum()) @ np.array(hs))


@pytest.mark.parametrize("seed", range(6))
def test_bounded_set_valued_closed_form_matches_brute_force(seed):
    """The decade question's four-category form, against an explicit posterior.

    Categories are 0 carries, 1 carries others, 2 ruled out, 3 nothing indexed —
    and "ruled out" has to override "nothing indexed", because the bound holds
    whether or not Inducks has the reader's printing.
    """
    import scipy.sparse as sp

    from quackinator.engine.questions import MultiLabelQuestion

    rng = np.random.default_rng(seed)
    n, f = 300, 6
    w = rng.random(n) + 1e-3
    w /= w.sum()
    membership = rng.random((n, f)) < 0.30
    has_data = np.asarray(membership.any(axis=1))
    membership[~has_data] = False
    # A contiguous forbidden prefix per row, the shape a first-publication decade
    # produces, and deliberately overlapping both membership and the no-data rows.
    first = rng.integers(0, f, size=n)
    ruled = np.arange(f)[None, :] < first[:, None]

    q = MultiLabelQuestion(
        key="decade",
        prompt="?",
        matrix=sp.csr_matrix(membership.astype(np.int8)),
        labels=[str(i) for i in range(f)],
        has_data=has_data,
        noise=0.05,
        ruled_out=sp.csr_matrix(ruled.astype(np.int8)),
        impossible=0.002,
    )
    A, S = q.moments(Belief.over(w))
    got = info.set_valued_information_gain(A, S, q.confusion, info.entropy(w))

    # A recorded printing beats the bound, so drop the overlap before brute force.
    effective = ruled & ~membership
    want = brute_force_bounded_eig(
        w, membership, effective, has_data, q.hi, q.lo, q.impossible, q.neutral
    )
    assert got == pytest.approx(want, rel=1e-9, abs=1e-12)


def test_bounded_moments_partition_the_belief():
    """Every candidate lands in exactly one category, for every answer."""
    import scipy.sparse as sp

    from quackinator.engine.questions import MultiLabelQuestion

    rng = np.random.default_rng(4)
    n, f = 400, 5
    membership = rng.random((n, f)) < 0.25
    has_data = np.asarray(membership.any(axis=1))
    membership[~has_data] = False
    ruled = rng.random((n, f)) < 0.4
    q = MultiLabelQuestion(
        key="decade",
        prompt="?",
        matrix=sp.csr_matrix(membership.astype(np.int8)),
        labels=[str(i) for i in range(f)],
        has_data=has_data,
        noise=0.05,
        ruled_out=sp.csr_matrix(ruled.astype(np.int8)),
        impossible=0.002,
    )
    w = rng.random(n)
    w /= w.sum()
    A, _ = q.moments(Belief.over(w))
    assert A.shape == (f, 4)
    assert A.sum(axis=1) == pytest.approx(np.ones(f))
    assert (A >= -1e-12).all()
    # And the categories agree with the per-answer breakdown used to apply an answer.
    for a in range(f):
        cats = q.categories(a)
        for k in range(4):
            assert A[a, k] == pytest.approx(w[cats == k].sum())


def brute_force_attested_eig(q):
    """Materialise every posterior for an AttestedMultiLabelQuestion."""
    import numpy as np

    def run(w):
        prior_h = info.entropy(w)
        zs, hs = [], []
        for f in range(len(q.labels)):
            u = w * q.likelihood(f)
            z = u.sum()
            zs.append(z)
            hs.append(info.entropy(u / z) if z > 0 else 0.0)
        zs = np.array(zs)
        return prior_h - float((zs / zs.sum()) @ np.array(hs))

    return run


@pytest.mark.parametrize("seed", range(6))
def test_attested_closed_form_matches_brute_force(seed):
    import scipy.sparse as sp

    from quackinator.engine.questions import AttestedMultiLabelQuestion

    rng = np.random.default_rng(seed)
    n, f = 300, 7
    matrix = sp.csr_matrix((rng.random((n, f)) < 0.3).astype(np.int8))
    has_data = np.asarray(matrix.sum(axis=1)).ravel() > 0
    coverage = np.where(rng.random(n) < 0.25, 0.9, 0.57)
    q = AttestedMultiLabelQuestion(
        key="language",
        prompt="",
        matrix=matrix,
        labels=[str(i) for i in range(f)],
        has_data=has_data,
        noise=0.05,
        coverage=coverage,
    )
    w = rng.random(n) + 1e-3
    w /= w.sum()
    wlogw = info.safe_xlogx(w)
    A, S = q.moments(Belief.over(w))
    closed = info.set_valued_information_gain(A, S, q.confusion, float(-wlogw.sum()))
    assert closed == pytest.approx(brute_force_attested_eig(q)(w), abs=1e-9)


def test_attested_moments_partition_the_belief():
    import scipy.sparse as sp

    from quackinator.engine.questions import AttestedMultiLabelQuestion

    rng = np.random.default_rng(0)
    n, f = 200, 5
    matrix = sp.csr_matrix((rng.random((n, f)) < 0.3).astype(np.int8))
    q = AttestedMultiLabelQuestion(
        key="language",
        prompt="",
        matrix=matrix,
        labels=[str(i) for i in range(f)],
        has_data=np.asarray(matrix.sum(axis=1)).ravel() > 0,
        noise=0.05,
        coverage=np.where(rng.random(n) < 0.5, 0.9, 0.57),
    )
    w = rng.random(n)
    w /= w.sum()
    A, _ = q.moments(Belief.over(w))
    assert A.sum(axis=1) == pytest.approx(np.ones(f))


def test_thin_evidence_damps_a_missing_label_less_than_thick_evidence():
    """The whole point: absence of a label is only evidence if we looked hard.

    Two candidates, neither recorded in the answered language. One has been seen
    printed thirty times over, the other once. The well-attested one must lose
    more belief, because its records are the ones with a real chance of having
    caught the answer if it were true.
    """
    import scipy.sparse as sp

    from quackinator.engine.questions import AttestedMultiLabelQuestion

    # Rows 0 and 1 are Italian-only; row 2 carries French, so French has a real
    # prevalence and the "unrecorded printing" term is not degenerate.
    matrix = sp.csr_matrix(np.array([[1, 0], [1, 0], [0, 1]], dtype=np.int8))
    q = AttestedMultiLabelQuestion(
        key="language",
        prompt="",
        matrix=matrix,
        labels=["Italian", "French"],
        has_data=np.array([True, True, True]),
        noise=0.05,
        coverage=np.array([0.57, 0.90, 0.57]),  # row 0 thinly attested, row 1 thickly
    )
    thin, thick, _ = q.likelihood(1)  # the reader answers French; rows 0-1 lack it
    assert thick < thin
    assert thin > 0 and thick > 0


def test_missing_label_is_damped_less_for_a_common_language():
    """Absence spread by prevalence, not flat.

    Answering Italian must eliminate less than answering a rare language does:
    an unrecorded printing is far likelier to have been Italian in the first
    place. A flat floor throws exactly this discrimination away.
    """
    import scipy.sparse as sp

    from quackinator.engine.questions import AttestedMultiLabelQuestion

    # 'common' is carried by 9 rows, 'rare' by 1; the last row carries neither.
    rows = np.zeros((11, 3), dtype=np.int8)
    rows[:9, 0] = 1
    rows[9, 1] = 1
    q = AttestedMultiLabelQuestion(
        key="language",
        prompt="",
        matrix=sp.csr_matrix(rows),
        labels=["common", "rare", "unused"],
        has_data=np.array([True] * 10 + [False]),
        noise=0.05,
        coverage=np.full(11, 0.57),
    )
    absent_common = q.likelihood(0)[9]  # row 9 lacks 'common'
    absent_rare = q.likelihood(1)[0]  # row 0 lacks 'rare'
    assert absent_common > absent_rare


def test_unreliable_character_cells_partition_the_belief():
    """`moments` and `categories` must agree once weak cells are in play.

    `moments` reaches the absent category by subtraction rather than by building
    the partition, so the two have to be checked against each other.
    """
    import scipy.sparse as sp

    from quackinator.engine.questions import BinaryFamily

    rng = np.random.default_rng(11)
    n, f = 300, 6
    carried = rng.random((n, f)) < 0.3
    has_data = np.asarray(carried.any(axis=1))
    carried[~has_data] = False
    # Weak is a subset of what is carried, per the ETL.
    weak = carried & (rng.random((n, f)) < 0.35)

    family = BinaryFamily(
        family="char",
        prompt_template="{name}?",
        matrix=sp.csr_matrix(carried.astype(np.int8)),
        labels=[str(i) for i in range(f)],
        has_data=has_data,
        weak=sp.csr_matrix(weak.astype(np.int8)),
        confusion=info.binary_confusion(0.05),
    )

    w = rng.random(n)
    w /= w.sum()
    A, S = family.moments(Belief.over(w))
    assert A.shape == (f, 4)
    assert A.sum(axis=1) == pytest.approx(np.ones(f))
    for j in range(f):
        cats = family.categories(j)
        for k in range(4):
            assert A[j, k] == pytest.approx(w[cats == k].sum())
            assert S[j, k] == pytest.approx(info.safe_xlogx(w)[cats == k].sum())


def test_a_cameo_is_not_scored_as_a_missed_sighting():
    """A weak cell must not push a candidate down when the reader says "no"."""
    import scipy.sparse as sp

    from quackinator.engine.questions import BinaryFamily

    carried = np.array([[1], [1], [0]], dtype=np.int8)
    # Row 0 carries the character properly; row 1 carries it only as a cameo.
    weak = np.array([[0], [1], [0]], dtype=np.int8)
    family = BinaryFamily(
        family="char",
        prompt_template="{name}?",
        matrix=sp.csr_matrix(carried),
        labels=["x"],
        has_data=np.array([True, True, True]),
        weak=sp.csr_matrix(weak),
        confusion=info.binary_confusion(0.05),
    )
    cats = family.categories(0)
    assert list(cats) == [0, 3, 1]
    # Answering "no" (answer index 1) barely touches the cameo row, while it
    # damps the row that really carries the character by the full noise floor.
    no = family.confusion[1]
    assert no[cats[0]] == pytest.approx(0.05)
    assert no[cats[1]] == pytest.approx(0.5)
    assert no[cats[2]] == pytest.approx(0.95)
