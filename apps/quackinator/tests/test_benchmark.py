"""The README's benchmark table is written by the run, so the writing is tested."""

import json

import pytest

from quackinator.engine import benchmark

STATS = {c: "x" for c in benchmark.COLUMNS}
QUESTIONS = [
    {"question": "How long is the story?", **dict.fromkeys(benchmark.QUESTION_COLUMNS, "1")}
]


SHORTLISTS = [dict.fromkeys(benchmark.SHORTLIST_COLUMNS, "8")]


def update(scenario, stats=None, trials=benchmark.TRIALS, seed=11, trial_results=None):
    return benchmark.update(
        scenario,
        stats or STATS,
        trial_results or {"ranks": [1] * trials, "targets": list(range(trials))},
        QUESTIONS,
        SHORTLISTS,
        trials=trials,
        seed=seed,
    )


@pytest.fixture
def readme(tmp_path, monkeypatch):
    """A README with the managed block, and a record file beside it."""
    path = tmp_path / "README.md"
    blocks = "\n\n".join(f"{b.begin}\n{b.end}" for b in benchmark.BLOCKS)
    path.write_text(f"before\n\n{blocks}\n\nafter\n")
    monkeypatch.setattr(benchmark, "README", path)
    monkeypatch.setattr(benchmark, "RECORD", tmp_path / "benchmarks.json")
    return path


def test_a_run_matches_the_scenario_it_played():
    honest = benchmark.scenario_for(
        lie_rate=0.0,
        layout_mismatch_rate=0.0,
        unindexed_magazine_rate=0.0,
        defaulted_layout_rate=0.0,
        sample="prior",
    )
    assert honest is not None
    assert honest.name == "Honest reader"


def test_an_undocumented_reader_matches_nothing():
    """Whether a reader is worth documenting is not a run's decision to make."""
    assert benchmark.scenario_for(lie_rate=0.037) is None


def test_a_run_at_another_trial_count_records_nothing(readme):
    """Rows are only comparable when they played the same targets.

    The targets come from the seed and the trial count, so a row measured at a
    different count is not a row in the same experiment — it is a second
    experiment wearing the first one's table. Recording it would make every
    comparison in that table quietly meaningless.
    """
    honest = benchmark.SCENARIOS[0]
    update(honest)
    measured = readme.read_text()

    for trials in (5, benchmark.TRIALS // 2, benchmark.TRIALS * 2):
        got = update(honest, dict.fromkeys(benchmark.COLUMNS, "junk"), trials=trials)
        assert "not be comparable" in got
    assert readme.read_text() == measured


def test_every_block_is_rewritten_in_place(readme):
    update(benchmark.SCENARIOS[0])
    text = readme.read_text()
    assert text.startswith("before\n")
    assert text.endswith("after\n")
    for block in benchmark.BLOCKS:
        assert text.count(block.begin) == 1
    assert "| Honest reader |" in text
    assert f"{benchmark.TRIALS} trials, seed 11" in text
    # The honest run is the baseline of every scenario table, measured once and
    # rendered into each one that names it.
    honest = benchmark.SCENARIOS[0]
    assert text.count(f"| {benchmark.row_label(honest)} |") == len(honest.blocks)
    # ...and it is where the per-question table comes from.
    assert "| How long is the story? |" in text

    # Rewriting is idempotent: a second identical run leaves the same file.
    update(benchmark.SCENARIOS[0])
    assert readme.read_text() == text


def test_an_ablated_row_is_a_different_measurement(readme):
    """An ablation is part of a row's identity, not a footnote to it."""
    honest, ablated = benchmark.SCENARIOS[0], benchmark.scenario_for(ablate=("decade",))
    assert ablated is not None
    assert benchmark.scenario_for(ablate=()) is honest

    update(honest)
    update(ablated, dict.fromkeys(benchmark.COLUMNS, "z"))
    text = readme.read_text()
    assert f"| {ablated.name} | z |" in text
    assert "| Honest reader | x |" in text


def test_the_per_question_table_comes_from_the_honest_run(readme):
    """Question worth is a property of the engine, not of a damaged reader."""
    adverse = benchmark.SCENARIOS[1]
    update(adverse)
    text = readme.read_text()
    assert "Not yet measured" in text
    assert "| How long is the story? |" not in text


def test_a_run_refreshes_one_row_and_keeps_the_rest(readme):
    update(benchmark.SCENARIOS[0])
    update(benchmark.SCENARIOS[1], dict.fromkeys(benchmark.COLUMNS, "y"))

    record = json.loads((readme.parent / "benchmarks.json").read_text())
    assert set(record) == {benchmark.SCENARIOS[0].name, benchmark.SCENARIOS[1].name}
    text = readme.read_text()
    assert f"| {benchmark.SCENARIOS[0].name} | x |" in text
    assert f"| {benchmark.SCENARIOS[1].name} | y |" in text


def test_an_unmeasured_row_says_how_to_measure_it(readme):
    update(benchmark.SCENARIOS[0])
    text = readme.read_text()
    for scenario in benchmark.SCENARIOS[1:]:
        assert f"| {benchmark.row_label(scenario)} | — |" in text
        assert scenario.command in text


def test_every_documented_row_is_reachable_from_the_command_line(readme):
    """A row nobody can run is exactly the stale table this replaces."""
    for scenario in benchmark.SCENARIOS:
        for name in scenario.ablate:
            assert name in benchmark.ABLATIONS
        assert set(scenario.blocks) <= {b.name for b in benchmark.BLOCKS}


def test_a_readme_without_the_block_is_left_alone(tmp_path, monkeypatch):
    """Never guess where the table goes: a missing block is the author's call."""
    path = tmp_path / "README.md"
    path.write_text("no block here\n")
    monkeypatch.setattr(benchmark, "README", path)
    monkeypatch.setattr(benchmark, "RECORD", tmp_path / "benchmarks.json")

    got = update(benchmark.SCENARIOS[0])
    assert "no <!-- sim:…:begin --> block" in got
    assert path.read_text() == "no block here\n"
    assert not (tmp_path / "benchmarks.json").exists()


# --- comparing two rows -----------------------------------------------------


def rows(a_ranks, b_ranks, targets=None):
    targets = targets or list(range(len(a_ranks)))
    return {
        "A": {"ranks": a_ranks, "targets": targets},
        "B": {"ranks": b_ranks, "targets": targets},
    }


def test_agreement_carries_no_evidence_either_way():
    """Trials both rows get right, or both get wrong, say nothing about the gap.

    They are most of the run, and averaging them into two percentages is what
    buries a real difference under sampling noise.
    """
    both_right = benchmark.paired(rows([1] * 100, [1] * 100), "A", "B")
    assert both_right.delta == 0
    assert both_right.gained == both_right.lost == 0
    assert not both_right.decisive

    # Add fifty trials nobody gets right: the comparison must not move.
    padded = benchmark.paired(rows([1] * 100 + [9] * 50, [1] * 100 + [9] * 50), "A", "B")
    assert padded.delta == both_right.delta
    assert padded.gained == padded.lost == 0


def test_a_consistent_winner_is_called_decisive():
    """Twelve disagreements all falling one way is a real effect, at any size."""
    a = [1] * 12 + [1] * 200 + [9] * 288
    b = [9] * 12 + [1] * 200 + [9] * 288
    got = benchmark.paired(rows(a, b), "A", "B")
    assert got.gained == 12
    assert got.lost == 0
    assert got.decisive
    # ...worth only 2.4 points of top-1, which is the size an unpaired
    # comparison of two 500-trial runs cannot resolve.
    assert got.delta == pytest.approx(2.4)


def test_disagreements_that_cancel_are_not_a_finding():
    a = [1] * 30 + [9] * 30 + [1] * 440
    b = [9] * 30 + [1] * 30 + [1] * 440
    got = benchmark.paired(rows(a, b), "A", "B")
    assert got.delta == 0
    assert got.gained == got.lost == 30
    assert not got.decisive


def test_rows_that_played_different_targets_are_not_comparable():
    """Pairing two different experiments is the mistake this exists to avoid."""
    record = rows([1, 1, 9], [1, 9, 9])
    record["B"]["targets"] = [7, 8, 9]
    assert benchmark.paired(record, "A", "B") is None


def test_a_row_with_no_per_trial_record_is_not_compared():
    record = rows([1, 1, 9], [1, 9, 9])
    del record["B"]["ranks"]
    assert benchmark.paired(record, "A", "B") is None


def test_every_row_names_a_baseline_that_exists():
    names = {s.name for s in benchmark.SCENARIOS}
    for scenario in benchmark.SCENARIOS:
        assert scenario.compare_to is None or scenario.compare_to in names
    # The baseline of the whole benchmark compares against nothing.
    assert benchmark.SCENARIOS[0].compare_to is None


def test_rank_sees_a_difference_that_never_crosses_first_place():
    """Two engines can rank the true story 2nd and 2000th and agree on top-1.

    The count of first places is one bit per trial and throws the rest away.
    Half the comparisons in the README are of that shape, so the rank pairing is
    the one to read.
    """
    a = [2] * 200 + [1] * 300
    b = [2000] * 200 + [1] * 300
    got = benchmark.paired(rows(a, b), "A", "B")
    assert got.gained == got.lost == 0
    assert not got.decisive
    assert got.ratio == pytest.approx(0.001)
    assert got.decisive_on_rank


def test_two_identical_rows_differ_in_neither():
    ranks = [1, 2, 40, 900, 1]
    got = benchmark.paired(rows(ranks, list(ranks)), "A", "B")
    assert got.delta == 0
    assert got.ratio == 1.0
    assert not got.decisive and not got.decisive_on_rank
