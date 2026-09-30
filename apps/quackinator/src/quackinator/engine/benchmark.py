"""The benchmark's record, and the README tables rendered from it.

`simulate.py` measures; this module remembers. Every number in the README's
benchmark section is written by a run of the current code. A figure nobody can
reproduce is not evidence, it is a rumour with a table around it.

So a table is only allowed to exist here if a run can regenerate it. That is a
constraint on the *arguments* too, not only on the record: it is why the
before/after comparisons are `--ablate` flags rather than a script somebody ran
once. An argument worth keeping in the README is worth being able to re-run.

Two rules keep the record honest:

**The rows are curated, the numbers are not.** A run refreshes the row whose
reader and ablations it matches, and creates nothing. Which readers are worth
documenting is an editorial decision that belongs in `SCENARIOS`, next to the
argument for each one; what they score is not a decision at all.

**Only a full run counts.** A twenty-trial run while iterating is a debugging
tool, not a measurement, and must not overwrite one.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

import numpy as np
from scipy import stats

from quackinator import figures
from quackinator.etl.holdout import measured_rate

# The standard every row is measured at. Rows are only comparable to each other
# when they played the same targets, and the targets are drawn from the seed and
# the count — so a run at any other count records nothing rather than leaving a
# table whose rows are quietly incomparable. 500 is where the decade rows stop
# disagreeing by less than their own noise.
TRIALS = 500
MIN_TRIALS = TRIALS

README = figures.README
# Beside the README rather than under `data/`, which is generated and ignored.
RECORD = figures.ROOT / "benchmarks.json"

# What each `--ablate` name takes away, for the reader of the README.
ABLATIONS: dict[str, str] = {
    "fractional-pages": "read story lengths in whole pages, as before sub-page "
    "lengths were indexed",
    "decade": "drop the decade question from the bank",
    "decade-floor": "ask the decade question on recorded printings alone, without the "
    "first-publication floor",
    "decade-membership": "ask it on the first-publication floor alone, without the "
    "recorded printings",
    "family-patience": "keep asking a question family the reader has stopped being able "
    "to answer, as before skips were counted against it",
}


@dataclass(frozen=True)
class Scenario:
    """One measurement worth keeping standing: a reader, and an engine to play it."""

    name: str
    lie_rate: float = 0.0
    layout_mismatch_rate: float = 0.0
    unindexed_magazine_rate: float = 0.0
    defaulted_layout_rate: float = 0.0
    credit_rate: float = 0.0
    opaque_plot_rate: float = 0.0
    sample: str = "prior"
    # Names from `ABLATIONS`: what to take away from the engine before playing.
    ablate: tuple[str, ...] = ()
    # Which README tables this row appears in. The honest run is the baseline of
    # all of them, and is measured once.
    blocks: tuple[str, ...] = ("scenarios",)
    # The row this one is an argument against. Every row plays the same targets
    # in the same order, so the two can be compared story by story rather than
    # as two independent percentages — see `paired`.
    compare_to: str | None = "Honest reader"

    @property
    def command(self) -> str:
        """The command that measures this row."""
        parts = [
            f"--{flag}-rate {value}"
            for flag, value in (
                ("credit", self.credit_rate),
                ("lie", self.lie_rate),
                ("layout-mismatch", self.layout_mismatch_rate),
                ("unindexed-magazine", self.unindexed_magazine_rate),
                ("defaulted-layout", self.defaulted_layout_rate),
                ("opaque-plot", self.opaque_plot_rate),
            )
            if value
        ]
        if self.sample != "prior":
            parts.append(f"--sample {self.sample}")
        if self.ablate:
            parts.append(f"--ablate {','.join(self.ablate)}")
        return f"mise run sim -- {' '.join(parts)}".strip().removesuffix(" --")

    def matches(self, **run: Any) -> bool:
        return all(getattr(self, k) == v for k, v in run.items())


# How often a reader's magazine is one the index has never seen. Measured by
# `mise run holdout` rather than chosen, so it tracks the dump: a row played at
# a rate nobody measured is the same kind of claim as a table nobody can
# regenerate.
UNINDEXED = measured_rate("decade", default=0.27)

# The other adverse rates are bounds rather than measurements: `columnsperpage`
# is a default on most rows, so a reader who always counts the real comic is the
# honest worst case, and a reader who lies at a tenth of answers is a stress
# test. The ablations reproduce the engine as it was before the two changes that
# shaped it, which is the only way those arguments stay checkable — see
# `ABLATIONS`.
SCENARIOS: list[Scenario] = [
    Scenario("Honest reader", blocks=("scenarios", "ablations", "decade"), compare_to=None),
    Scenario("Re-laid-out reprint 20%", layout_mismatch_rate=0.2),
    Scenario(
        "Unindexed magazine", unindexed_magazine_rate=UNINDEXED, blocks=("scenarios", "decade")
    ),
    Scenario("Counts the real panels", defaulted_layout_rate=1.0),
    # The plot bank is bare words lifted from description prose, so some of them
    # name nothing a reader can look for. These two bracket how much of the
    # bank's measured worth survives a reader who has to say so: the rate is not
    # measurable from the dump — it is a property of the words, not of the data —
    # so it is bracketed rather than estimated, like `defaulted_layout_rate`.
    Scenario("Half the plot terms are opaque", opaque_plot_rate=0.5),
    Scenario("Every plot term is opaque", opaque_plot_rate=1.0),
    # What counting skips against a family buys, measured against the reader it
    # exists for: one who keeps meeting plot words they cannot check. The
    # baseline is the same reader on the engine that asked anyway.
    Scenario(
        "Half opaque, asks anyway",
        opaque_plot_rate=0.5,
        ablate=("family-patience",),
        blocks=("ablations",),
        compare_to="Half the plot terms are opaque",
    ),
    # And against the reader it matters most for: one who can answer none of
    # them, so every turn the old engine spent there was spent for nothing.
    Scenario(
        "Every term opaque, asks anyway",
        opaque_plot_rate=1.0,
        ablate=("family-patience",),
        blocks=("ablations",),
        compare_to="Every plot term is opaque",
    ),
    Scenario("Answers wrongly 10%", lie_rate=0.1),
    # What the author box buys when the printing carries a credit. The rate at
    # which printings do is the one number the dump cannot supply, so this row
    # is the upper end of it rather than an estimate of it.
    Scenario("Reads the author off the page", credit_rate=1.0),
    Scenario("No fractional lengths", ablate=("fractional-pages",), blocks=("ablations",)),
    Scenario("No decade question", ablate=("decade",), blocks=("ablations",)),
    Scenario("Neither", ablate=("fractional-pages", "decade"), blocks=("ablations",)),
    # The decade question against the reader it is worst for. Its baseline is
    # the "Neither" row, whose number is the same for this reader as for the
    # honest one: an engine that never asks about the decade cannot be misled by
    # a magazine the index has no record of.
    Scenario(
        "Decade only, unindexed magazine",
        unindexed_magazine_rate=UNINDEXED,
        ablate=("fractional-pages",),
        blocks=("ablations",),
        compare_to="Unindexed magazine",
    ),
    # The decade question's two halves, each alone, against the reader the
    # pairing exists for. Set membership says where a story was printed; the
    # floor says only that it cannot have been printed before it existed. The
    # claim is that the second is what protects a reader whose magazine the
    # index has never seen, and that claim needs both halves measurable apart.
    Scenario("Recorded printings only", ablate=("decade-floor",), blocks=("decade",)),
    Scenario(
        "Recorded printings only, unindexed",
        unindexed_magazine_rate=UNINDEXED,
        ablate=("decade-floor",),
        blocks=("decade",),
        compare_to="Unindexed magazine",
    ),
    Scenario("First-publication floor only", ablate=("decade-membership",), blocks=("decade",)),
    Scenario(
        "Floor only, unindexed",
        unindexed_magazine_rate=UNINDEXED,
        ablate=("decade-membership",),
        blocks=("decade",),
        compare_to="Unindexed magazine",
    ),
]

COLUMNS = ["top-1", "top-5", "top-20", "p90", "p99", "buried >500", "asked"]
QUESTION_COLUMNS = [
    "Asked per session",
    "Answered",
    "Avg bits",
    "Narrows by",
    "Bits per session",
    "Median turn",
]

# The run the per-question table is read off. Question worth is a property of
# the engine, not of a damaged reader, so it comes from the honest run.
QUESTION_SOURCE = "Honest reader"

SHORTLIST_COLUMNS = [
    "Names shown",
    "Reader's name is on the list",
    "Bits from a true answer",
    "Median rank after answering",
]


@dataclass
class Block:
    """One managed table in the README, and how to fill it."""

    name: str
    render: Any = field(repr=False)

    @property
    def begin(self) -> str:
        return f"<!-- sim:{self.name}:begin -->"

    @property
    def end(self) -> str:
        return f"<!-- sim:{self.name}:end -->"


def scenario_for(**run: Any) -> Scenario | None:
    """The documented scenario this run measures, if it is one of them."""
    return next((s for s in SCENARIOS if s.matches(**run)), None)


def load() -> dict[str, dict[str, Any]]:
    if not RECORD.exists():
        return {}
    return json.loads(RECORD.read_text())


def _table(header: list[str], rows: list[list[str]]) -> list[str]:
    return [
        f"| {' | '.join(header)} |",
        "|---" * len(header) + "|",
        *(f"| {' | '.join(row)} |" for row in rows),
    ]


def _provenance(got: dict[str, Any]) -> str:
    return f"{got['date']}, {got['trials']} trials, seed {got['seed']}"


@dataclass(frozen=True)
class Paired:
    """One row against the row it argues with, story by story.

    Both rows played the same targets in the same order, so most trials are a
    story both engines find or both engines miss. Those carry no information
    about the difference between them, and averaging them into two percentages
    is what buries a real effect under sampling noise. Only the trials where the
    two *disagree* say anything, and there are few enough of them to count.
    """

    delta: float  # difference in top-1, in points
    gained: int  # trials this row got right and its baseline did not
    lost: int  # ...and the other way round
    trials: int
    p: float  # two-sided exact test on the disagreements alone
    # Rank says more per trial than a hit does. Two engines can put the true
    # story second and two-thousandth and agree on top-1 either way, so a
    # difference that never crosses first place is invisible to the count above
    # and plain here.
    ratio: float  # median rank against the baseline's: above 1 is worse
    rank_p: float

    @property
    def decisive(self) -> bool:
        """Whether the disagreements are lopsided enough to mean something."""
        return self.p < 0.05

    @property
    def decisive_on_rank(self) -> bool:
        return self.rank_p < 0.05

    def __str__(self) -> str:
        sign = "+" if self.delta >= 0 else "−"
        return (
            f"{sign}{abs(self.delta):.1f} pts {_p(self.p)}"
            f" · rank ×{self.ratio:.2f} {_p(self.rank_p)}"
        )


def _p(value: float) -> str:
    return f"p={value:.3f}" if value >= 0.001 else "p<0.001"


def paired(record: dict[str, dict[str, Any]], name: str, baseline: str) -> Paired | None:
    """Compare two recorded rows trial by trial. None if they are not comparable.

    Refuses to compare rows that did not play the same targets: pairing them
    would be arithmetic on two different experiments, which is exactly the
    mistake this is here to avoid.
    """
    got, base = record.get(name), record.get(baseline)
    if not got or not base or not got.get("ranks") or not base.get("ranks"):
        return None
    if got.get("targets") != base.get("targets"):
        return None

    ranks = np.asarray(got["ranks"], dtype=float)
    base_ranks = np.asarray(base["ranks"], dtype=float)
    hits, base_hits = ranks == 1, base_ranks == 1
    gained = int((hits & ~base_hits).sum())
    lost = int((base_hits & ~hits).sum())
    n = ranks.size
    # McNemar: under "the two are the same", each disagreement is a coin flip,
    # so the evidence is entirely in how lopsided they are.
    discordant = gained + lost
    p = float(stats.binomtest(min(gained, lost), discordant, 0.5).pvalue) if discordant else 1.0

    # The same pairing on rank rather than on first place. Ranks span five
    # orders of magnitude, so the comparison is on their ratio.
    moved = np.log(ranks) - np.log(base_ranks)
    moved = moved[moved != 0]
    rank_p = float(stats.wilcoxon(moved).pvalue) if moved.size else 1.0
    ratio = float(np.exp(np.median(moved))) if moved.size else 1.0
    return Paired(
        delta=100 * (gained - lost) / n,
        gained=gained,
        lost=lost,
        trials=n,
        p=p,
        ratio=ratio,
        rank_p=rank_p,
    )


def row_label(scenario: Scenario) -> str:
    """What a row calls itself. The unindexed rate is measured, so it is shown
    rather than baked into the name: the name is the record's key and has to
    survive a re-measurement, the label has to tell the truth about one."""
    if not scenario.unindexed_magazine_rate:
        return scenario.name
    return f"{scenario.name} ({scenario.unindexed_magazine_rate:.0%} unindexed)"


def render_scenarios(record: dict[str, dict[str, Any]], block: str) -> list[str]:
    rows = []
    for scenario in SCENARIOS:
        if block not in scenario.blocks:
            continue
        got = record.get(scenario.name)
        if got is None:
            cells = ["—"] * len(COLUMNS) + ["—", f"not yet — `{scenario.command}`"]
        else:
            against = (
                paired(record, scenario.name, scenario.compare_to) if scenario.compare_to else None
            )
            cells = [
                *(str(got[c]) for c in COLUMNS),
                str(against) if against else "—",
                _provenance(got),
            ]
        rows.append([row_label(scenario), *cells])

    compared = {s.compare_to for s in SCENARIOS if block in s.blocks and s.compare_to}
    note = [
        "",
        "The last column compares each row against "
        + (
            f"`{next(iter(compared))}`"
            if len(compared) == 1
            else "the row it argues with (" + ", ".join(f"`{c}`" for c in sorted(compared)) + ")"
        )
        + " story by story rather than as two",
        "percentages: every row plays the same targets in the same order, so a difference",
        "shows up in the trials where the two disagree. The first half is first place, the",
        "second is where the true story landed — a rank ratio above 1 is worse. Rank sees",
        "differences that never cross first place, so read it first.",
    ]
    return _table(["Reader", *COLUMNS, "vs baseline", "measured"], rows) + note


def render_questions(record: dict[str, dict[str, Any]], block: str) -> list[str]:
    got = record.get(QUESTION_SOURCE)
    if got is None or not got.get("questions"):
        return [f"Not yet measured — `{SCENARIOS[0].command}`."]
    rows = [[q["question"], *(str(q[c]) for c in QUESTION_COLUMNS)] for q in got["questions"]]
    return [
        f"The honest reader, {_provenance(got)}. Bits are the drop in the effective",
        "number of candidate *stories* — the engine's belief is over storyversions, but",
        "a reader wants the story, so that is what these count.",
        "",
        *_table(["Question", *QUESTION_COLUMNS], rows),
    ]


def render_shortlists(record: dict[str, dict[str, Any]], block: str) -> list[str]:
    got = record.get(QUESTION_SOURCE)
    if got is None or not got.get("shortlists"):
        return [f"Not yet measured — `{SCENARIOS[0].command}`."]
    rows = [[str(r[c]) for c in SHORTLIST_COLUMNS] for r in got["shortlists"]]
    return [
        f"Computed from the index at the prior on {got['date']} — no simulation, except",
        "the rank column, which is the median over 400 seeded prior-sampled readers who",
        "answer truthfully. They start at a median rank in the tens of thousands.",
        "",
        *_table(SHORTLIST_COLUMNS, rows),
    ]


BLOCKS = [
    Block("scenarios", render_scenarios),
    Block("ablations", render_scenarios),
    Block("decade", render_scenarios),
    Block("questions", render_questions),
    Block("shortlists", render_shortlists),
]


def render(block: Block, record: dict[str, dict[str, Any]]) -> str:
    return "\n".join(
        [
            block.begin,
            "",
            "Written by `mise run sim`. Do not edit by hand.",
            "",
            *block.render(record, block.name),
            "",
            block.end,
        ]
    )


def rewrite(record: dict[str, dict[str, Any]]) -> list[str]:
    """Refresh every managed block the README carries. Returns the ones written."""
    text = README.read_text()
    written = []
    for block in BLOCKS:
        if block.begin not in text or block.end not in text:
            continue
        start, end = text.index(block.begin), text.index(block.end) + len(block.end)
        text = text[:start] + render(block, record) + text[end:]
        written.append(block.name)
    README.write_text(text)
    return written


def update(
    scenario: Scenario,
    stats: dict[str, Any],
    trial_results: dict[str, list[int]],
    questions: list[dict[str, Any]],
    shortlists: list[dict[str, Any]],
    trials: int,
    seed: int,
    spans: dict[str, str] | None = None,
) -> str:
    """Record one measurement and refresh the README. Returns what happened."""
    if trials != TRIALS:
        return (
            f"README not updated: the table is measured at {TRIALS} trials and this run "
            f"played {trials}, so its rows would not be comparable"
        )
    if not README.exists():
        return f"README not updated: no {README}"
    if not any(b.begin in README.read_text() for b in BLOCKS):
        return "README not updated: it carries no <!-- sim:…:begin --> block to write into"

    record = load()
    record[scenario.name] = {
        **stats,
        # Per trial, so rows can be compared against each other afterwards
        # rather than only summarised. See `paired`.
        **(trial_results or {}),
        "questions": questions,
        "shortlists": shortlists,
        "trials": trials,
        "seed": seed,
        "date": datetime.now(tz=UTC).date().isoformat(),
    }
    RECORD.write_text(json.dumps(record, indent=2, sort_keys=True) + "\n")
    written = rewrite(record)
    # Prose figures from the same run: only the honest reader's, since the
    # sentences they sit in are about the engine, not about a damaged reader.
    if spans and scenario.name == QUESTION_SOURCE:
        written += figures.fill(spans)[0]
    return f'README updated from "{scenario.name}": {", ".join(written)}'
