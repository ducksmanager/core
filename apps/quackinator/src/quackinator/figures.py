"""Every figure in the README, and the machinery that keeps them sourced.

The rule this module enforces: **no number in the README is typed by a human.**
Each one is either inside a generated table, or inside an inline span a generator
fills:

    covers <!-- fig:scan-coverage -->94.8%<!-- /fig --> of the index's stories

Blocks are for tables, spans are for prose, and `audit` finds anything that is
neither. A figure that no command can produce is not allowed to stay in the
document — that is the whole point, and it has already cost the README two
conclusions that had quietly stopped being true.

Three generators write here, in increasing order of what they need:

    mise run facts   the built index alone
    mise run sim     a simulation against it
    mise run dump    the MariaDB dump the index is built from
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
README = ROOT / "README.md"

SPAN = re.compile(r"(<!-- fig:([a-z0-9-]+) -->)(.*?)(<!-- /fig -->)", re.DOTALL)

# What counts as a figure: a measurement, not a port number or a story code.
FIGURE = re.compile(
    r"""
    \b\d[\d,]*(\.\d+)?\s*%          # 38%, 94.8%
    | \b\d+(\.\d+)?\s*bits?\b       # 2.1 bits
    | \b\d+(\.\d+)?x\b              # 700x
    | \b\d{1,3}(,\d{3})+\b          # 111,350
    """,
    re.VERBOSE,
)

# Regions where digits are structure rather than measurement.
SKIP = [
    re.compile(r"```.*?```", re.DOTALL),  # fenced code
    re.compile(r"`[^`]*`"),  # inline code: column names, sentinels, codes
    re.compile(r"\]\([^)]*\)"),  # link targets
    re.compile(r"<!--.*?-->", re.DOTALL),  # the markers themselves
]


@dataclass(frozen=True)
class Unsourced:
    """A figure in the README that no command produced."""

    line: int
    figure: str
    context: str


def _blank(text: str, pattern: re.Pattern[str]) -> str:
    """Replace matches with spaces, so line and column numbers survive."""
    return pattern.sub(lambda m: re.sub(r"\S", " ", m.group(0)), text)


def sourced_regions(text: str) -> list[tuple[int, int]]:
    """Character spans of everything a generator owns: blocks and inline spans."""
    regions = [(m.start(), m.end()) for m in SPAN.finditer(text)]
    for begin in re.finditer(r"<!-- sim:([a-z]+):begin -->", text):
        name = begin.group(1)
        end = text.find(f"<!-- sim:{name}:end -->", begin.end())
        if end != -1:
            regions.append((begin.start(), end))
    return regions


def audit(text: str | None = None) -> list[Unsourced]:
    """Figures that are neither generated nor inside a span. Should be empty."""
    text = README.read_text() if text is None else text
    masked = text
    for pattern in SKIP:
        masked = _blank(masked, pattern)
    for start, end in sourced_regions(text):
        masked = masked[:start] + re.sub(r"\S", " ", masked[start:end]) + masked[end:]

    lines = text.split("\n")
    out = []
    for match in FIGURE.finditer(masked):
        line = masked.count("\n", 0, match.start())
        out.append(Unsourced(line + 1, match.group(0).strip(), lines[line].strip()[:90]))
    return out


def fill(values: dict[str, str]) -> tuple[list[str], list[str]]:
    """Write each value into its span. Returns (written, missing) names.

    A value with no span is reported rather than dropped: it means a generator
    computes something the README no longer says, which is how a figure quietly
    becomes unused.
    """
    text = README.read_text()
    written: list[str] = []

    def replace(match: re.Match[str]) -> str:
        open_tag, name, _current, close_tag = match.groups()
        if name not in values:
            return match.group(0)
        written.append(name)
        return f"{open_tag}{values[name]}{close_tag}"

    updated = SPAN.sub(replace, text)
    if updated != text:
        README.write_text(updated)
    return sorted(written), sorted(set(values) - set(written))


def replace_block(text: str, begin: str, end: str, body: str) -> str:
    """Swap the contents of one managed block, leaving the rest of the file alone."""
    start, stop = text.index(begin), text.index(end) + len(end)
    return text[:start] + body + text[stop:]
