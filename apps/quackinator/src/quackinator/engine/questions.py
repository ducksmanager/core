"""The question bank.

Only things a reader can check in the magazine they hold. No author, artist,
original year or subseries: a reprint doesn't show them.
"""

from __future__ import annotations

from collections.abc import Callable, Iterator
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, ClassVar, NamedTuple, Protocol, Self

import numpy as np
import scipy.sparse as sp

from quackinator.engine import information as info
from quackinator.engine.belief import Belief
from quackinator.index.model import UNKNOWN, StoryIndex

if TYPE_CHECKING:
    from quackinator.config import Settings


class Text(str):
    """English text that also keeps its template `id` and `params` for translation.

    Names and plot terms are always params, never part of the id.
    """

    id: str
    params: dict[str, str]

    def __new__(cls, id: str, **params: str) -> Self:
        text = super().__new__(cls, id.format(**params))
        text.id = id
        text.params = params
        return text


class Bucket(NamedTuple):
    """One step on an ordered scale.

    `low`/`high` are the bare numbers used by `range_label` when steps are merged;
    the open step at either end leaves its outer one empty.
    """

    lo: int
    hi: int
    label: str
    low: str = ""
    high: str = ""


# In tenths of a page (see `model.PAGE_SCALE`): many stories are shorter than a page.
PAGE_BUCKETS: list[Bucket] = [
    Bucket(1, 4, Text("less than half a page"), high="½"),
    Bucket(5, 7, Text("about half a page"), low="½", high="¾"),
    Bucket(8, 12, Text("1 page"), "1", "1"),
    Bucket(13, 17, Text("1½ pages"), "1½", "1½"),
    Bucket(18, 22, Text("2 pages"), "2", "2"),
    Bucket(23, 27, Text("2½ pages"), "2½", "2½"),
    Bucket(28, 34, Text("3 pages"), "3", "3"),
    Bucket(35, 44, Text("4 pages"), "4", "4"),
    Bucket(45, 54, Text("5 pages"), "5", "5"),
    Bucket(55, 64, Text("6 pages"), "6", "6"),
    Bucket(65, 84, Text("7-8 pages"), "7", "8"),
    Bucket(85, 104, Text("9-10 pages"), "9", "10"),
    Bucket(105, 144, Text("11-14 pages"), "11", "14"),
    Bucket(145, 204, Text("15-20 pages"), "15", "20"),
    Bucket(205, 304, Text("21-30 pages"), "21", "30"),
    Bucket(305, 99999, Text("more than 30 pages"), low="31"),
]

PANEL_BUCKETS: list[Bucket] = [
    Bucket(1, 4, Text("up to 4"), high="4"),
    Bucket(5, 8, Text("5-8"), "5", "8"),
    Bucket(9, 12, Text("9-12"), "9", "12"),
    Bucket(13, 20, Text("13-20"), "13", "20"),
    Bucket(21, 40, Text("21-40"), "21", "40"),
    Bucket(41, 80, Text("41-80"), "41", "80"),
    Bucket(81, 999999, Text("more than 80"), low="81"),
]

SMALL_INT_BUCKETS: list[Bucket] = [
    Bucket(1, 1, Text("1"), "1", "1"),
    Bucket(2, 2, Text("2"), "2", "2"),
    Bucket(3, 3, Text("3"), "3", "3"),
    Bucket(4, 4, Text("4"), "4", "4"),
    Bucket(5, 5, Text("5"), "5", "5"),
    Bucket(6, 999999, Text("6 or more"), low="6"),
]


def _counted(template: str, n: str, unit: str) -> str:
    """`template` followed by the unit, singular for "1"."""
    if not unit:
        return template
    return f"{template} {unit[:-1] if n == '1' else unit}"


def range_label(buckets: list[Bucket], first: int, last: int, unit: str) -> Text:
    """Label for the merged span `first..last` of an ordered scale."""
    if first == last:
        label = buckets[first].label
        return label if isinstance(label, Text) else Text(label)
    # An open end has no number of its own, so name it after its neighbour.
    if first == 0:
        n = buckets[last + 1].low
        return Text(_counted("less than {count}", n, unit), count=n)
    if last == len(buckets) - 1:
        n = buckets[first - 1].high
        return Text(_counted("more than {count}", n, unit), count=n)
    low, high = buckets[first].low, buckets[last].high
    return Text(_counted("{low}-{high}", high, unit), low=low, high=high)


def bucketize(values: np.ndarray, buckets: list[Bucket]) -> np.ndarray:
    """Map raw values to bucket ids; unknown values get the trailing category."""
    out = np.full(values.shape, len(buckets), dtype=np.int16)
    for k, bucket in enumerate(buckets):
        out[(values >= bucket.lo) & (values <= bucket.hi)] = k
    out[values == UNKNOWN] = len(buckets)
    return out


class ColumnView:
    """A CSR matrix plus a lazily built CSC copy.

    CSR is fast for scoring all columns at once, CSC for pulling one column.
    """

    __slots__ = ("_csc", "matrix")

    def __init__(self, matrix: sp.csr_matrix) -> None:
        self.matrix = matrix
        self._csc: sp.csc_matrix | None = None

    def column(self, j: int) -> np.ndarray:
        """Row indices of the candidates carrying column `j`."""
        if self._csc is None:
            self._csc = self.matrix.tocsc()
        start, end = self._csc.indptr[j], self._csc.indptr[j + 1]
        return self._csc.indices[start:end]


class Question(Protocol):
    """One thing the reader can be asked."""

    @property
    def key(self) -> str:
        """Stable identity, so a question is never asked twice."""
        ...

    @property
    def costs_turn(self) -> bool:
        """False for answers the reader volunteers, like the author box."""
        ...

    @property
    def prompt(self) -> str: ...

    @property
    def options(self) -> list[str]: ...

    @property
    def subject(self) -> str | None:
        """Inducks code of what the question is about (a character), else None."""
        ...

    @property
    def group(self) -> str:
        """Questions sharing a group share the skip penalty; see `Session.answer_rate`."""
        ...

    def likelihood(self, answer: int) -> np.ndarray:
        """(N,) probability the reader gives `answer` for each candidate. Never zero."""
        ...

    def gain(self, belief: Belief) -> float:
        """Expected information from asking this, in nats."""
        ...

    def condense(self, w: np.ndarray, max_options: int) -> Question:
        """Self, or a copy showing at most `max_options` answers."""
        ...

    def value_option(self, value: int) -> int | None:
        """The uncondensed option a raw value (page count, year) answers, if any."""
        ...


@dataclass
class CategoricalQuestion:
    """A question over an ordered scale of buckets; one option per bucket.

    Ordered so that miscounts land on neighbouring buckets.
    """

    key: str
    prompt: str
    buckets: list[Bucket]
    assign: np.ndarray  # (N,) bucket id; last category == unknown
    confusion: np.ndarray  # (n_answers, n_categories + 1)
    noise: float = 0.05
    # Plural noun for merged range labels ("pages"); empty if the prompt carries it.
    unit: str = ""
    # Chance the indexed value describes a different printing than the reader's.
    mismatch: float = 0.0
    costs_turn: bool = True
    subject: ClassVar[str | None] = None

    @property
    def options(self) -> list[str]:
        return [bucket.label for bucket in self.buckets]

    @property
    def group(self) -> str:
        return self.key

    @property
    def n_categories(self) -> int:
        return len(self.buckets)

    def value_option(self, value: int) -> int | None:
        """Which bucket a raw value falls in, or None if off the scale.

        Uses the uncondensed buckets: condensed option indices change every turn.
        """
        for k, bucket in enumerate(self.buckets):
            if bucket.lo <= value <= bucket.hi:
                return k
        return None

    def moments(self, belief: Belief) -> tuple[np.ndarray, np.ndarray]:
        k = self.n_categories + 1
        assign = self.assign
        A = np.bincount(assign, weights=belief.w, minlength=k)[:k]
        S = np.bincount(assign, weights=belief.wlogw, minlength=k)[:k]
        return A.reshape(1, k), S.reshape(1, k)

    def likelihood(self, answer: int) -> np.ndarray:
        return self.confusion[answer][self.assign]

    def gain(self, belief: Belief) -> float:
        A, S = self.moments(belief)
        return float(info.expected_information_gain(A, S, self.confusion, belief.entropy)[0])

    def groups(self, w: np.ndarray, max_options: int) -> list[tuple[int, int]]:
        """Spans of neighbouring buckets to show as single options.

        Repeatedly merges the adjacent pair holding the least belief, so
        resolution stays where the likely candidates are.
        """
        mass = np.bincount(self.assign, weights=w, minlength=self.n_categories + 1)
        spans = [(k, k) for k in range(self.n_categories)]
        held = list(mass[: self.n_categories])
        while len(spans) > max_options:
            pairs = [held[i] + held[i + 1] for i in range(len(spans) - 1)]
            i = int(np.argmin(pairs))
            spans[i : i + 2] = [(spans[i][0], spans[i + 1][1])]
            held[i : i + 2] = [pairs[i]]
        return spans

    def condense(self, w: np.ndarray, max_options: int) -> CategoricalQuestion:
        """The same scale with neighbours merged to fit `max_options`.

        Merges rather than drops buckets, so every value stays answerable.
        """
        # Open ends need a neighbour to be named by.
        max_options = max(max_options, 2)
        if self.n_categories <= max_options:
            return self

        spans = self.groups(w, max_options)
        remap = np.empty(self.n_categories + 1, dtype=np.int16)
        for g, (first, last) in enumerate(spans):
            remap[first : last + 1] = g
        remap[self.n_categories] = len(spans)  # unknown stays last

        return CategoricalQuestion(
            key=self.key,
            prompt=self.prompt,
            buckets=[
                Bucket(
                    lo=self.buckets[first].lo,
                    hi=self.buckets[last].hi,
                    label=range_label(self.buckets, first, last, self.unit),
                    low=self.buckets[first].low,
                    high=self.buckets[last].high,
                )
                for first, last in spans
            ],
            assign=remap[self.assign],
            confusion=info.merged_confusion(
                spans, self.n_categories, self.noise, mismatch=self.mismatch
            ),
            noise=self.noise,
            unit=self.unit,
            mismatch=self.mismatch,
            costs_turn=self.costs_turn,
        )


@dataclass
class MultiLabelQuestion:
    """Single-choice question where each candidate can carry several labels.

    E.g. a story printed in several decades. The F columns of `matrix` are the
    answers to this one question.
    """

    key: str
    prompt: str
    matrix: sp.csr_matrix  # (N, F) boolean membership
    labels: list[str]
    has_data: np.ndarray  # (N,) bool
    noise: float
    # (N, F): answer impossible for this candidate regardless of `matrix`
    # (a magazine cannot predate the story).
    ruled_out: sp.csr_matrix | None = None
    # Probability of an answer that is ruled out: a data error, small but never zero.
    impossible: float = 0.0
    costs_turn: bool = True
    # Maps a raw value (a year) to its label (a decade); see `value_option`.
    value_label: Callable[[int], str] | None = None
    subject: ClassVar[str | None] = None
    prevalence: np.ndarray = field(init=False, repr=False)
    _carries: ColumnView = field(init=False, repr=False, compare=False)
    _ruled: ColumnView = field(init=False, repr=False, compare=False)

    def __post_init__(self) -> None:
        n = max(self.matrix.shape[0], 1)
        self.prevalence = np.asarray(self.matrix.sum(axis=0)).ravel() / n
        self._carries = ColumnView(self.matrix)
        # A recorded printing wins over the ruled-out bound when they disagree.
        if self.ruled_out is not None:
            overlap = self.ruled_out.multiply(self.matrix)
            ruled_only = (self.ruled_out - overlap).tocsr()
            # Required: `column()` reads `indices` and would count stored zeros.
            ruled_only.eliminate_zeros()
        else:
            ruled_only = sp.csr_matrix(self.matrix.shape)
        self._ruled = ColumnView(ruled_only)

    @property
    def options(self) -> list[str]:
        return self.labels

    def value_option(self, value: int) -> int | None:
        """Which label a raw value maps to, or None."""
        if self.value_label is None:
            return None
        label = self.value_label(value)
        try:
            return self.labels.index(label)
        except ValueError:
            return None

    @property
    def group(self) -> str:
        return self.key

    @property
    def hi(self) -> float:
        """Probability the reader names a label the candidate carries."""
        return 1.0 - self.noise

    @property
    def lo(self) -> float:
        """Probability the reader names a label the candidate doesn't carry."""
        return self.noise

    @property
    def neutral(self) -> np.ndarray:
        """Probability the reader names each label for a candidate with no data.

        A prevalence-weighted average, so unindexed candidates are neither
        favoured nor punished.
        """
        return self.hi * self.prevalence + self.lo * (1.0 - self.prevalence)

    @property
    def confusion(self) -> np.ndarray:
        """(F, 4) probability of answer f per category (see `categories`)."""
        F = self.matrix.shape[1]
        return np.column_stack(
            [
                np.full(F, self.hi),
                np.full(F, self.lo),
                np.full(F, self.impossible),
                self.neutral,
            ]
        )

    def categories(self, answer: int) -> np.ndarray:
        """Per candidate: 0 carries it, 1 carries others, 2 ruled out, 3 no data.

        Ruled out overrides "no data"; carrying overrides ruled out.
        """
        cat = np.where(self.has_data, 1, 3).astype(np.int8)
        cat[self._ruled.column(answer)] = 2
        cat[self._carries.column(answer)] = 0
        return cat

    def likelihood(self, answer: int) -> np.ndarray:
        cat = self.categories(answer)
        table = np.array([self.hi, self.lo, self.impossible, self.neutral[answer]])
        return table[cat]

    def moments(self, belief: Belief) -> tuple[np.ndarray, np.ndarray]:
        stacked = belief.stacked
        present = self.matrix.T @ stacked  # (F, 2)
        ruled_matrix = self._ruled.matrix
        ruled = ruled_matrix.T @ stacked  # (F, 2)
        unknown = ~self.has_data
        # A candidate with no data can still be ruled out, so this varies per answer.
        unknown_ruled = ruled_matrix.T @ np.where(unknown[:, None], stacked, 0.0)
        A_unknown = float(stacked[unknown, 0].sum())
        S_unknown = float(stacked[unknown, 1].sum())
        total_S = belief.log_mass

        F = self.matrix.shape[1]
        A = np.empty((F, 4), dtype=np.float64)
        S = np.empty((F, 4), dtype=np.float64)
        A[:, 0], S[:, 0] = present[:, 0], present[:, 1]
        A[:, 2], S[:, 2] = ruled[:, 0], ruled[:, 1]
        A[:, 3] = np.maximum(A_unknown - unknown_ruled[:, 0], 0.0)
        S[:, 3] = S_unknown - unknown_ruled[:, 1]
        # Clamp A against float cancellation; S (sum of w*log w) is legitimately
        # negative and must not be clamped.
        A[:, 1] = np.maximum(belief.mass - A[:, 0] - A[:, 2] - A[:, 3], 0.0)
        S[:, 1] = total_S - S[:, 0] - S[:, 2] - S[:, 3]
        return A, S

    def gain(self, belief: Belief) -> float:
        A, S = self.moments(belief)
        return info.set_valued_information_gain(A, S, self.confusion, belief.entropy)

    def condense(self, w: np.ndarray, max_options: int) -> MultiLabelQuestion:
        return self


@dataclass
class AttestedMultiLabelQuestion:
    """Like `MultiLabelQuestion`, but a missing label counts less when records are thin.

    `coverage[i]` is the probability the records would have caught a label
    candidate i really has. When they might have missed it, a common label is
    the likelier miss, so that share is spread by `prevalence`.
    """

    key: str
    prompt: str
    matrix: sp.csr_matrix  # (N, F) boolean membership
    labels: list[str]
    has_data: np.ndarray  # (N,) bool
    noise: float
    coverage: np.ndarray  # (N,)
    # Answered through an autocomplete box, never offered as a question.
    costs_turn: bool = False
    subject: ClassVar[str | None] = None
    prevalence: np.ndarray = field(init=False, repr=False)
    _carries: ColumnView = field(init=False, repr=False, compare=False)
    _levels: np.ndarray = field(init=False, repr=False, compare=False)
    _level_of: np.ndarray = field(init=False, repr=False, compare=False)

    def __post_init__(self) -> None:
        n = max(self.matrix.shape[0], 1)
        self.prevalence = np.asarray(self.matrix.sum(axis=0)).ravel() / n
        self._carries = ColumnView(self.matrix)
        # Each distinct coverage value adds a category (and a matvec in `moments`).
        self._levels, self._level_of = np.unique(self.coverage, return_inverse=True)

    @property
    def options(self) -> list[str]:
        return self.labels

    def value_option(self, value: int) -> int | None:
        return None

    @property
    def group(self) -> str:
        return self.key

    @property
    def hi(self) -> float:
        """Probability the reader names a label the candidate carries."""
        return 1.0 - self.noise

    @property
    def absent(self) -> np.ndarray:
        """(F, L) probability the reader names label f, not carried, at coverage level l."""
        missed = np.outer(self.prevalence, 1.0 - self._levels)  # (F, L)
        return np.minimum(missed + self.noise, self.hi)

    @property
    def neutral(self) -> np.ndarray:
        """Probability the reader names each label for a candidate with no data."""
        return self.hi * self.prevalence + self.noise * (1.0 - self.prevalence)

    @property
    def confusion(self) -> np.ndarray:
        """(F, L + 2) probability of answer f per category (see `categories`)."""
        F = self.matrix.shape[1]
        return np.column_stack([np.full(F, self.hi), self.absent, self.neutral])

    def categories(self, answer: int) -> np.ndarray:
        """Per candidate: 0 carries it, 1..L absent at each coverage level, L+1 no data."""
        last = len(self._levels) + 1
        cat = np.where(self.has_data, 1 + self._level_of, last).astype(np.int8)
        cat[self._carries.column(answer)] = 0
        return cat

    def likelihood(self, answer: int) -> np.ndarray:
        cat = self.categories(answer)
        table = np.concatenate([[self.hi], self.absent[answer], [self.neutral[answer]]])
        return table[cat]

    def moments(self, belief: Belief) -> tuple[np.ndarray, np.ndarray]:
        stacked = belief.stacked
        matrix = self.matrix
        present = matrix.T @ stacked  # (F, 2)
        has_data = self.has_data
        unknown = ~has_data

        F = self.matrix.shape[1]
        L = len(self._levels)
        A = np.empty((F, L + 2), dtype=np.float64)
        S = np.empty((F, L + 2), dtype=np.float64)
        A[:, 0], S[:, 0] = present[:, 0], present[:, 1]
        A[:, L + 1] = float(stacked[unknown, 0].sum())
        S[:, L + 1] = float(stacked[unknown, 1].sum())
        # Absent at level k = level k's mass minus what carries the answer.
        # Carrying implies has_data, so the categories partition the belief.
        level_of = self._level_of
        for k in range(L):
            rows = has_data & (level_of == k)
            level = np.where(rows[:, None], stacked, 0.0)
            carried = matrix.T @ level  # (F, 2)
            A[:, 1 + k] = np.maximum(float(stacked[rows, 0].sum()) - carried[:, 0], 0.0)
            S[:, 1 + k] = float(stacked[rows, 1].sum()) - carried[:, 1]
        return A, S

    def gain(self, belief: Belief) -> float:
        A, S = self.moments(belief)
        return info.set_valued_information_gain(A, S, self.confusion, belief.entropy)

    def condense(self, w: np.ndarray, max_options: int) -> AttestedMultiLabelQuestion:
        """Self: the reader types a name, `Engine.search_creators` bounds the list."""
        return self


@dataclass
class BinaryFamily:
    """Many yes/no questions sharing one sparse feature matrix.

    Scoring the whole family costs two sparse matrix products, however many
    columns it has.
    """

    family: str
    prompt_template: str
    matrix: sp.csr_matrix  # (N, F) boolean
    labels: list[str]
    has_data: np.ndarray  # (N,) bool
    confusion: np.ndarray
    # Carried cells the reader can't be expected to confirm (cameo, photo,
    # one-time appearance). Subset of `matrix`.
    weak: sp.csr_matrix | None = None
    # Stable per-column codes; `labels` are display names that change with
    # `desc_language`. None when columns aren't entities (plot terms).
    codes: list[str] | None = None
    options: list[str] = field(default_factory=lambda: [Text("Yes"), Text("No")])
    _carries: ColumnView = field(init=False, repr=False, compare=False)
    _weak_view: ColumnView | None = field(init=False, default=None, repr=False, compare=False)
    _feature_of: dict[str, int] = field(init=False, default_factory=dict, repr=False, compare=False)

    def __post_init__(self) -> None:
        self._carries = ColumnView(self.matrix)
        if self.weak is not None and self.weak.nnz:
            self._weak_view = ColumnView(sp.csr_matrix(self.weak))
        identity = self.codes if self.codes is not None else self.labels
        self._feature_of = {name: i for i, name in enumerate(identity)}

    def feature_of(self, code: str) -> int | None:
        """The column for a stable code, or None if this index no longer has it.

        Use this, not `key`, for anything stored across sessions: keys are
        built from display labels, which change with the index language.
        """
        return self._feature_of.get(code)

    def members(self, feature: int) -> np.ndarray:
        """Row indices of candidates carrying this feature."""
        return self._carries.column(feature)

    def categories(self, feature: int) -> np.ndarray:
        """Per-candidate category: 0 present, 1 absent, 2 not indexed, 3 weak."""
        cat = np.where(self.has_data, 1, 2).astype(np.int8)
        cat[self.members(feature)] = 0
        if self._weak_view is not None:
            cat[self._weak_view.column(feature)] = 3
        return cat

    def moments(self, belief: Belief) -> tuple[np.ndarray, np.ndarray]:
        stacked = belief.stacked  # (rows, 2)
        present = self.matrix.T @ stacked  # (F, 2)
        unknown = ~self.has_data
        A_unknown = float(stacked[unknown, 0].sum())
        S_unknown = float(stacked[unknown, 1].sum())
        total_S = belief.log_mass

        F = self.matrix.shape[1]
        A = np.empty((F, 4), dtype=np.float64)
        S = np.empty((F, 4), dtype=np.float64)
        A[:, 0], S[:, 0] = present[:, 0], present[:, 1]
        A[:, 2], S[:, 2] = A_unknown, S_unknown
        # Weak cells are part of `matrix`, so they come out of "present".
        A[:, 3] = 0.0
        S[:, 3] = 0.0
        if self.weak is not None and self.weak.nnz:
            weak = self.weak.T @ stacked
            A[:, 0] -= weak[:, 0]
            S[:, 0] -= weak[:, 1]
            A[:, 3], S[:, 3] = weak[:, 0], weak[:, 1]
        # See MultiLabelQuestion.moments on why A is clamped and S is not.
        A[:, 1] = np.maximum(belief.mass - A[:, 0] - A[:, 2] - A[:, 3], 0.0)
        S[:, 1] = total_S - S[:, 0] - S[:, 2] - S[:, 3]
        return A, S

    def gains(self, belief: Belief) -> np.ndarray:
        """(F,) expected gain for every question in the family."""
        A, S = self.moments(belief)
        return info.expected_information_gain(A, S, self.confusion, belief.entropy)

    def best(self, belief: Belief, asked: set[str]) -> tuple[BinaryQuestion, float] | None:
        """The most informative question in the family that has not been asked."""
        gains = self.gains(belief)
        for i, label in enumerate(self.labels):
            if f"{self.family}:{label}" in asked:
                gains[i] = -np.inf
        feature = int(np.argmax(gains))
        gain = float(gains[feature])
        if gain == -np.inf:
            return None
        return BinaryQuestion(family=self, feature=feature), gain


@dataclass(frozen=True)
class BinaryQuestion:
    """One yes/no question: a lightweight view onto a column of a `BinaryFamily`."""

    family: BinaryFamily
    feature: int

    @property
    def key(self) -> str:
        return f"{self.family.family}:{self.family.labels[self.feature]}"

    @property
    def prompt(self) -> str:
        return Text(self.family.prompt_template, name=self.family.labels[self.feature])

    @property
    def options(self) -> list[str]:
        return list(self.family.options)

    @property
    def subject(self) -> str | None:
        if self.family.codes is None:
            return None
        return self.family.codes[self.feature]

    @property
    def group(self) -> str:
        """The family: a reader who can't answer one usually can't answer the others."""
        return self.family.family

    @property
    def costs_turn(self) -> bool:
        return True

    def likelihood(self, answer: int) -> np.ndarray:
        return self.family.confusion[answer][self.family.categories(self.feature)]

    def gain(self, belief: Belief) -> float:
        # Scores the whole family; the selector uses `BinaryFamily.best` instead.
        return float(self.family.gains(belief)[self.feature])

    def condense(self, w: np.ndarray, max_options: int) -> BinaryQuestion:
        return self

    def value_option(self, value: int) -> int | None:
        return None


@dataclass
class QuestionBank:
    """Everything the engine can ask.

    `singles` are scored one by one; each `BinaryFamily` is scored in bulk and
    contributes only its best question.
    """

    singles: list[Question] = field(default_factory=list)
    families: list[BinaryFamily] = field(default_factory=list)

    def candidates(
        self,
        belief: Belief,
        asked: set[str],
        max_options: int,
    ) -> Iterator[tuple[Question, float]]:
        """Every askable question, condensed as it will be shown, with its gain.

        Skips questions that cost no turn; those are reached via `by_key`.
        """
        for question in self.singles:
            if not question.costs_turn or question.key in asked:
                continue
            # Condensing changes the gain, so score the condensed version.
            shown = question.condense(belief.w, max_options)
            yield shown, shown.gain(belief)

        for family in self.families:
            found = family.best(belief, asked)
            if found is not None:
                yield found

    def by_key(self, key: str) -> Question | None:
        """The single question with this key, whether or not it is ever offered."""
        return next((q for q in self.singles if q.key == key), None)

    def family_question(self, family: str, code: str) -> BinaryQuestion | None:
        """A family question by its subject's stable code, for replaying stored answers.

        None if the family or code is gone from this index, so a replay can drop it.
        """
        for fam in self.families:
            if fam.family != family:
                continue
            feature = fam.feature_of(code)
            return None if feature is None else BinaryQuestion(family=fam, feature=feature)
        return None


def decade_question(
    index: StoryIndex, noise: float, impossible: float
) -> MultiLabelQuestion | None:
    """ "What decade was the magazine published in?"

    Decades are ruled out before the story's first publication, which keeps
    readers whose issue Inducks lacks from being penalised. See README § decade.
    """
    if not index.decade_starts or index.decade.shape[1] == 0:
        return None

    starts = np.asarray(index.decade_starts, dtype=np.int32)
    first = index.first_decade()
    known = first != UNKNOWN
    impossible_mask = known[:, None] & (first[:, None] > starts[None, :])
    return MultiLabelQuestion(
        key="decade",
        prompt=Text("What decade was the magazine published in?"),
        matrix=index.decade,
        labels=[Text("{decade}s", decade=str(s)) for s in index.decade_starts],
        has_data=index.has_decade,
        noise=noise,
        ruled_out=sp.csr_matrix(impossible_mask.astype(np.int8)),
        impossible=impossible,
        value_label=lambda year: f"{(year // 10) * 10}s",
    )


def creator_question(index: StoryIndex, cfg: Settings) -> AttestedMultiLabelQuestion | None:
    """ "Whose name is printed on the story's first page?"

    Volunteered by the reader, never offered (`costs_turn` is False).
    """
    if index.creator.shape[1] == 0 or not index.creator_names:
        return None
    return AttestedMultiLabelQuestion(
        key="creator",
        prompt=Text("Whose name is printed on the story's first page?"),
        matrix=index.creator,
        labels=list(index.creator_names),
        has_data=index.has_creator,
        noise=cfg.noise_floor,
        # Flat: reprints don't make authorship better recorded.
        coverage=np.full(index.n_items, cfg.creator_coverage),
    )


# Covers have unknown layout, so cover sessions never ask these.
LAYOUT_KEYS = frozenset({"pages", "rows", "cols", "panels"})


def build_bank(index: StoryIndex, cfg: Settings) -> QuestionBank:
    noise = cfg.noise_floor
    # The index records the layout of *some* printing of the story, not
    # necessarily the reader's.
    layout_mismatch = cfg.layout_mismatch
    panel_noise = min(noise * 3, 0.4)

    def layout_question(
        key: str,
        prompt: str,
        column: np.ndarray,
        buckets: list[Bucket],
        question_noise: float,
        unit: str = "",
    ) -> CategoricalQuestion:
        return CategoricalQuestion(
            key=key,
            prompt=prompt,
            buckets=buckets,
            assign=bucketize(column, buckets),
            confusion=info.banded_confusion(len(buckets), question_noise, mismatch=layout_mismatch),
            noise=question_noise,
            unit=unit,
            mismatch=layout_mismatch,
        )

    categorical: list[CategoricalQuestion] = [
        layout_question(
            "pages",
            Text("How long is the story?"),
            index.page_tenths,
            PAGE_BUCKETS,
            noise * 0.5,
            unit="pages",
        ),
        layout_question(
            "rows",
            Text("How many rows (tiers) of panels are on a typical page?"),
            index.rows,
            SMALL_INT_BUCKETS,
            noise,
        ),
        layout_question(
            "cols",
            Text("How many panels are in a typical row?"),
            index.cols,
            SMALL_INT_BUCKETS,
            noise,
        ),
        layout_question(
            "panels",
            Text("Roughly how many panels does the story have in total?"),
            # estimatedpanels is itself an estimate in Inducks, so trust it less.
            index.panels,
            PANEL_BUCKETS,
            panel_noise,
        ),
    ]

    # No language question on purpose: Inducks often lacks the reader's printing
    # language, and nothing rules a language out. See README before re-adding.
    singles: list[Question] = [*categorical]

    decade = decade_question(index, cfg.decade_noise, cfg.decade_impossible)
    if decade is not None:
        singles.append(decade)

    creators = creator_question(index, cfg)
    if creators is not None:
        singles.append(creators)

    families = [
        BinaryFamily(
            family="char",
            prompt_template="Does {name} appear in the story?",
            matrix=index.char,
            labels=index.char_names,
            codes=index.char_codes,
            has_data=index.has_char,
            weak=index.char_weak,
            confusion=info.binary_confusion(noise, weak=cfg.char_weak_evidence),
        )
    ]
    if index.plot.shape[1] > 0:
        families.append(
            BinaryFamily(
                family="plot",
                prompt_template="Does the story involve {name}?",
                matrix=index.plot,
                labels=index.plot_terms,
                has_data=index.has_plot,
                # Word matches are a rough proxy for the concept, so noisier.
                confusion=info.binary_confusion(min(noise * 2.5, 0.3)),
            )
        )

    return QuestionBank(singles=singles, families=families)
