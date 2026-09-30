"""Question selection by expected information gain.

The question asked next is whichever one the belief says will narrow the field
most, scored over the whole bank every turn. A question that sounds interesting
and a question that splits the candidates evenly are not the same thing, and only
the second is worth a turn of the reader's patience.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

import numpy as np

from quackinator.engine.belief import Belief, Support
from quackinator.engine.questions import Question, QuestionBank


@dataclass(frozen=True)
class Selection:
    """A question, and what asking it is expected to be worth."""

    question: Question
    gain: float
    # P(the reader answers this question's group at all), from what they have
    # done so far. `gain` stays the information the question carries when
    # answered — that is a property of the belief, not of the reader — and the
    # two are multiplied only to rank. See `score`.
    answer_rate: float = 1.0

    @property
    def score(self) -> float:
        """What asking is worth once the chance of no answer is priced in."""
        return self.gain * self.answer_rate

    @property
    def key(self) -> str:
        return self.question.key

    @property
    def prompt(self) -> str:
        return self.question.prompt

    @property
    def options(self) -> list[str]:
        return self.question.options

    @property
    def subject(self) -> str | None:
        return self.question.subject


def select(
    bank: QuestionBank,
    w: np.ndarray,
    asked: set[str],
    *,
    min_gain: float = 1e-4,
    max_options: int = 8,
    support: Support | None = None,
    answer_rate: Callable[[str], float] | None = None,
) -> Selection | None:
    """Return the most informative question not yet asked, per turn spent.

    `support` is the session's, so the rows the bank is scored against narrow as
    the field does; without one every candidate is scored every turn.

    `answer_rate` prices in the chance the reader simply cannot answer. A
    question is only worth its information if an answer comes back: a turn spent
    on "does the story involve black?" against a reader who has already declined
    three of those buys nothing, and there are only `max_questions` of them. So
    the ranking is by expected information *per turn*, not by information.
    Without it every question is assumed answerable, which is the engine as it
    was — and what `--ablate family-patience` restores.
    """
    belief = Belief.over(w, support)

    best: Selection | None = None
    for question, gain in bank.candidates(belief, asked, max_options):
        rate = answer_rate(question.group) if answer_rate is not None else 1.0
        found = Selection(question=question, gain=gain, answer_rate=rate)
        if best is None or found.score > best.score:
            best = found

    # Against the discounted score, so a bank the reader has stopped answering
    # ends the session rather than spending its last turns proving it again.
    if best is None or best.score < min_gain:
        return None
    return best


def posterior(w: np.ndarray, likelihood: np.ndarray) -> np.ndarray:
    """Multiply the belief by a likelihood and renormalise.

    Never zeroes a candidate: every likelihood the engine produces is strictly
    positive, so a reader who miscounts can still be recovered from by later
    questions.
    """
    updated = w * likelihood
    total = updated.sum()
    if total <= 0:
        # Should be unreachable given a positive confusion matrix, but a belief
        # collapse would be silent and fatal, so fall back to the prior shape.
        return np.full_like(w, 1.0 / w.shape[0])
    return updated / total
