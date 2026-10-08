"""Picks the next question by expected information gain."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

import numpy as np

from quackinator.engine.belief import Belief
from quackinator.engine.questions import Question, QuestionBank


@dataclass(frozen=True)
class Selection:
    question: Question
    gain: float  # nats, assuming the reader answers
    # P(the reader answers this question's group at all); only used for ranking.
    answer_rate: float = 1.0

    @property
    def score(self) -> float:
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
    answer_rate: Callable[[str], float] | None = None,
) -> Selection | None:
    """The unasked question with the best gain × answer rate, or None if none is worth a turn."""
    belief = Belief.over(w)

    best: Selection | None = None
    for question, gain in bank.candidates(belief, asked, max_options):
        rate = answer_rate(question.group) if answer_rate is not None else 1.0
        found = Selection(question=question, gain=gain, answer_rate=rate)
        if best is None or found.score > best.score:
            best = found

    # Discounted score, so a bank the reader keeps declining ends the session.
    if best is None or best.score < min_gain:
        return None
    return best


def posterior(w: np.ndarray, likelihood: np.ndarray) -> np.ndarray:
    """Multiply the belief by a likelihood and renormalise.

    Likelihoods are always > 0, so a wrong answer never eliminates a candidate for good.
    """
    updated = w * likelihood
    return updated / updated.sum()
