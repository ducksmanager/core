"""The question bank.

Everything a reader can check by turning the pages of the magazine in front of
them, and nothing else. Notably absent: author, artist, original publication
year and subseries — a reader holding a Dutch reprint cannot see any of them,
and the printed issue date is not the story's date.
"""

from __future__ import annotations

from collections.abc import Callable, Iterator
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, ClassVar, NamedTuple, Protocol

import numpy as np
import scipy.sparse as sp

from quackinator.engine import information as info
from quackinator.engine.belief import Belief
from quackinator.index.model import UNKNOWN, StoryIndex

if TYPE_CHECKING:
    from quackinator.config import Settings


class Bucket(NamedTuple):
    """One step on an ordered scale, and how to name it.

    `label` is what the reader sees when the step stands alone. `low` and `high`
    are the bare counts at its two ends, which `range_label` joins when
    neighbouring steps have to be merged into one option; the open step at
    either end of a scale leaves its outward-facing name empty, because "less
    than half a page" has no number below it.
    """

    lo: int
    hi: int
    label: str
    low: str = ""
    high: str = ""


# Ordered length buckets, in *tenths of a page* (see `model.PAGE_SCALE`). Exact
# for short stories, where one page is the whole difference between thousands of
# gags; coarse in the long tail.
#
# The bottom of the scale is the reason for the unit. 38% of the catalogue is
# shorter than a page — quarter-page and half-page strips whose entire length
# lives in `brokenpagenumerator/denominator` — and reading length in whole pages
# recorded every one of them as "length not known". Half-page steps stop at 2½:
# past that a reader cannot tell a 4-page story from a 4½-page one, and the
# buckets would only invite a miscount.
#
# Sixteen steps is more than a reader wants to read, so the scale is shown at
# whatever resolution fits `Settings.max_options` — see
# `CategoricalQuestion.condense`, which merges neighbours rather than dropping
# them, so that every length the reader can be holding stays answerable.
PAGE_BUCKETS: list[Bucket] = [
    Bucket(1, 4, "less than half a page", high="½"),
    Bucket(5, 7, "about half a page", low="½", high="¾"),
    Bucket(8, 12, "1 page", "1", "1"),
    Bucket(13, 17, "1½ pages", "1½", "1½"),
    Bucket(18, 22, "2 pages", "2", "2"),
    Bucket(23, 27, "2½ pages", "2½", "2½"),
    Bucket(28, 34, "3 pages", "3", "3"),
    Bucket(35, 44, "4 pages", "4", "4"),
    Bucket(45, 54, "5 pages", "5", "5"),
    Bucket(55, 64, "6 pages", "6", "6"),
    Bucket(65, 84, "7-8 pages", "7", "8"),
    Bucket(85, 104, "9-10 pages", "9", "10"),
    Bucket(105, 144, "11-14 pages", "11", "14"),
    Bucket(145, 204, "15-20 pages", "15", "20"),
    Bucket(205, 304, "21-30 pages", "21", "30"),
    Bucket(305, 99999, "more than 30 pages", low="31"),
]

PANEL_BUCKETS: list[Bucket] = [
    Bucket(1, 4, "up to 4", high="4"),
    Bucket(5, 8, "5-8", "5", "8"),
    Bucket(9, 12, "9-12", "9", "12"),
    Bucket(13, 20, "13-20", "13", "20"),
    Bucket(21, 40, "21-40", "21", "40"),
    Bucket(41, 80, "41-80", "41", "80"),
    Bucket(81, 999999, "more than 80", low="81"),
]

# Rows per page and panels per row: small enough to count exactly, so each value
# is its own bucket. The tail is open because a reader who says "6 or more" has
# stopped counting, not measured six.
SMALL_INT_BUCKETS: list[Bucket] = [
    Bucket(1, 1, "1", "1", "1"),
    Bucket(2, 2, "2", "2", "2"),
    Bucket(3, 3, "3", "3", "3"),
    Bucket(4, 4, "4", "4", "4"),
    Bucket(5, 5, "5", "5", "5"),
    Bucket(6, 999999, "6 or more", low="6"),
]


def _count(n: str, unit: str) -> str:
    """Render a bare count in the scale's unit: "4" -> "4 pages", "1" -> "1 page"."""
    if not unit:
        return n
    return f"{n} {unit[:-1] if n == '1' else unit}"


def range_label(buckets: list[Bucket], first: int, last: int, unit: str) -> str:
    """What to call the span `first..last` of an ordered scale, shown as one option."""
    if first == last:
        return buckets[first].label
    # An open end has no number of its own, so it is named by the step it stops
    # at rather than by its own edge.
    if first == 0:
        return f"less than {_count(buckets[last + 1].low, unit)}"
    if last == len(buckets) - 1:
        return f"more than {_count(buckets[first - 1].high, unit)}"
    return _count(f"{buckets[first].low}-{buckets[last].high}", unit)


def bucketize(values: np.ndarray, buckets: list[Bucket]) -> np.ndarray:
    """Map raw values to bucket ids; unknown values get the trailing category."""
    out = np.full(values.shape, len(buckets), dtype=np.int16)
    for k, bucket in enumerate(buckets):
        out[(values >= bucket.lo) & (values <= bucket.hi)] = k
    out[values == UNKNOWN] = len(buckets)
    return out


class ColumnView:
    """One sparse matrix, plus a lazily-built CSC view for pulling a column.

    CSR is right for scoring a whole family at once (`matrix.T @ w`), CSC for
    pulling the single column that applying one answer needs, so both are kept.
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
    """One thing the reader can be asked, and everything the engine needs of it.

    Four shapes implement this — an ordered scale, a set-valued single-select,
    a coverage-damped set-valued single-select, and one yes/no drawn out of a
    large family. They differ only in how they compute `likelihood` and `gain`;
    every caller — the selector, the session, the simulator — works through this
    interface and never asks which shape it is holding.
    """

    @property
    def key(self) -> str:
        """Stable identity, so a question is never asked twice."""
        ...

    @property
    def costs_turn(self) -> bool:
        """False for anything volunteered rather than asked. See `Session`."""
        ...

    @property
    def prompt(self) -> str:
        """What the reader is shown."""
        ...

    @property
    def options(self) -> list[str]:
        """The answers on offer, in the order the reader sees them."""
        ...

    @property
    def subject(self) -> str | None:
        """Stable code of the one thing being asked about, where there is one.

        A character question is about a character; a page count is about
        nothing nameable, and answers None. The client uses this to illustrate
        the question — so it is the Inducks code rather than the display name,
        which is language-dependent while a picture is not.
        """
        ...

    @property
    def group(self) -> str:
        """What this question shares a reader's patience with.

        A reader who cannot say whether their story "involves black" cannot say
        whether it "involves bringing" either — the plot bank is bare words
        lifted from description prose, and a word that names nothing they can
        look for is not an isolated accident. But that tells us nothing about
        whether they can count panels. So skips are pooled per group, and the
        selector damps a group the reader keeps declining: see
        `Session.answer_rate`.

        A family is one group, because its questions fail together. Everything
        else is its own, which costs nothing — a single question is asked at
        most once, so it never accumulates a history to be damped by.
        """
        ...

    def likelihood(self, answer: int) -> np.ndarray:
        """(N,) P(reader gives this answer | candidate i is their story).

        Strictly positive everywhere, so no single answer can eliminate a
        candidate outright.
        """
        ...

    def gain(self, belief: Belief) -> float:
        """Expected bits — in nats — from asking this, under `belief`."""
        ...

    def condense(self, w: np.ndarray, max_options: int) -> Question:
        """Self, or a copy showing at most `max_options` answers."""
        ...

    def value_option(self, value: int) -> int | None:
        """Which option a raw measurement answers, for a caller holding one.

        A host driving this engine may already know what the reader would have
        to count — Dumili holds the story's page length and the magazine's year
        in its own database. Questions whose answers are quantities can take
        that directly; the rest answer None, as does any value off the scale.

        Always resolved against the uncondensed question. Condensing is a
        function of the live belief, so an option index is only meaningful on
        the turn it was shown.
        """
        ...


@dataclass
class CategoricalQuestion:
    """A single question over an ordered scale of buckets.

    Ordered because every one of these counts something the reader can miscount,
    so the confusion is banded. Anything unordered or set-valued is a
    `MultiLabelQuestion` instead — see its docstring for why a partition was the
    wrong shape for language.

    The buckets are the answers: the question shows one option per bucket, and
    `condense` produces a coarser copy of the same scale when there are more
    buckets than a reader should be shown.
    """

    key: str
    prompt: str
    buckets: list[Bucket]
    assign: np.ndarray  # (N,) bucket id; last category == unknown
    confusion: np.ndarray  # (n_answers, n_categories + 1)
    noise: float = 0.05
    # Plural noun the scale counts in ("pages"), for naming merged ranges. Empty
    # where the labels already read as bare counts and the prompt carries the
    # unit, as it does for rows and panels.
    unit: str = ""
    # Flat component for "the indexed value describes a different printing than
    # the one being read". Ordered questions only; see information._with_mismatch.
    mismatch: float = 0.0
    costs_turn: bool = True
    # A scale is not about a nameable thing; only `BinaryQuestion` has a subject.
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
        """Which option a raw measurement answers, or None if it is off the scale.

        For a caller that holds the number itself rather than a reader's pick —
        a page count read out of its own database, say. It resolves against the
        *uncondensed* scale on purpose: condensing merges neighbouring buckets
        by where the belief currently sits, so an option index only means
        anything on the turn it was shown, while a bucket id means the same
        thing for as long as the scale does.
        """
        for k, bucket in enumerate(self.buckets):
            if bucket.lo <= value <= bucket.hi:
                return k
        return None

    def moments(self, belief: Belief) -> tuple[np.ndarray, np.ndarray]:
        k = self.n_categories + 1
        assign = belief.take(self.assign)
        A = np.bincount(assign, weights=belief.ws, minlength=k)[:k]
        S = np.bincount(assign, weights=belief.wlogws, minlength=k)[:k]
        return A.reshape(1, k), S.reshape(1, k)

    def likelihood(self, answer: int) -> np.ndarray:
        return self.confusion[answer][self.assign]

    def gain(self, belief: Belief) -> float:
        A, S = self.moments(belief)
        # `moments` returns one row, so the family-wide form yields one gain.
        return float(info.expected_information_gain(A, S, self.confusion, belief.entropy)[0])

    def groups(self, w: np.ndarray, max_options: int) -> list[tuple[int, int]]:
        """Spans of neighbouring buckets to show as single options, cheapest first.

        Merging the neighbouring pair that holds the least belief, repeatedly,
        spends the resolution where the belief is: buckets carrying mass survive
        on their own, and the stretches nobody is in collapse into one range.
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
        """Show the same scale at a resolution that fits `max_options`.

        Sixteen lengths is more than a question a person wants to be asked, but
        an ordered scale cannot be shortened by keeping only the buckets that
        hold belief: that leaves holes in it. A reader with a three-page story
        was offered "1 page", "7-8 pages", "21-30 pages" and "Something else",
        and had to answer the bag — which is both a bad question and a weak
        answer, since the bag pools three pages with thirty. So the scale is
        coarsened instead of thinned, and every length stays answerable.
        """
        # Two options is the shortest question there is, and the open ends need
        # a neighbour to be named by.
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
    """One single-select question whose ground truth is a set, not a category.

    The reader picks exactly one option ("French"), but a candidate can carry
    several labels at once — `I TL 116-AP` was printed in nine languages. A
    `CategoricalQuestion` cannot express that: it partitions candidates, so the
    build had to pick one language per storyversion, and answering "French"
    correctly then eliminated every French printing whose storyversion happened
    to be printed more often in something else.

    Scoring reuses `BinaryFamily`'s two sparse matvecs; the difference is that
    the F columns are the *answers* to one question rather than F questions.
    """

    key: str
    prompt: str
    matrix: sp.csr_matrix  # (N, F) boolean membership
    labels: list[str]
    has_data: np.ndarray  # (N,) bool
    noise: float
    # (N, F) boolean: this answer is impossible for this candidate, on evidence
    # independent of `matrix`. Only the decade question uses it — a magazine
    # cannot print a story that does not exist yet — and it is what keeps the
    # question honest when the reader's issue is simply not in Inducks. See
    # `impossible` and `build_bank`.
    ruled_out: sp.csr_matrix | None = None
    # P(reader gives this answer | it is ruled out). A data error rather than a
    # reader error, so far below `noise` — but never zero, like everything else
    # in the engine.
    impossible: float = 0.0
    # Condense to the leading columns rather than to whatever currently holds
    # belief mass. The labels the reader can answer with certainty should not
    # move between sessions, and the caller orders the columns by prevalence.
    stable_order: bool = False
    # Overrides the global shortlist length. A list of languages is scanned, not
    # deliberated over, so it can afford to be longer than a list of buckets.
    max_options: int | None = None
    costs_turn: bool = True
    # How to name the label a raw measurement falls under, for a caller holding
    # the underlying quantity rather than a reader's pick — a year, where the
    # answers are decades. Set by whoever builds the question, because only they
    # know what the labels count; None where nothing outside can supply one.
    # See `value_option`.
    value_label: Callable[[int], str] | None = None
    # The subject is the answer the reader picks, not the question, so there is
    # nothing to illustrate up front.
    subject: ClassVar[str | None] = None
    # Derived in __post_init__, never passed in.
    prevalence: np.ndarray = field(init=False, repr=False)
    _carries: ColumnView = field(init=False, repr=False, compare=False)
    _ruled: ColumnView = field(init=False, repr=False, compare=False)

    def __post_init__(self) -> None:
        n = max(self.matrix.shape[0], 1)
        self.prevalence = np.asarray(self.matrix.sum(axis=0)).ravel() / n
        self._carries = ColumnView(self.matrix)
        # A recorded printing beats a derived bound: the two disagree on 0.02% of
        # rows, and where they do it is `firstpublicationdate` that is wrong.
        if self.ruled_out is not None:
            overlap = self.ruled_out.multiply(self.matrix)
            ruled_only = (self.ruled_out - overlap).tocsr()
            # Cancelled entries survive the subtraction as stored zeros, and
            # `categories` reads column membership off `indices` without looking
            # at the values — so they would read as ruled out.
            ruled_only.eliminate_zeros()
        else:
            ruled_only = sp.csr_matrix(self.matrix.shape)
        self._ruled = ColumnView(ruled_only)

    @property
    def options(self) -> list[str]:
        return self.labels

    def value_option(self, value: int) -> int | None:
        """Which option a raw measurement answers, or None if nothing matches.

        Resolves against the *uncondensed* label list, for the same reason
        `CategoricalQuestion.value_option` does: condensing drops the labels
        holding no belief, so an option index means nothing after the turn it
        was shown on.
        """
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
        """P(reader names this label | the candidate carries it)."""
        return 1.0 - self.noise

    @property
    def lo(self) -> float:
        """P(reader names this label | the candidate carries others, not it)."""
        return self.noise

    @property
    def neutral(self) -> np.ndarray:
        """P(reader names this label | nothing indexed for the candidate).

        The marginal over the two known cases, so an unindexed candidate is
        neither favoured over a match nor punished like a mismatch.
        """
        return self.hi * self.prevalence + self.lo * (1.0 - self.prevalence)

    @property
    def confusion(self) -> np.ndarray:
        """(F, 4) P(answer f | category), matching `categories` and `moments`."""
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
        """Per-candidate category for one answer.

        0 carries it, 1 carries others but not it, 2 ruled out, 3 nothing
        indexed. Assigned in that order of precedence, applied last-wins below:
        ruled-out overrides "nothing indexed" — the bound holds whether or not
        Inducks has the reader's printing — and carrying the label overrides
        being ruled out.
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
        present = belief.restrict(self.matrix).T @ stacked  # (F, 2)
        ruled_matrix = belief.restrict(self._ruled.matrix)
        ruled = ruled_matrix.T @ stacked  # (F, 2)
        unknown = ~belief.take(self.has_data)
        # A candidate with nothing indexed can still be ruled out, so the
        # "nothing indexed" mass is per answer, not a constant.
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
        # The "carries others, not this one" category falls out by subtraction.
        # A is clamped against float cancellation; S is a sum of w*log(w) terms
        # and is legitimately negative, so it must not be.
        A[:, 1] = np.maximum(belief.mass - A[:, 0] - A[:, 2] - A[:, 3], 0.0)
        S[:, 1] = total_S - S[:, 0] - S[:, 2] - S[:, 3]
        return A, S

    def gain(self, belief: Belief) -> float:
        # The columns are the answers to *one* question rather than F separate
        # questions, so the gains cannot be read off per column.
        A, S = self.moments(belief)
        return info.set_valued_information_gain(A, S, self.confusion, belief.entropy)

    def condense(self, w: np.ndarray, max_options: int) -> MultiLabelQuestion:
        """Keep the leading options; OR the rest into "Something else".

        Unlike an ordered scale, the dropped columns collapse cleanly: a
        candidate printed in a language nobody is being shown still genuinely
        matches "Something else", and one printed in both a kept and a dropped
        language matches either — which set membership expresses and a partition
        could not.
        """
        max_options = self.max_options or max_options
        if len(self.labels) <= max_options:
            return self

        if self.stable_order:
            keep = np.arange(max_options - 1)
        else:
            mass = np.asarray(self.matrix.T @ w).ravel()
            keep = np.sort(np.argsort(-mass)[: max_options - 1])
        other = np.ones(len(self.labels), dtype=bool)
        other[keep] = False
        dropped = np.flatnonzero(other)
        columns = self.matrix[:, keep]
        rest = (self.matrix[:, dropped].sum(axis=1) > 0).astype(np.int8)
        ruled = None
        if self.ruled_out is not None:
            # "Something else" is only impossible if *every* answer it stands for
            # is: the reader picking it means one of them was true.
            rest_ruled = (
                np.asarray(self.ruled_out[:, dropped].sum(axis=1)).ravel() == dropped.size
            ).astype(np.int8)
            ruled = sp.hstack(
                [self.ruled_out[:, keep], sp.csr_matrix(rest_ruled.reshape(-1, 1))],
                format="csr",
            )
        return MultiLabelQuestion(
            key=self.key,
            prompt=self.prompt,
            matrix=sp.hstack([columns, sp.csr_matrix(rest)], format="csr"),
            labels=[self.labels[i] for i in keep] + ["Something else"],
            has_data=self.has_data,
            noise=self.noise,
            ruled_out=ruled,
            impossible=self.impossible,
            stable_order=self.stable_order,
            costs_turn=self.costs_turn,
        )


@dataclass
class AttestedMultiLabelQuestion:
    """Set membership scored against how completely the set was ever observed.

    `MultiLabelQuestion` treats a label the candidate does not carry as evidence
    against it, at a flat `noise`. That is only fair when the records had a real
    chance of catching the label if it were true. They often did not: a story
    seen printed once is thinly attested, and its silence about a creator means
    much less than the silence of one seen printed thirty times.

    So absence is damped by two independent things rather than one:

    `coverage[i]` is P(these records would have caught the label if it held).
    The remaining `1 - coverage[i]` is the chance the records simply missed it,
    and in that case the missed label is likelier to have been a common one —
    so the mass is spread by `prevalence` rather than laid on flat. That
    discrimination is the whole point; a flat floor throws it away.

    Categories are per answer, as in `MultiLabelQuestion`, but the absent case
    splits into one category per distinct coverage level, which is what keeps
    the closed form closed. The author box passes a single level.
    """

    key: str
    prompt: str
    matrix: sp.csr_matrix  # (N, F) boolean membership
    labels: list[str]
    has_data: np.ndarray  # (N,) bool
    noise: float
    # (N,) P(the records for this candidate would have caught a label it holds).
    coverage: np.ndarray
    # The author box is an autocomplete over 30k names, not an option list, so
    # this question is never selected by gain and never costs a turn.
    costs_turn: bool = False
    # As in `MultiLabelQuestion`: the reader names the subject, so the question
    # itself has none.
    subject: ClassVar[str | None] = None
    # Derived in __post_init__, never passed in.
    prevalence: np.ndarray = field(init=False, repr=False)
    _carries: ColumnView = field(init=False, repr=False, compare=False)
    _levels: np.ndarray = field(init=False, repr=False, compare=False)
    _level_of: np.ndarray = field(init=False, repr=False, compare=False)

    def __post_init__(self) -> None:
        n = max(self.matrix.shape[0], 1)
        self.prevalence = np.asarray(self.matrix.sum(axis=0)).ravel() / n
        self._carries = ColumnView(self.matrix)
        # One category per distinct coverage value. In practice there is one —
        # authorship does not become better attested by being reprinted — so
        # this stays two matvecs unless a caller varies it per row.
        self._levels, self._level_of = np.unique(self.coverage, return_inverse=True)

    @property
    def options(self) -> list[str]:
        return self.labels

    def value_option(self, value: int) -> int | None:
        """None. A creator is named through the search box, not measured."""
        return None

    @property
    def group(self) -> str:
        return self.key

    @property
    def hi(self) -> float:
        """P(reader names this label | the candidate carries it)."""
        return 1.0 - self.noise

    @property
    def absent(self) -> np.ndarray:
        """(F, L) P(reader names label f | not carried, at coverage level l).

        The records missed it with probability `1 - coverage`, and a missed
        label is likelier to have been a common one; on top of that the reader
        may simply have misread the page, which `noise` carries.
        """
        missed = np.outer(self.prevalence, 1.0 - self._levels)  # (F, L)
        return np.minimum(missed + self.noise, self.hi)

    @property
    def neutral(self) -> np.ndarray:
        """P(reader names this label | nothing indexed for the candidate)."""
        return self.hi * self.prevalence + self.noise * (1.0 - self.prevalence)

    @property
    def confusion(self) -> np.ndarray:
        """(F, K) P(answer f | category), matching `categories` and `moments`."""
        F = self.matrix.shape[1]
        return np.column_stack([np.full(F, self.hi), self.absent, self.neutral])

    def categories(self, answer: int) -> np.ndarray:
        """Per-candidate category for one answer.

        0 carries it, 1..L absent at each coverage level, L+1 nothing indexed.
        """
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
        matrix = belief.restrict(self.matrix)
        present = matrix.T @ stacked  # (F, 2)
        has_data = belief.take(self.has_data)
        unknown = ~has_data

        F = self.matrix.shape[1]
        L = len(self._levels)
        A = np.empty((F, L + 2), dtype=np.float64)
        S = np.empty((F, L + 2), dtype=np.float64)
        A[:, 0], S[:, 0] = present[:, 0], present[:, 1]
        A[:, L + 1] = float(stacked[unknown, 0].sum())
        S[:, L + 1] = float(stacked[unknown, 1].sum())
        # Each absent category is its level's mass minus the part of it that
        # carries the answer. A row carrying a label always has data, so the
        # three groups partition the belief exactly.
        level_of = belief.take(self._level_of)
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
        """Self, always. The reader types a name; nothing is shortlisted for them.

        The other shapes condense because the reader has to read every option.
        Here they read one name off the page and the client autocompletes it —
        `Engine.search_creators` is what bounds the list, not this.
        """
        return self


@dataclass
class BinaryFamily:
    """A large bank of yes/no questions sharing one sparse feature matrix.

    Scoring the whole family costs two sparse matvecs regardless of how many
    questions it holds — which is what makes asking about all 16k Inducks
    characters tractable.
    """

    family: str
    prompt_template: str
    matrix: sp.csr_matrix  # (N, F) boolean
    labels: list[str]
    has_data: np.ndarray  # (N,) bool
    confusion: np.ndarray
    # Cells that are carried but that the reader cannot be asked to confirm — a
    # cameo, a character present only as a photo, a one-time character. Subset
    # of `matrix`.
    weak: sp.csr_matrix | None = None
    # Stable per-column identity, parallel to `labels`. `labels` are display
    # names in `desc_language` and change with it; a code does not, so anything
    # keyed outside the index — the character portraits the API serves — is
    # keyed on this. Absent for a family whose columns are not entities.
    codes: list[str] | None = None
    options: list[str] = field(default_factory=lambda: ["Yes", "No"])
    # Derived in __post_init__, never passed in.
    _carries: ColumnView = field(init=False, repr=False, compare=False)
    _weak_view: ColumnView | None = field(init=False, default=None, repr=False, compare=False)
    _feature_of: dict[str, int] = field(init=False, default_factory=dict, repr=False, compare=False)

    def __post_init__(self) -> None:
        self._carries = ColumnView(self.matrix)
        if self.weak is not None and self.weak.nnz:
            self._weak_view = ColumnView(sp.csr_matrix(self.weak))
        # Keyed on `codes` where the columns are entities and on `labels` where
        # they are their own identity, which is the plot bank. See `feature_of`.
        identity = self.codes if self.codes is not None else self.labels
        self._feature_of = {name: i for i, name in enumerate(identity)}

    def feature_of(self, code: str) -> int | None:
        """The column for a stable identity, or None if this index has no such thing.

        What `key` is built from is the *label* — a display name in whichever
        `DESC_LANGUAGE` the index was built, which a rebuild in another language
        changes wholesale. Anything stored outside a session and replayed into a
        later one has to come back through here instead, and has to tolerate a
        None: a character can be recoded and a plot term can fall out of
        `build_vocabulary` on the next rebuild.
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
        present = belief.restrict(self.matrix).T @ stacked  # (F, 2)
        unknown = ~belief.take(self.has_data)
        A_unknown = float(stacked[unknown, 0].sum())
        S_unknown = float(stacked[unknown, 1].sum())
        total_S = belief.log_mass

        F = self.matrix.shape[1]
        A = np.empty((F, 4), dtype=np.float64)
        S = np.empty((F, 4), dtype=np.float64)
        A[:, 0], S[:, 0] = present[:, 0], present[:, 1]
        A[:, 2], S[:, 2] = A_unknown, S_unknown
        # Weak cells are carried, so they move out of "present" rather than out
        # of the absences.
        A[:, 3] = 0.0
        S[:, 3] = 0.0
        if self.weak is not None and self.weak.nnz:
            weak = belief.restrict(self.weak).T @ stacked
            A[:, 0] -= weak[:, 0]
            S[:, 0] -= weak[:, 1]
            A[:, 3], S[:, 3] = weak[:, 0], weak[:, 1]
        # "Absent" falls out by subtraction; see MultiLabelQuestion.moments on
        # why A is clamped and S is not.
        A[:, 1] = np.maximum(belief.mass - A[:, 0] - A[:, 2] - A[:, 3], 0.0)
        S[:, 1] = total_S - S[:, 0] - S[:, 2] - S[:, 3]
        return A, S

    def gains(self, belief: Belief) -> np.ndarray:
        """(F,) expected gain for every question in the family, in two matvecs."""
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
    """One yes/no question, drawn out of a `BinaryFamily`.

    A view rather than a copy: the family owns the matrix, and 16k characters
    must not become 16k objects. Everything a caller needs of a question is
    here, so nothing downstream has to know it came from a family.
    """

    family: BinaryFamily
    feature: int

    @property
    def key(self) -> str:
        return f"{self.family.family}:{self.family.labels[self.feature]}"

    @property
    def prompt(self) -> str:
        return self.family.prompt_template.format(name=self.family.labels[self.feature])

    @property
    def options(self) -> list[str]:
        return list(self.family.options)

    @property
    def subject(self) -> str | None:
        """The code of the character (or term) this question is about."""
        if self.family.codes is None:
            return None
        return self.family.codes[self.feature]

    @property
    def group(self) -> str:
        """The family. Its questions fail together for a reader who cannot
        answer them, so they are damped together."""
        return self.family.family

    @property
    def costs_turn(self) -> bool:
        return True

    def likelihood(self, answer: int) -> np.ndarray:
        return self.family.confusion[answer][self.family.categories(self.feature)]

    def gain(self, belief: Belief) -> float:
        # Scores the whole family to read off one column. `BinaryFamily.best` is
        # what the selector uses, and it keeps all F gains from the same work.
        return float(self.family.gains(belief)[self.feature])

    def condense(self, w: np.ndarray, max_options: int) -> BinaryQuestion:
        """Self. Yes/no is already as short as an option list gets."""
        return self

    def value_option(self, value: int) -> int | None:
        """None. Whether a character appears is not a quantity to be read off."""
        return None


@dataclass
class QuestionBank:
    """Everything the engine can ask, in the two shapes scoring cares about.

    `singles` are scored one at a time; a `BinaryFamily` scores all of its
    questions at once and contributes only its best. Both come out of
    `candidates` as plain `Question`s, which is all the selector sees.
    """

    singles: list[Question] = field(default_factory=list)
    families: list[BinaryFamily] = field(default_factory=list)

    def candidates(
        self,
        belief: Belief,
        asked: set[str],
        max_options: int,
    ) -> Iterator[tuple[Question, float]]:
        """Every askable question with its expected gain, condensed as shown.

        Questions that cost no turn are volunteered by the reader, not chosen —
        they are reachable by key, never offered here.
        """
        for question in self.singles:
            if not question.costs_turn or question.key in asked:
                continue
            # Score the question the reader will actually be shown, not the full
            # 76-way partition behind it: condensing changes the information it
            # can yield, so it has to happen before ranking, not after.
            shown = question.condense(belief.w, max_options)
            yield shown, shown.gain(belief)

        for family in self.families:
            found = family.best(belief, asked)
            if found is not None:
                yield found

    def by_key(self, key: str) -> Question | None:
        """The question with this key, whether or not it is ever offered."""
        return next((q for q in self.singles if q.key == key), None)

    def family_question(self, family: str, code: str) -> BinaryQuestion | None:
        """One family question, addressed by the stable code of its subject.

        The replay path. `candidates` picks the family's best question by gain
        and `by_key` reaches the singles; neither can be handed a character
        decided on in an earlier session. Returns None for a family this index
        does not have or a code it no longer carries, because a caller replaying
        stored answers must be able to lose one without losing the session.
        """
        for fam in self.families:
            if fam.family != family:
                continue
            feature = fam.feature_of(code)
            return None if feature is None else BinaryQuestion(family=fam, feature=feature)
        return None


def decade_question(
    index: StoryIndex,
    noise: float,
    impossible: float,
    max_options: int | None,
) -> MultiLabelQuestion | None:
    """ "What decade was the magazine published in?", bounded by the story's age.

    Two independent pieces of evidence about one answer the reader reads
    straight off the cover:

    **The decades the storyversion is recorded as printed in**, as set
    membership. This is where the information is — 1.8 bits at the start of a
    session and still 1.4 by the tenth question, where the best the rest of the
    bank can offer is down to 0.3 — because a story's printings cluster in time
    far more tightly than they cluster by magazine or even by country.

    **The decade its story was first published in**, as a floor. Inducks does not
    have every issue ever printed, and the reader's magazine may well be one it
    is missing: holding out 10% of printings (`mise run holdout`) shows a large
    minority of readers naming a decade the index has no record of for their
    story. Those readers get
    penalised by set membership alone — median rank of the true story goes from
    28,111 under the prior to 33,503, *worse* than not asking. The floor is what
    keeps them alive, and it cannot mislead: a magazine cannot print a story
    before the story exists, so the true answer never violates it (0 of 6,000
    held-out trials did). Together the two score 2.0 bits and pull that reader
    back to 29,745 without costing the 63% whose magazine *is* indexed anything.

    Note what the floor is not: slack. Raising the "not recorded" likelihood to
    absorb the same readers costs an order of magnitude more information to
    recover a fraction of the median rank, and makes the p90 worse, because an
    unindexed magazine leaves no trace at all — lifting that likelihood lifts the
    true story and every rival by the same factor. Same finding as `Settings.noise_floor`, and
    the reason `layout_mismatch` cannot be reused here: a miscount leaves the
    truth as a *neighbour* on an ordered scale, and there is no neighbour here.
    """
    if not index.decade_starts or index.decade.shape[1] == 0:
        return None

    starts = np.asarray(index.decade_starts, dtype=np.int32)
    first = index.first_decade()
    # (N, F): the story did not exist yet when that decade's magazines were printed.
    known = first != UNKNOWN
    impossible_mask = known[:, None] & (first[:, None] > starts[None, :])
    return MultiLabelQuestion(
        key="decade",
        prompt="What decade was the magazine published in?",
        matrix=index.decade,
        labels=[f"{s}s" for s in index.decade_starts],
        has_data=index.has_decade,
        noise=noise,
        ruled_out=sp.csr_matrix(impossible_mask.astype(np.int8)),
        impossible=impossible,
        # Chronological, and short enough to show whole. `stable_order` would
        # keep the *earliest* decades on condensing, which is not the same as
        # keeping the likeliest — so the cap has to stay above the label count.
        stable_order=True,
        max_options=max_options,
        # A caller that knows the magazine's year — Dumili is indexing the issue,
        # so it has the date the reader would otherwise read off the cover — can
        # answer this without being asked. The labels are decades, so the year
        # floors to one.
        value_label=lambda year: f"{(year // 10) * 10}s",
    )


def creator_question(index: StoryIndex, cfg: Settings) -> AttestedMultiLabelQuestion | None:
    """ "Whose name is printed on the story's first page?" — volunteered, not asked.

    In the bank so that one code path applies every answer, but `costs_turn` is
    False, so the selector never offers it: it is worth folding in when the
    reader happens to see a credit, and not worth a turn of its own, because the
    dump cannot tell us how often printings carry one.
    """
    if index.creator.shape[1] == 0 or not index.creator_names:
        return None
    return AttestedMultiLabelQuestion(
        key="creator",
        prompt="Whose name is printed on the story's first page?",
        matrix=index.creator,
        labels=list(index.creator_names),
        has_data=index.has_creator,
        noise=cfg.noise_floor,
        # Flat: unlike a printing, a story's authorship does not become better
        # attested by being reprinted more often.
        coverage=np.full(index.n_items, cfg.creator_coverage),
    )


def build_bank(index: StoryIndex, cfg: Settings) -> QuestionBank:
    noise = cfg.noise_floor
    # Every layout question answers about the printing in the reader's hands,
    # while the index records a layout of *some* printing of that storyversion;
    # `layout_mismatch` is the probability those are not the same. See
    # `information._with_mismatch`.
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
            "How long is the story?",
            index.page_tenths,
            PAGE_BUCKETS,
            noise * 0.5,
            unit="pages",
        ),
        layout_question(
            "rows",
            "How many rows (tiers) of panels are on a typical page?",
            index.rows,
            SMALL_INT_BUCKETS,
            noise,
        ),
        layout_question(
            "cols",
            "How many panels are in a typical row?",
            index.cols,
            SMALL_INT_BUCKETS,
            noise,
        ),
        layout_question(
            "panels",
            "Roughly how many panels does the story have in total?",
            # estimatedpanels is itself derived in Inducks, so trust it less.
            index.panels,
            PANEL_BUCKETS,
            panel_noise,
        ),
    ]

    # No language question. Measured and deleted: 43-62% of readers hold a
    # printing whose language Inducks does not record for their story, and set
    # membership alone punishes them for it. The decade question survives the
    # same failure only because a magazine cannot print a story before the story
    # exists, and no fact about a story makes a language impossible — so there is
    # no bound to pair the membership with. `index.lang` is still built; see the
    # README before re-adding the question.
    singles: list[Question] = [*categorical]

    decade = decade_question(index, cfg.decade_noise, cfg.decade_impossible, cfg.decade_options)
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
                # Token occurrence is a proxy for the concept, so it is noisier
                # than a character sighting. A bank of canonical propositions
                # (see etl/plot.py) would bring this down.
                confusion=info.binary_confusion(min(noise * 2.5, 0.3)),
            )
        )

    return QuestionBank(singles=singles, families=families)
