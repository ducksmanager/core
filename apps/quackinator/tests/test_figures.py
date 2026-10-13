"""The README states no figure that no command can produce."""

import pytest

from quackinator import figures


def test_no_figure_in_the_readme_is_typed_by_hand():
    """The rule, enforced.

    Every percentage, bit count, multiplier and thousands-separated number in the
    README is either inside a generated table or inside an inline span that a
    generator fills. A new one that is neither fails here, which is what keeps a
    figure in the README from drifting away from what the code scores.

    If this fails on a figure you just wrote: give it a generator (`facts.py` for
    the index, `engine/benchmark.py` for a simulation, `etl/facts.py` or
    `etl/holdout.py` for the dump), or say it in words instead.
    """
    unsourced = figures.audit()
    assert not unsourced, "\n".join(f"line {u.line}: {u.figure} — {u.context}" for u in unsourced)


def test_a_span_is_rewritten_in_place(tmp_path, monkeypatch):
    readme = tmp_path / "README.md"
    readme.write_text("covers <!-- fig:scan-coverage -->old<!-- /fig --> of stories\n")
    monkeypatch.setattr(figures, "README", readme)

    written, missing = figures.fill({"scan-coverage": "94.8%"})
    assert written == ["scan-coverage"]
    assert not missing
    assert readme.read_text() == "covers <!-- fig:scan-coverage -->94.8%<!-- /fig --> of stories\n"


def test_a_value_with_no_span_is_reported_not_dropped(tmp_path, monkeypatch):
    """A generator computing something the README no longer says is dead weight."""
    readme = tmp_path / "README.md"
    readme.write_text("nothing to fill\n")
    monkeypatch.setattr(figures, "README", readme)

    written, missing = figures.fill({"scan-coverage": "94.8%"})
    assert not written
    assert missing == ["scan-coverage"]


@pytest.mark.parametrize(
    ("text", "found"),
    [
        ("the index covers 94.8% of stories", True),
        ("worth 2.1 bits at the start", True),
        ("penalised it ~700x", True),
        ("111,350 storyversions", True),
        ("covers <!-- fig:x -->94.8%<!-- /fig --> of stories", False),
        ("serve on :8000, proxied from 5173", False),  # ports are not measurements
        ("the sentinel `9999-12-31` on `12,107` rows", False),  # code spans
        ("see [the table](#x-1234)", False),  # link targets
    ],
)
def test_audit_tells_measurements_from_structure(text, found):
    assert bool(figures.audit(text)) is found
