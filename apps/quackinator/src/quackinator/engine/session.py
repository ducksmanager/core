"""One reader, one magazine, one story to identify."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from math import isfinite
from pathlib import Path

import numpy as np

from quackinator.config import Settings, settings
from quackinator.engine import information as info
from quackinator.engine.creators import CreatorMatch, CreatorSearch
from quackinator.engine.questions import (
    LAYOUT_KEYS,
    CategoricalQuestion,
    Question,
    QuestionBank,
    Text,
    build_bank,
)
from quackinator.engine.selector import Selection, posterior, select
from quackinator.index.model import StoryIndex

# The bank is worded for stories; a cover session rewrites the prompts on display.
COVER_WORDING = (
    ("appear in the story", "appear on the cover"),
    ("Does the story involve", "Does the cover show"),
    ("the story's first page", "the cover"),
)


@dataclass
class PendingQuestion:
    key: str
    prompt: str
    options: list[str]
    gain_bits: float
    # Inducks code of what is asked about (e.g. a character code), if any.
    subject: str | None = None


@dataclass
class Guess:
    storycode: str
    title: str
    year: int | None
    probability: float
    # Relative path of a first-page scan, "" if none. See `StoryIndex.story_thumbs`.
    thumbnail_path: str = ""


@dataclass
class Engine:
    """Shared, read-only state for all sessions. Build once at process start."""

    index: StoryIndex
    bank: QuestionBank
    # Starting belief for a story session (covers get zero).
    prior: np.ndarray
    cfg: Settings
    creator_search: CreatorSearch | None = None
    # Starting belief for a cover session (stories get zero); None if the index has no covers.
    cover_prior: np.ndarray | None = None

    @classmethod
    def load(cls, cfg: Settings | None = None) -> Engine:
        cfg = cfg or settings
        index = StoryIndex.load(Path(cfg.index_dir))
        return cls.from_index(index, cfg)

    @classmethod
    def from_index(cls, index: StoryIndex, cfg: Settings | None = None) -> Engine:
        cfg = cfg or settings
        # Often-reprinted stories are likelier; the exponent damps it so rare ones stay reachable.
        pop = np.maximum(index.popularity.astype(np.float64), 1.0)
        weighted = pop**cfg.popularity_prior_weight
        prior = np.where(index.cover, 0.0, weighted)
        prior /= prior.sum()
        cover_prior = None
        if index.cover.any():
            cover_prior = np.where(index.cover, weighted, 0.0)
            cover_prior /= cover_prior.sum()
        return cls(
            index=index,
            bank=build_bank(index, cfg),
            prior=prior,
            cfg=cfg,
            creator_search=CreatorSearch.build(index, cfg.creator_matches),
            cover_prior=cover_prior,
        )

    def search_creators(self, query: str) -> list[CreatorMatch]:
        if self.creator_search is None:
            return []
        return self.creator_search.matches(query)


@dataclass
class Session:
    engine: Engine
    # Identifying a cover rather than a story; the other kind starts at zero belief.
    cover: bool = False
    w: np.ndarray = field(init=False)
    asked: set[str] = field(default_factory=set)
    history: list[dict] = field(default_factory=list)
    rejected: set[str] = field(default_factory=set)
    # Per question group: turns spent, and how many were "don't know".
    _group_asked: Counter[str] = field(default_factory=Counter, repr=False)
    _group_skipped: Counter[str] = field(default_factory=Counter, repr=False)
    _pending: Selection | None = field(default=None, repr=False)
    _story_probs: np.ndarray | None = field(default=None, repr=False, compare=False)

    def __post_init__(self) -> None:
        if self.cover:
            if self.engine.cover_prior is None:
                raise ValueError("this index carries no covers")
            self.w = self.engine.cover_prior.copy()
            # Covers have no length or panels; marking them asked also blocks seeding them.
            self.asked |= LAYOUT_KEYS
        else:
            self.w = self.engine.prior.copy()

    # -- driving the conversation -------------------------------------------

    @property
    def pending(self) -> Selection | None:
        """The question awaiting an answer, with its underlying `Question`."""
        return self._pending

    @property
    def questions_asked(self) -> int:
        """Turns spent. Free answers (author box, host facts) are in `history` but not counted."""
        return sum(1 for entry in self.history if entry["costs_turn"])

    def next_question(self) -> PendingQuestion | None:
        if self.questions_asked >= self.engine.cfg.max_questions:
            return None
        if self.confidence >= self.engine.cfg.confidence_threshold:
            return None
        selection = select(
            self.engine.bank,
            self.w,
            self.asked,
            max_options=self.engine.cfg.max_options,
            answer_rate=self.answer_rate,
        )
        if selection is None:
            return None
        self._pending = selection
        return PendingQuestion(
            key=selection.key,
            prompt=self._worded(selection.prompt),
            options=selection.options,
            gain_bits=selection.gain / np.log(2),
            subject=selection.subject,
        )

    def _worded(self, prompt: str) -> str:
        if not self.cover:
            return prompt
        # Reword the template, not the rendered text, so it can still be translated.
        template = prompt.id if isinstance(prompt, Text) else prompt
        params = prompt.params if isinstance(prompt, Text) else {}
        for story, cover in COVER_WORDING:
            template = template.replace(story, cover)
        return Text(template, **params)

    def answer(self, key: str, option: int) -> None:
        if self._pending is None or self._pending.key != key:
            raise ValueError(f"no pending question with key {key!r}")
        if not 0 <= option < len(self._pending.options):
            raise ValueError(f"option {option} out of range for {key!r}")
        self._record(self._pending.question, option)
        self._pending = None

    def answer_rate(self, group: str) -> float:
        """Estimated P(the reader answers the next question in `group`), starting at 1.

        A reader who can't answer one question in a group usually can't answer the next.
        `Settings.family_patience` smooths the estimate; infinite disables it.
        """
        patience = self.engine.cfg.family_patience
        asked = self._group_asked[group]
        if not asked or not isfinite(patience):
            return 1.0
        answered = asked - self._group_skipped[group]
        return (answered + patience) / (asked + patience)

    def skip(self, key: str) -> None:
        """Reader doesn't know: belief unchanged, but the turn counts toward `answer_rate`."""
        if self._pending is None or self._pending.key != key:
            raise ValueError(f"no pending question with key {key!r}")
        self._record_skip(self._pending.question, self._pending.prompt)
        self._pending = None

    def volunteer(self, key: str, option: int) -> None:
        """Apply an unprompted answer (the author box); only free questions are accepted."""
        question = self.engine.bank.by_key(key)
        if question is None or question.costs_turn:
            raise ValueError(f"{key!r} is not a question the reader can volunteer")
        if key in self.asked:
            raise ValueError(f"{key!r} has already been answered for this session")
        if not 0 <= option < len(question.options):
            raise ValueError(f"option {option} out of range for {key!r}")
        self._record(question, option)

    # -- what a host system knows before the first question ------------------

    def boost(self, scores: dict[str, float]) -> list[str]:
        """Boost the host's candidate stories; returns the storycodes not in the index.

        `scores` (0..1) scale the lift from 1 to `Settings.seed_boost`. Lifts only go
        up, so a list that misses the true story costs almost nothing.
        See README § A host system may seed a session.
        """
        index = self.engine.index
        ceiling = self.engine.cfg.seed_boost
        factor = np.ones_like(self.w)
        missed: list[str] = []
        touched = False
        for storycode, score in scores.items():
            story = index.story_number(storycode)
            if story is None:
                missed.append(storycode)
                continue
            lift = 1.0 + (ceiling - 1.0) * min(max(score, 0.0), 1.0)
            factor[index.story_id == story] = lift
            touched = True
        if touched:
            self.w = self.w * factor
            self.w /= self.w.sum()
            self._story_probs = None
        return missed

    def lift_stories(self, lift: np.ndarray) -> None:
        """Multiply each story's belief by a per-story factor (>= 1) from `engine.evidence`."""
        self.w = self.w * lift[self.engine.index.story_id]
        self.w /= self.w.sum()
        self._story_probs = None

    def apply_fact(self, key: str, value: int, noise: float | None = None) -> bool:
        """Answer a question for free from a value the host already knows (e.g. page count).

        `value` is the raw quantity (tenths of a page, rows, a year), not an option index.
        `noise` overrides the reader error rate, for ordered scales only.
        Returns False instead of raising if the question is unknown, answered or off-scale.
        """
        question = self.engine.bank.by_key(key)
        if question is None or key in self.asked:
            return False
        option = question.value_option(value)
        if option is None:
            return False
        likelihood = None
        if noise is not None:
            if not isinstance(question, CategoricalQuestion):
                return False
            likelihood = info.banded_confusion(
                question.n_categories, noise, mismatch=question.mismatch
            )[option][question.assign]
        self._record(question, option, costs_turn=False, likelihood=likelihood)
        return True

    def exclude(self, key: str) -> None:
        """Never ask this question, and learn nothing from it."""
        self.asked.add(key)

    def replay(self, family: str, code: str, option: int | None) -> bool:
        """Re-apply a yes/no family answer from an earlier session; `option` None is "don't know".

        Only family questions can be replayed: other questions' options change every turn.
        Returns False if the code is no longer in the index.
        """
        question = self.engine.bank.family_question(family, code)
        if question is None or question.key in self.asked:
            return False
        if option is None:
            self._record_skip(question, question.prompt)
        elif 0 <= option < len(question.options):
            self._record(question, option)
        else:
            return False
        return True

    def _record(
        self,
        question: Question,
        option: int,
        costs_turn: bool | None = None,
        likelihood: np.ndarray | None = None,
    ) -> None:
        """Apply one answer to the belief and add it to the history."""
        charge = question.costs_turn if costs_turn is None else costs_turn
        if charge:
            self._group_asked[question.group] += 1
        if likelihood is None:
            likelihood = question.likelihood(option)
        self.w = posterior(self.w, likelihood)
        self._story_probs = None
        self.asked.add(question.key)
        self.history.append(
            {
                "key": question.key,
                "prompt": question.prompt,
                "answer": question.options[option],
                "costs_turn": charge,
            }
        )

    def _record_skip(self, question: Question, prompt: str) -> None:
        """Record a "don't know". `prompt` is the wording the reader actually saw."""
        self._group_asked[question.group] += 1
        self._group_skipped[question.group] += 1
        self.asked.add(question.key)
        self.history.append(
            {
                "key": question.key,
                "prompt": prompt,
                "answer": "Don't know",
                "costs_turn": True,
            }
        )

    # -- reading off the belief ---------------------------------------------

    def story_probabilities(self) -> np.ndarray:
        """Belief summed per story (storyversions of one story are the same guess).

        Cached and shared: treat as read-only, and reset `_story_probs` whenever `w` changes.
        """
        if self._story_probs is None:
            self._story_probs = np.bincount(
                self.engine.index.story_id,
                weights=self.w,
                minlength=self.engine.index.n_stories,
            )
        return self._story_probs

    @property
    def story_entropy_bits(self) -> float:
        """Entropy of the per-story belief, in bits (`entropy_bits` is per storyversion)."""
        probs = self.story_probabilities()
        probs = probs[probs > 0]
        return float(-(probs * np.log2(probs)).sum())

    @property
    def entropy_bits(self) -> float:
        return info.entropy(self.w) / float(np.log(2))

    def guesses(self, n: int = 5) -> list[Guess]:
        probs = self.story_probabilities()
        idx = self.engine.index
        # Rejected stories keep some mass (it still guides questions) but are never shown again.
        take = min(n + len(self.rejected), probs.shape[0])
        top = np.argpartition(probs, -take)[-take:]
        top = top[np.argsort(-probs[top])]
        out = [
            Guess(
                storycode=idx.story_codes[i],
                title=idx.story_titles[i] or idx.story_codes[i],
                year=idx.story_years[i],
                probability=float(probs[i]),
                thumbnail_path=idx.story_thumbs[i],
            )
            for i in top
            if probs[i] > 0 and idx.story_codes[i] not in self.rejected
        ]
        return out[:n]

    def eliminate(self, storycode: str) -> None:
        """Reader rejected a guess: damp it, not zero it (readers sometimes reject the right one)."""
        story = self.engine.index.story_number(storycode)
        if story is None:
            return
        self.rejected.add(storycode)
        mask = self.engine.index.story_id == story
        self.w = self.w.copy()
        self.w[mask] *= self.engine.cfg.rejection_likelihood
        self.w /= self.w.sum()
        self._story_probs = None

    @property
    def confidence(self) -> float:
        """Probability of the best story the reader has not rejected."""
        probs = self.story_probabilities()
        if not self.rejected:
            return float(probs.max())
        # Copy: the cached array is shared.
        probs = probs.copy()
        for code in self.rejected:
            story = self.engine.index.story_number(code)
            if story is not None:
                probs[story] = 0.0
        return float(probs.max())
