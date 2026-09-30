"""One reader, one magazine, one story to identify."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from math import isfinite
from pathlib import Path

import numpy as np

from quackinator.config import Settings, settings
from quackinator.engine import information as info
from quackinator.engine.belief import Support
from quackinator.engine.creators import CreatorMatch, CreatorSearch
from quackinator.engine.questions import Question, QuestionBank, build_bank
from quackinator.engine.selector import Selection, posterior, select
from quackinator.index.model import StoryIndex


@dataclass
class PendingQuestion:
    key: str
    prompt: str
    options: list[str]
    gain_bits: float
    # Inducks code of the thing being asked about, where the question is about
    # one — a character code, for the character family. See `Question.subject`.
    subject: str | None = None


@dataclass
class Guess:
    storycode: str
    title: str
    year: int | None
    probability: float
    # Path of a scan of the story's first page, "" where nobody has scanned it.
    # A path, not a URL — see `StoryIndex.story_thumbs`. Carried on the guess
    # because it is shown next to the title, not because the engine uses it.
    thumbnail_path: str = ""


@dataclass
class Engine:
    """Immutable, shared across sessions. Build once at process start."""

    index: StoryIndex
    bank: QuestionBank
    prior: np.ndarray
    cfg: Settings
    creator_search: CreatorSearch | None = None

    @classmethod
    def load(cls, cfg: Settings | None = None) -> Engine:
        cfg = cfg or settings
        index = StoryIndex.load(Path(cfg.index_dir))
        return cls.from_index(index, cfg)

    @classmethod
    def from_index(cls, index: StoryIndex, cfg: Settings | None = None) -> Engine:
        cfg = cfg or settings
        # A story reprinted in 200 issues is likelier to be the one in the
        # reader's hands than a story printed once. Damped, so the long tail
        # stays reachable.
        pop = np.maximum(index.popularity.astype(np.float64), 1.0)
        prior = pop**cfg.popularity_prior_weight
        prior /= prior.sum()
        return cls(
            index=index,
            bank=build_bank(index, cfg),
            prior=prior,
            cfg=cfg,
            creator_search=CreatorSearch.build(index, cfg.creator_matches),
        )

    def search_creators(self, query: str) -> list[CreatorMatch]:
        """Autocomplete for the author box. See `engine.creators`."""
        if self.creator_search is None:
            return []
        return self.creator_search.matches(query)


@dataclass
class Session:
    engine: Engine
    w: np.ndarray = field(init=False)
    asked: set[str] = field(default_factory=set)
    history: list[dict] = field(default_factory=list)
    rejected: set[str] = field(default_factory=set)
    # Turns spent on each question group, and how many of them the reader could
    # not answer. See `answer_rate`.
    _group_asked: Counter[str] = field(default_factory=Counter, repr=False)
    _group_skipped: Counter[str] = field(default_factory=Counter, repr=False)
    _pending: Selection | None = field(default=None, repr=False)
    _story_probs: np.ndarray | None = field(default=None, repr=False, compare=False)
    _support: Support = field(init=False, repr=False, compare=False)

    def __post_init__(self) -> None:
        self.w = self.engine.prior.copy()
        # Per session: the bank is shared and immutable, the rows worth scoring
        # against are not.
        self._support = Support(drop=self.engine.cfg.selection_drop)

    # -- driving the conversation -------------------------------------------

    @property
    def pending(self) -> Selection | None:
        """The question awaiting an answer, and the `Question` behind it.

        `next_question` returns only what a client needs to render; the
        simulator needs the question itself to answer it truthfully.
        """
        return self._pending

    @property
    def questions_asked(self) -> int:
        """Turns spent. The author box is in `history` but is not one of them.

        It is shown in the trail because the reader gave an answer and should
        see it, but it is not a question: it was never chosen by information
        gain, and charging it against `max_questions` would make the reader pay
        a turn for volunteering the strongest evidence they have.
        """
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
            support=self._support,
            answer_rate=self.answer_rate,
        )
        if selection is None:
            return None
        self._pending = selection
        return PendingQuestion(
            key=selection.key,
            prompt=selection.prompt,
            options=selection.options,
            gain_bits=selection.gain / np.log(2),
            subject=selection.subject,
        )

    def answer(self, key: str, option: int) -> None:
        """Answer the question the engine just asked."""
        if self._pending is None or self._pending.key != key:
            raise ValueError(f"no pending question with key {key!r}")
        if not 0 <= option < len(self._pending.options):
            raise ValueError(f"option {option} out of range for {key!r}")
        self._record(self._pending.question, option)
        self._pending = None

    def answer_rate(self, group: str) -> float:
        """P(the reader answers the next question in `group`), from what they did.

        A "don't know" costs a turn and moves the belief not at all, and a
        reader who cannot answer one question in a family usually cannot answer
        the next — the plot bank is bare words, and a word that means nothing to
        them is not an isolated accident. So a group the reader keeps declining
        is worth less than its information says, and the selector prices that in.

        Starts at 1: a family is never damped before the reader has been given a
        chance at it, and a group they answer every time is never damped at all.
        `Settings.family_patience` is how much benefit of the doubt it gets.
        """
        patience = self.engine.cfg.family_patience
        asked = self._group_asked[group]
        # `--ablate family-patience` is infinite patience: the engine as it was,
        # which assumed every question it asked would come back answered.
        if not asked or not isfinite(patience):
            return 1.0
        answered = asked - self._group_skipped[group]
        return (answered + patience) / (asked + patience)

    def skip(self, key: str) -> None:
        """Reader cannot tell. Record it, leave the belief untouched.

        Answering "don't know" carries no evidence, so the correct update is
        none at all — but the question must not be asked again. Note the
        asymmetry with `answer`: because `w` does not move, the cached story
        marginal stays valid and must *not* be invalidated here.

        It is not free, though. It cost the reader a turn, and it says something
        about the next question in the same family — which `answer_rate` is what
        remembers.
        """
        if self._pending is None or self._pending.key != key:
            raise ValueError(f"no pending question with key {key!r}")
        self._record_skip(self._pending.question, self._pending.prompt)
        self._pending = None

    def volunteer(self, key: str, option: int) -> None:
        """Fold in an answer the reader gave without being asked for it.

        The author box is the only one of these. It is offered once, up front,
        and a reader whose copy prints no credit skips it at no cost — which is
        what `Question.costs_turn` records, and the reason it can be offered at
        all. Everything past that is an ordinary answer: same likelihood, same
        soft update, because a printed credit can still be a pseudonym or a
        publisher's mistake.
        """
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
        """Lift a caller's own candidate stories, and damp nothing.

        A host running this engine behind its own tools — reverse image search,
        OCR — arrives already believing something. That belief is not an answer
        to a question: it is not a fact the reader checked against the page, and
        there is no turn to charge it to.

        It is safe to take it seriously *because* it only ever multiplies up. A
        list that misses the true story leaves every candidate's share of the
        belief essentially where it was — a handful of rows out of hundreds of
        thousands, renormalised — so a miss costs nothing, which is exactly the
        contract `volunteer` has and the reason both may use evidence a question
        may not. A list that is confidently *wrong* is the real failure, and it
        surfaces as a guess the reader rejects; `eliminate` is what recovers it.

        `scores` run 0..1 and scale the lift between none and
        `Settings.seed_boost`. Returns the storycodes it could not place, so a
        caller can tell the difference between a seed that was applied and one
        that silently did nothing.
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
            # Out-of-range scores are the caller's arithmetic, not the reader's
            # error, so they are clamped rather than trusted or refused.
            lift = 1.0 + (ceiling - 1.0) * min(max(score, 0.0), 1.0)
            factor[index.story_id == story] = lift
            touched = True
        if touched:
            self.w = self.w * factor
            self.w /= self.w.sum()
            self._story_probs = None
        return missed

    def apply_fact(self, key: str, value: int) -> bool:
        """Answer a question from a measurement the caller already holds.

        Dumili is indexing the issue in front of the reader, so it knows the
        story's page count and the magazine's year before it asks anything. The
        answer is an ordinary one — same likelihood, same soft update, because a
        recorded page count can still disagree with the printing — but it costs
        no turn, because the reader did not spend one.

        The value is the raw quantity the scale counts (tenths of a page, a row
        count, a year), never an option index: see `Question.value_option` on
        why an index means nothing outside the turn it was shown on.

        False where the question is not in this bank, has already been answered,
        or the value falls off its scale. Never raises: a caller assembling a
        seed from its own database should not have to know which questions this
        index happens to carry.
        """
        question = self.engine.bank.by_key(key)
        if question is None or key in self.asked:
            return False
        option = question.value_option(value)
        if option is None:
            return False
        self._record(question, option, costs_turn=False)
        return True

    def replay(self, family: str, code: str, option: int | None) -> bool:
        """Re-apply an answer this reader gave in an earlier session.

        Session state is a belief vector in process memory, so there is nothing
        to restore — resuming means replaying the answers that built it. Only
        the family questions come back this way: their option list is a fixed
        yes/no, so an index recorded last week still means what it meant, while
        every other question in the bank is re-condensed against the live belief
        each turn.

        `option` is None for a "don't know", which is replayed as one: it moved
        no belief, but it cost a turn and it told the selector something about
        the family, and a resumed session that forgot both would go on to ask
        the reader the same unanswerable things again.

        False where the code is gone from the index, which a caller must survive
        — see `QuestionBank.family_question`.
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

    def _record(self, question: Question, option: int, costs_turn: bool | None = None) -> None:
        """Apply one answer to the belief and add it to the trail.

        `costs_turn` overrides the question's own answer, for the one caller
        that has an answer to a question the reader was never asked: see
        `apply_fact`.
        """
        charge = question.costs_turn if costs_turn is None else costs_turn
        if charge:
            self._group_asked[question.group] += 1
        self.w = posterior(self.w, question.likelihood(option))
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
        """Record a "don't know": a turn spent, a question retired, no evidence.

        `prompt` is passed in rather than read off the question because the
        reader saw the condensed wording, and the trail should show what they
        were actually asked.
        """
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
        """Collapse storyversions onto their stories.

        Several storyversions of the same story are the same answer as far as
        the reader is concerned, so their mass belongs together.

        Cached, because one turn reads this four times over an unchanged belief
        (a question, a guess list, a confidence and an entropy) and it is a
        bincount over every storyversion. Treat the result as read-only: callers
        share the array, and the cache is dropped wherever `w` moves.
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
        """Entropy of the story-level belief, in bits.

        `entropy_bits` is over storyversions, which is what the engine reasons
        about — but several storyversions of one story are a single answer to
        the reader, so anything shown to them must be collapsed first.
        """
        probs = self.story_probabilities()
        probs = probs[probs > 0]
        return float(-(probs * np.log2(probs)).sum())

    @property
    def entropy_bits(self) -> float:
        return info.entropy(self.w) / float(np.log(2))

    def guesses(self, n: int = 5) -> list[Guess]:
        probs = self.story_probabilities()
        idx = self.engine.index
        # Rejected stories keep their belief mass — it still shapes which
        # questions are worth asking — but are never offered to the reader
        # again, however confident the engine remains.
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
        """Reader rejected a guess. Damp it rather than deleting it.

        A rejected guess is strong evidence but not proof — readers reject the
        right story when a translated title looks unfamiliar — so the belief is
        multiplied down rather than zeroed, and the story can still inform
        later question selection.
        """
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
        """Confidence in the best story the reader has not already rejected."""
        probs = self.story_probabilities()
        if not self.rejected:
            return float(probs.max())
        # Copy before zeroing: the marginal is cached and shared with the guess
        # list, which is built from it in the same turn.
        probs = probs.copy()
        for code in self.rejected:
            story = self.engine.index.story_number(code)
            if story is not None:
                probs[story] = 0.0
        return float(probs.max())
