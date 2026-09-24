"""Benchmark the engine by playing against itself.

A simulated reader answers from the index, optionally lying at a given rate to
check that the noise floor actually buys robustness.
"""

from __future__ import annotations

import argparse
import logging
import os
import statistics
import time
from collections.abc import Iterator
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass, replace
from functools import singledispatch
from pathlib import Path

import numpy as np
import scipy.sparse as sp

from quackinator.config import Settings, settings
from quackinator.engine import benchmark
from quackinator.engine import information as info
from quackinator.engine.belief import Belief
from quackinator.engine.questions import (
    AttestedMultiLabelQuestion,
    BinaryQuestion,
    CategoricalQuestion,
    MultiLabelQuestion,
    Question,
)
from quackinator.engine.session import Engine, Session
from quackinator.index.model import PAGE_SCALE, UNKNOWN, StoryIndex

log = logging.getLogger(__name__)

# One engine per ablation, so `--all` loads the index once per distinct engine
# rather than once per row.
ENGINES: dict[tuple[str, ...], Engine] = {}


@singledispatch
def truthful_answer(
    question: Question, target: int, rng: np.random.Generator | None = None
) -> int | None:
    """What a reader looking at storyversion `target` would say. None = can't tell.

    Registered per question shape rather than branched on a tag, so a new shape
    that forgets to answer this fails loudly here instead of falling through to
    whichever branch happened to be last.
    """
    raise NotImplementedError(f"no simulated reader for {type(question).__name__}")


@truthful_answer.register
def _(
    question: CategoricalQuestion, target: int, rng: np.random.Generator | None = None
) -> int | None:
    category = int(question.assign[target])
    return None if category >= question.n_categories else category


@truthful_answer.register
def _(
    question: MultiLabelQuestion, target: int, rng: np.random.Generator | None = None
) -> int | None:
    if not question.has_data[target]:
        return None
    labels = question.matrix[target].indices
    if not labels.size:
        return None
    # Several options are true at once, but the reader holds one printing, so
    # they name one of them. Taking the first would mean every reader naming
    # the most widely printed language on their row — which makes the answer
    # far less discriminating than a real one.
    return int(labels[0] if rng is None else rng.choice(labels))


@truthful_answer.register
def _(
    question: AttestedMultiLabelQuestion, target: int, rng: np.random.Generator | None = None
) -> int | None:
    if not question.has_data[target]:
        return None
    labels = question.matrix[target].indices
    if not labels.size:
        return None
    return int(labels[0] if rng is None else rng.choice(labels))


@truthful_answer.register
def _(question: BinaryQuestion, target: int, rng: np.random.Generator | None = None) -> int | None:
    family = question.family
    if not family.has_data[target]:
        return None
    return 0 if target in set(family.members(question.feature).tolist()) else 1


LAYOUT_KEYS = frozenset({"pages", "rows", "cols", "panels"})

# The one layout question whose column Inducks mostly fabricates. `pagel`'s
# panels-per-tier letter is "not mandatory", and where it is missing Inducks
# writes the documented default of 2 — on 88% of comic storyversions, in a form
# indistinguishable from an indexer who really did count two. See
# `Reader.defaulted_layout_rate`.
DEFAULTED_LAYOUT_KEY = "cols"

# Questions answered from the magazine rather than from the story. Inducks does
# not have every issue ever printed, so for these the index may hold no record of
# the printing the reader is actually holding.
ISSUE_KEYS = frozenset({"decade"})

# The family whose questions are bare words rather than propositions. See
# `Reader.opaque_plot_rate`.
PLOT_FAMILY = "plot"


def reprints(story_id: np.ndarray) -> dict[int, np.ndarray]:
    """Storyversion row -> every row of the same story, itself included.

    Keyed by row rather than by story so a reader needs nothing but the row
    they are holding. The groups are shared by reference, not copied per row.
    """
    order = np.argsort(story_id, kind="stable")
    bounds = np.flatnonzero(np.diff(story_id[order])) + 1
    lookup: dict[int, np.ndarray] = {}
    for group in np.split(order, bounds):
        for row in group.tolist():
            lookup[row] = group
    return lookup


@dataclass
class Reader:
    """A simulated reader, and the specific ways they can be wrong.

    Every rate here defaults to 0, and every one of them defaults to *flattering
    the engine*: at 0 the reader answers off the very row being scored, so the
    index is correct by construction and any robustness the engine buys can only
    look like a regression. Each is a real failure measured in the dump, and each
    is the reason a matching likelihood in `Settings` is non-zero.
    """

    rng: np.random.Generator

    # A reader who miscounts, or misremembers. Tests the noise floor.
    lie_rate: float = 0.0

    # `Settings.layout_mismatch`: Inducks records one layout per storyversion,
    # but `fr/IRS 1` reprints `I TL 116-AP` recomposed under the same code. At
    # this rate the layout answer is read off a *different* storyversion of the
    # same story — what a reader holding a re-laid-out reprint actually reports.
    layout_mismatch_rate: float = 0.0
    reprints: dict[int, np.ndarray] | None = None

    # `Settings.decade_impossible`: Inducks does not have every issue ever
    # printed, so at this rate the reader answers a magazine question about a
    # printing the index has no row for. `mise run holdout` measures it by
    # holding out a tenth of the printings; the documented rows are played at
    # whatever it last measured, never at a number typed here.
    unindexed_magazine_rate: float = 0.0

    # Rate at which the printing in the reader's hands carries a credit they can
    # read, and they type it into the author box. The dump cannot supply this
    # number — it records who made a story, never whether a printing said so —
    # so it is swept rather than measured. See `Settings.creator_coverage`.
    credit_rate: float = 0.0

    # Inducks writes its documented default of 2 where an indexer recorded no
    # panels-per-tier, on most rows, indistinguishable from a real count. At
    # this rate such a reader counts the actual comic instead, drawing from the
    # values indexers recorded when they *did* look — the best available
    # estimate of what the defaulted rows really hold.
    defaulted_layout_rate: float = 0.0
    defaulted: np.ndarray | None = None
    recorded_layout: np.ndarray | None = None

    # Rate at which a plot term means nothing to the reader looking at the page,
    # so they answer "don't know" whatever the index says. The plot bank holds
    # tokens lifted from description prose rather than propositions — "black",
    # "playing", "bringing" — and a reader cannot check a word like that against
    # a comic the way they can check "does Goofy appear".
    #
    # Without this the simulated reader answers every plot question perfectly
    # whenever the index has data, which makes plot data pure free signal and
    # flatters any engine that leans on it. It is the one adverse rate that
    # changes what a *question* is worth rather than what an answer is worth.
    #
    # Flat, and drawn per question rather than per term: the dump cannot say
    # which tokens a reader can act on, so a per-term model would need labelled
    # data that does not exist. `etl/plot.py` makes the same point about why the
    # vocabulary is bare words in the first place.
    opaque_plot_rate: float = 0.0

    def _fires(self, rate: float) -> bool:
        return bool(rate) and self.rng.random() < rate

    def _reprint_of(self, question: Question, target: int) -> int:
        """The row this reader's layout answer really describes.

        `target` unless the reader is holding a re-laid-out reprint, in which
        case a sibling storyversion of the same story. The emptiness check comes
        before the draw so that a story with one version consumes no randomness:
        two runs of the same seed must ask and answer identically.
        """
        rows = self.reprints.get(target) if self.reprints is not None else None
        if rows is None or rows.size <= 1 or question.key not in LAYOUT_KEYS:
            return target
        if not self._fires(self.layout_mismatch_rate):
            return target
        return int(self.rng.choice(rows[rows != target]))

    def _unindexed_answer(self, question: MultiLabelQuestion, target: int) -> int | None:
        """What a reader holding an issue Inducks has *not* indexed would say.

        Not a lie and not a miscount: a true answer about a real printing that
        the index has no row for. So it is drawn from the options this candidate
        neither carries nor is barred from — the ones that are genuinely
        possible and genuinely unrecorded.
        """
        carried = set(question.matrix[target].indices.tolist())
        barred: set[int] = set()
        if question.ruled_out is not None:
            barred = set(question.ruled_out[target].indices.tolist())
        options = [a for a in range(len(question.labels)) if a not in carried and a not in barred]
        return int(self.rng.choice(options)) if options else None

    def _counted_answer(self, question: CategoricalQuestion) -> int | None:
        """A reader who counts panels per tier in the comic, not in the index."""
        assert self.recorded_layout is not None
        value = int(self.rng.choice(self.recorded_layout))
        label = str(value) if value < 6 else "6 or more"
        return question.options.index(label) if label in question.options else None

    def answer(self, question: Question, target: int) -> int | None:
        """The reader's answer to one question. None = they cannot tell.

        The defects are checked in a fixed order, drawn from the rng in that
        order, so that a given seed replays exactly.
        """
        source = self._reprint_of(question, target)

        if (
            isinstance(question, MultiLabelQuestion)
            and question.key in ISSUE_KEYS
            and self._fires(self.unindexed_magazine_rate)
        ):
            answer = self._unindexed_answer(question, target)
        elif (
            isinstance(question, BinaryQuestion)
            and question.family.family == PLOT_FAMILY
            and self._fires(self.opaque_plot_rate)
        ):
            # Not a wrong answer and not missing data: the word simply does not
            # describe anything the reader can look for.
            answer = None
        elif (
            isinstance(question, CategoricalQuestion)
            and question.key == DEFAULTED_LAYOUT_KEY
            and self.defaulted is not None
            and self.recorded_layout is not None
            and self.defaulted[target]
            and self._fires(self.defaulted_layout_rate)
        ):
            answer = self._counted_answer(question)
        else:
            answer = truthful_answer(question, source, self.rng)

        if answer is not None and self._fires(self.lie_rate):
            choices = [i for i in range(len(question.options)) if i != answer]
            if choices:
                answer = int(self.rng.choice(choices))
        return answer


def question_kind(question: Question) -> tuple[str, str]:
    """How a question is grouped in the per-question table, and what to call it.

    One row per *kind* of question. The 16k character questions are one kind —
    the reader is asked "does X appear", and which X it was is the selector's
    business, not the table's.
    """
    if isinstance(question, BinaryQuestion):
        return question.group, question.family.prompt_template.format(name="*X*")
    return question.group, question.prompt


def ablated_engine(ablate: tuple[str, ...], cfg: Settings) -> Engine:
    """The engine with some of what it knows taken away.

    Every before/after argument in the README is a claim about an engine that no
    longer exists, so the only way those tables stay checkable is for the current
    code to be able to become that engine on request. See `benchmark.ABLATIONS`.
    """
    if "family-patience" in ablate:
        # Infinite patience: every question is assumed to come back answered,
        # which is what the engine believed before `Session.answer_rate`.
        cfg = cfg.model_copy(update={"family_patience": float("inf")})
    index = StoryIndex.load(Path(cfg.index_dir))
    if "fractional-pages" in ablate:
        # What reading `entirepages` alone recorded: a story shorter than a page
        # had no length at all.
        index.page_tenths = np.where(
            index.page_tenths < PAGE_SCALE, UNKNOWN, index.page_tenths
        ).astype(index.page_tenths.dtype)
    engine = Engine.from_index(index, cfg)
    if "decade" in ablate:
        engine.bank.singles = [q for q in engine.bank.singles if q.key != "decade"]
    # The decade question is two independent pieces of evidence about one answer,
    # and the argument for pairing them is a claim about each one alone. Taking
    # either away leaves a question of the same shape, so both stay askable.
    if "decade-floor" in ablate or "decade-membership" in ablate:

        def halved(q: Question) -> Question:
            if q.key != "decade" or not isinstance(q, MultiLabelQuestion):
                return q
            if "decade-floor" in ablate:
                q = replace(q, ruled_out=None)
            if "decade-membership" in ablate:
                q = replace(q, matrix=sp.csr_matrix(q.matrix.shape, dtype=q.matrix.dtype))
            return q

        engine.bank.singles = [halved(q) for q in engine.bank.singles]
    return engine


def play(engine: Engine, target: int, reader: Reader, worth: bool = True) -> dict:
    """Play one session against a reader holding storyversion `target`.

    `worth` records what each question bought, for the per-question table. It
    costs a story-level entropy on both sides of every answer, so the rows that
    do not feed that table do not pay for it.
    """
    session = Session(engine=engine)
    # The author box is offered once, before anything is asked, and costs no
    # turn — so a reader whose copy prints a credit starts from a narrower
    # field rather than spending a question on it.
    if reader.credit_rate and reader._fires(reader.credit_rate):
        creator = engine.bank.by_key("creator")
        named = truthful_answer(creator, target, reader.rng) if creator else None
        if named is not None:
            session.volunteer("creator", named)
    asked = 0
    # What each question was worth, measured the way a reader would count it:
    # the drop in story-level entropy, not the storyversion entropy the selector
    # reasons about. Skips are recorded as worth nothing, which they are.
    turns: list[dict] = []
    while True:
        pending = session.next_question()
        if pending is None:
            break
        selection = session.pending
        assert selection is not None
        before = session.story_entropy_bits if worth else 0.0
        answer = reader.answer(selection.question, target)
        if answer is None:
            session.skip(pending.key)
        else:
            session.answer(pending.key, answer)
        if worth:
            group, prompt = question_kind(selection.question)
            turns.append(
                {
                    "group": group,
                    "prompt": prompt,
                    "answered": answer is not None,
                    "bits": before - session.story_entropy_bits,
                    "turn": asked,
                }
            )
        asked += 1

    true_story = int(engine.index.story_id[target])
    probs = session.story_probabilities()
    rank = int((probs > probs[true_story]).sum()) + 1
    return {
        "questions": asked,
        "rank": rank,
        "confidence": session.confidence,
        "effective_candidates": float(np.exp(session.entropy_bits * np.log(2))),
        "turns": turns,
    }


def _truthful_bits(question: AttestedMultiLabelQuestion, w, wlogw, prior_entropy: float) -> float:
    """What a reader who *can* name their creator gets for naming it, in bits."""
    A, S = question.moments(Belief.over(w))
    gain = info.truthful_information_gain(A, S, question.confusion, prior_entropy)
    return gain / float(np.log(2))


# Readers drawn for the shortlist table. Seeded, so the table is reproducible.
SHORTLIST_READERS = 400
SHORTLIST_SEED = 5


def _named_rank(
    question: AttestedMultiLabelQuestion, w: np.ndarray, keep: np.ndarray | None
) -> str:
    """Median rank of the true storyversion after one reader names their creator.

    Entropy is the wrong lens for a 3,102-label answer — see
    `information.truthful_information_gain` — because a coverage-damped absence
    leaves the field wide even when it has been reordered completely. Rank is
    what the reader experiences, so rank is what the table reports.
    """
    rng = np.random.default_rng(SHORTLIST_SEED)
    ranks = []
    for target in rng.choice(len(w), SHORTLIST_READERS, p=w):
        labels = question.matrix[int(target)].indices
        if not labels.size:
            continue
        if keep is None:
            answer = int(rng.choice(labels))
        else:
            shown = [i for i, label in enumerate(keep) if label in labels]
            # A reader whose creator is not on the list answers the bag.
            answer = int(rng.choice(shown)) if shown else len(keep)
        posterior = w * question.likelihood(answer)
        ranks.append(int((posterior > posterior[target]).sum()) + 1)
    return f"{statistics.median(ranks):,.0f}" if ranks else "—"


def shortlist_worth(engine: Engine) -> list[dict]:
    """What the author box would be worth as an option list of each length.

    The argument for the box is that no list short enough to read holds the
    reader's name often enough to be worth a turn. That is a property of the
    index, so it is computed rather than played.

    `AttestedMultiLabelQuestion` does not condense — the client autocompletes
    instead — so the shortlisted questions are built here, and nowhere else.
    """
    question = engine.bank.by_key("creator")
    if not isinstance(question, AttestedMultiLabelQuestion):
        return []
    w = engine.prior
    wlogw = info.safe_xlogx(w)
    prior_entropy = info.entropy(w)
    mass = np.asarray(question.matrix.T @ w).ravel()

    rows = []
    for shown in (settings.max_options, 25, 100, 500, None):
        if shown is None:
            named, keep = question, None
            on_list = float(w[question.has_data].sum())
        else:
            keep = np.sort(np.argsort(-mass)[:shown])
            columns = question.matrix[:, keep]
            on_list = float(w[np.asarray(columns.sum(axis=1)).ravel() > 0].sum())
            rest = (question.matrix.sum(axis=1) - columns.sum(axis=1)) > 0
            named = replace(
                question,
                matrix=sp.hstack([columns, sp.csr_matrix(rest.astype(np.int8))], format="csr"),
                labels=[question.labels[i] for i in keep] + ["Something else"],
            )
        rows.append(
            {
                "Names shown": f"{shown}" if shown else "a search box",
                "Reader's name is on the list": f"{100 * on_list:.0f}%",
                "Bits from a true answer": f"{_truthful_bits(named, w, wlogw, prior_entropy):.1f}",
                "Median rank after answering": _named_rank(named, w, keep),
            }
        )
    return rows


def question_worth(turns: list[dict], trials: int) -> list[dict]:
    """One row per kind of question: how often it is asked, and what it buys.

    "Answered" is the share of askings the reader could answer at all, and the
    bits are averaged over those — a question nobody can answer is not a weak
    question, it is a wasted turn, and the two failures are worth telling apart.
    """
    rows = []
    for group in dict.fromkeys(t["group"] for t in turns):
        mine = [t for t in turns if t["group"] == group]
        answered = [t for t in mine if t["answered"]]
        avg = statistics.mean([t["bits"] for t in answered]) if answered else 0.0
        rows.append(
            {
                "question": mine[0]["prompt"],
                "Asked per session": f"{len(mine) / trials:.1f}",
                "Answered": f"{100 * len(answered) / len(mine):.0f}%",
                "Avg bits": f"{avg:.2f}",
                "Narrows by": f"{2**avg:.1f}x",
                "Bits per session": f"{sum(t['bits'] for t in answered) / trials:.2f}",
                "Median turn": f"{statistics.median(t['turn'] for t in mine):.0f}",
                "_sort": sum(t["bits"] for t in answered) / trials,
            }
        )
    rows.sort(key=lambda r: -r.pop("_sort"))
    return rows


def measure(scenario: benchmark.Scenario, trials: int, seed: int) -> dict:
    """Play one documented scenario and return everything a row needs.

    Returns plain data rather than writing anything, so that rows can be played
    in separate processes — they share nothing but the index on disk, and
    thirteen of them is thirteen cores' worth of work.
    """
    engine = ENGINES.get(scenario.ablate)
    if engine is None:
        engine = (
            ablated_engine(scenario.ablate, settings) if scenario.ablate else Engine.load(settings)
        )
        ENGINES[scenario.ablate] = engine

    rng = np.random.default_rng(seed)
    if scenario.sample == "prior":
        targets = rng.choice(engine.index.n_items, size=trials, p=engine.prior)
    else:
        targets = rng.integers(0, engine.index.n_items, size=trials)

    # Rows whose panels-per-tier the ETL folded away as Inducks' default, and the
    # values indexers recorded on the rows where they did look.
    defaulted = engine.index.cols == UNKNOWN
    recorded_layout = engine.index.cols[~defaulted]
    if not recorded_layout.size:
        recorded_layout = np.array([2], dtype=engine.index.cols.dtype)
    reader = Reader(
        rng=rng,
        lie_rate=scenario.lie_rate,
        layout_mismatch_rate=scenario.layout_mismatch_rate,
        reprints=reprints(engine.index.story_id) if scenario.layout_mismatch_rate else None,
        unindexed_magazine_rate=scenario.unindexed_magazine_rate,
        defaulted_layout_rate=scenario.defaulted_layout_rate,
        credit_rate=scenario.credit_rate,
        opaque_plot_rate=scenario.opaque_plot_rate,
        defaulted=defaulted,
        recorded_layout=recorded_layout,
    )

    # Only the row the per-question table is read off pays for the measurement.
    worth = scenario.name == benchmark.QUESTION_SOURCE
    started = time.perf_counter()
    results = [play(engine, int(t), reader, worth=worth) for t in targets]
    elapsed = time.perf_counter() - started

    qs = [r["questions"] for r in results]
    ranks = [r["rank"] for r in results]
    turns = [t for r in results for t in r["turns"]]
    answered = [t for t in turns if t["answered"]]
    return {
        "name": scenario.name,
        "elapsed": elapsed,
        "ranks": ranks,
        "targets": [int(t) for t in targets],
        "asked": qs,
        "effective": [r["effective_candidates"] for r in results],
        "stats": {
            "top-1": f"{100 * sum(1 for r in ranks if r <= 1) / len(ranks):.0f}%",
            "top-5": f"{100 * sum(1 for r in ranks if r <= 5) / len(ranks):.0f}%",
            "top-20": f"{100 * sum(1 for r in ranks if r <= 20) / len(ranks):.0f}%",
            "p90": f"{np.percentile(ranks, 90):.0f}",
            "p99": f"{np.percentile(ranks, 99):.0f}",
            "buried >500": f"{100 * sum(1 for r in ranks if r > 500) / len(ranks):.1f}%",
            "asked": f"{statistics.mean(qs):.1f}",
        },
        "questions": question_worth(turns, trials) if worth else [],
        "shortlists": shortlist_worth(engine) if worth else [],
        "spans": {
            # Bayesian updating is not monotone in spread, and the progress
            # bar's whole design rests on how often it is not.
            "answers-that-widen": f"{100 * sum(1 for t in answered if t['bits'] < 0) / len(answered):.0f}%",
            "sessions-that-widen": f"{100 * sum(1 for r in results if any(t['bits'] < 0 for t in r['turns'])) / len(results):.0f}%",
            "honest-sessions": f"{trials}",
        }
        if worth
        else {},
    }


def report(scenario: benchmark.Scenario, got: dict, trials: int, seed: int, record: bool) -> None:
    """Print one row's numbers, and record them if it is a documented row."""
    ranks, qs = got["ranks"], got["asked"]
    log.info("")
    log.info(
        "--- %s: %d trials, lie %.0f%%, layout mismatch %.0f%%, unindexed magazine %.0f%%, "
        "defaulted layout %.0f%% ---",
        scenario.name,
        trials,
        scenario.lie_rate * 100,
        scenario.layout_mismatch_rate * 100,
        scenario.unindexed_magazine_rate * 100,
        scenario.defaulted_layout_rate * 100,
    )
    log.info("questions asked   mean %.1f  median %.0f", statistics.mean(qs), statistics.median(qs))
    for k in (1, 5, 20):
        log.info(
            "true story in top-%-2d %.0f%%", k, 100 * sum(1 for r in ranks if r <= k) / len(ranks)
        )
    # A single bad answer that buries the true story is a different failure from
    # merely not resolving it, and averages hide it: report the tail separately.
    log.info(
        "rank of true story  p50 %.0f  p90 %.0f  p99 %.0f  buried (>500) %.1f%%",
        np.percentile(ranks, 50),
        np.percentile(ranks, 90),
        np.percentile(ranks, 99),
        100 * sum(1 for r in ranks if r > 500) / len(ranks),
    )
    log.info("median effective candidates left: %.0f", statistics.median(got["effective"]))
    log.info("%.2fs total, %.0fms per session", got["elapsed"], 1000 * got["elapsed"] / trials)
    if not record:
        return
    log.info(
        "%s",
        benchmark.update(
            scenario,
            got["stats"],
            {"ranks": got["ranks"], "targets": got["targets"]},
            got["questions"],
            got["shortlists"],
            trials,
            seed,
            got["spans"],
        ),
    )


def _measure_named(work: tuple[str, int, int]) -> dict:
    """A worker's whole job: one scenario, by name, so the argument pickles."""
    name, trials, seed = work
    scenario = next(s for s in benchmark.SCENARIOS if s.name == name)
    return measure(scenario, trials, seed)


def measure_all(trials: int, seed: int, workers: int) -> Iterator[tuple[benchmark.Scenario, dict]]:
    """Every documented row, played across processes, yielded in table order.

    Rows share nothing — same index on disk, separate beliefs — so the only
    reason they were ever sequential is that one process plays them one at a
    time. Recording stays in the parent, in order, because the record and the
    README are one file each.
    """
    work = [(s.name, trials, seed) for s in benchmark.SCENARIOS]
    if workers <= 1:
        for scenario in benchmark.SCENARIOS:
            yield scenario, measure(scenario, trials, seed)
        return
    with ProcessPoolExecutor(max_workers=workers) as pool:
        for scenario, got in zip(benchmark.SCENARIOS, pool.map(_measure_named, work), strict=True):
            yield scenario, got


def main() -> None:
    parser = argparse.ArgumentParser(description="Benchmark the quackinator engine")
    parser.add_argument("-n", "--trials", type=int, default=benchmark.TRIALS)
    parser.add_argument("--seed", type=int, default=11)
    parser.add_argument("--lie-rate", type=float, default=0.0)
    parser.add_argument(
        "--layout-mismatch-rate",
        type=float,
        default=0.0,
        help="rate at which layout answers are read off another printing of the same story",
    )
    parser.add_argument(
        "--unindexed-magazine-rate",
        type=float,
        default=0.0,
        help="rate at which magazine answers describe a printing Inducks has not indexed. "
        "`mise run holdout` measures it; the documented rows are played at whatever it "
        "last measured, so do not hard-code a number here",
    )
    parser.add_argument(
        "--defaulted-layout-rate",
        type=float,
        default=0.0,
        help="rate at which a reader whose row has no recorded panels-per-tier counts the "
        "real comic instead of repeating Inducks' default of 2",
    )
    parser.add_argument(
        "--credit-rate",
        type=float,
        default=0.0,
        help="rate at which the reader's copy prints a creator credit, which they type "
        "into the author box before any question is asked",
    )
    parser.add_argument(
        "--opaque-plot-rate",
        type=float,
        default=0.0,
        help="rate at which a plot term is a word the reader cannot check against the "
        'page — "does the story involve black?" — so they answer "don\'t know" however '
        "the index has it indexed",
    )
    parser.add_argument(
        "--sample",
        choices=["uniform", "prior"],
        default="prior",
        help="prior (the default) favours reprinted storyversions and is what every figure "
        "in the README reports; uniform samples any printed storyversion equally",
    )
    parser.add_argument(
        "--ablate",
        default="",
        help="comma-separated engine ablations, for reproducing a before/after argument: "
        + "; ".join(f"{name} ({what})" for name, what in benchmark.ABLATIONS.items()),
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="play every documented row in turn, refreshing every README table. The rates "
        "come from the rows themselves, so nothing here goes stale when they are "
        "re-measured",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=os.cpu_count() or 1,
        help="processes to play `--all` across; rows are independent",
    )
    parser.add_argument(
        "--no-readme",
        action="store_true",
        help="do not write the run into the README's benchmark tables",
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(message)s")
    if args.all:
        started = time.perf_counter()
        for scenario, got in measure_all(args.trials, args.seed, args.workers):
            report(scenario, got, args.trials, args.seed, record=not args.no_readme)
        log.info("")
        log.info("every row in %.0f minutes", (time.perf_counter() - started) / 60)
        return

    ablate = tuple(name for name in args.ablate.split(",") if name)
    unknown = set(ablate) - set(benchmark.ABLATIONS)
    if unknown:
        parser.error(f"unknown ablation(s): {', '.join(sorted(unknown))}")
    rates = {
        "lie_rate": args.lie_rate,
        "layout_mismatch_rate": args.layout_mismatch_rate,
        "unindexed_magazine_rate": args.unindexed_magazine_rate,
        "defaulted_layout_rate": args.defaulted_layout_rate,
        "credit_rate": args.credit_rate,
        "opaque_plot_rate": args.opaque_plot_rate,
        "sample": args.sample,
        "ablate": ablate,
    }
    scenario = benchmark.scenario_for(**rates)
    if scenario is None:
        # Still worth playing — it just has no row to land in.
        log.info("no documented row matches this run; the README will not be updated")
        scenario = benchmark.Scenario(name="ad hoc", **rates)
        args.no_readme = True
    report(
        scenario,
        measure(scenario, args.trials, args.seed),
        args.trials,
        args.seed,
        record=not args.no_readme,
    )


if __name__ == "__main__":
    main()
