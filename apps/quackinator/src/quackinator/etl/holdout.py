"""How often the reader's printing is one Inducks does not have. `mise run holdout`.

The engine's central distinction is between a fact about the *story* — its
characters, its length, who drew it — and a fact about the *printing* in the
reader's hands. Story facts hold whatever copy they are holding. Printing facts
can only ever be checked against the printings Inducks happens to have recorded,
and the reader this engine is for is precisely the one holding a printing it has
not.

That is measurable, and this measures it: hold out a tenth of the printings at
random, then ask, of each held-out printing, whether the *rest* of the record for
that storyversion would still recognise its magazine, its language, its decade,
its country. A miss means a reader answering truthfully about their own copy
contradicts the index.

It is the number every printing-level question lives or dies by, and it is why
the language question was deleted, why the magazine title is a fast path rather
than a question, and why the decade question needs its first-publication floor.
`Settings.decade_noise` and `--unindexed-magazine-rate` are both set from here.
"""

from __future__ import annotations

import json
import logging
from collections import defaultdict
from datetime import UTC, datetime

import numpy as np
import pymysql

from quackinator import figures
from quackinator.config import Settings, settings
from quackinator.etl.extract import connect, fetch_all, stream

log = logging.getLogger(__name__)

# A tenth of the printings, which is the share the README's figures are quoted
# at, and a seed so the answer is the same tomorrow.
HELD_OUT = 0.10
SEED = 11

# The measurement, kept where the benchmark and the simulated reader can read it
# rather than in a constant somebody has to remember to update. `0.27` lived in
# four files and was nine points stale in all of them.
RECORD = figures.ROOT / "holdout.json"

ISSUES = "SELECT issuecode, publicationcode, oldestdate FROM inducks_issue"
ENTRIES = """
    SELECT storyversioncode, issuecode, languagecode
    FROM inducks_entry WHERE is_cover = 0 AND storyversioncode <> ''
"""


def _decade(date: str | None) -> str | None:
    if not date or len(str(date)) < 4 or not str(date)[:4].isdigit():
        return None
    return f"{int(str(date)[:4]) // 10 * 10}s"


def miss_rates(conn: pymysql.Connection) -> dict[str, dict[str, float]]:
    """Per signal: how often a held-out printing's answer is unrecorded elsewhere.

    One pass over the entries, holding the per-storyversion value counts rather
    than the entries themselves: an answer survives the holdout if any *kept*
    printing of the same storyversion carries the same value.
    """
    issues: dict[str, tuple[str, str | None]] = {}
    for code, publication, oldest in stream(conn, ISSUES):
        issues[code] = (publication or "", _decade(oldest))

    rng = np.random.default_rng(SEED)
    signals = ("magazine", "country", "language", "decade")
    kept: dict[str, dict[tuple[str, str], int]] = {s: defaultdict(int) for s in signals}
    held: dict[str, list[tuple[str, str]]] = {s: [] for s in signals}
    labels: dict[str, set[str]] = {s: set() for s in signals}

    total = 0
    for version, issue, language in stream(conn, ENTRIES):
        publication, decade = issues.get(issue, ("", None))
        values = {
            "magazine": publication,
            # `fr/JM` — the country is the prefix of the publication code.
            "country": publication.split("/")[0] if publication else "",
            "language": language or "",
            "decade": decade or "",
        }
        total += 1
        out = rng.random() < HELD_OUT
        for signal, value in values.items():
            if not value:
                continue
            labels[signal].add(value)
            if out:
                held[signal].append((version, value))
            else:
                kept[signal][(version, value)] += 1

    log.info("%s printings, %.0f%% held out", f"{total:,}", 100 * HELD_OUT)
    out: dict[str, dict[str, float]] = {}
    for signal in signals:
        misses = sum(1 for key in held[signal] if kept[signal][key] == 0)
        out[signal] = {
            "miss": 100 * misses / len(held[signal]) if held[signal] else 0.0,
            "labels": len(labels[signal]),
            "held": len(held[signal]),
        }
        log.info(
            "%-9s %6.1f%% of held-out printings unrecorded, over %s labels",
            signal,
            out[signal]["miss"],
            f"{out[signal]['labels']:,}",
        )
    return out


def measured_rate(signal: str, default: float = 0.0) -> float:
    """The share of held-out printings whose `signal` the index does not record.

    This is what `--unindexed-magazine-rate` defaults to, and what the adverse
    rows of the benchmark are played at: the rate a real reader hits, measured,
    not a number chosen once. Falls back to `default` where the dump has never
    been held out on this machine — a fresh clone can still run the benchmark,
    it just cannot claim the adverse rate is the measured one.
    """
    if not RECORD.exists():
        return default
    got = json.loads(RECORD.read_text())
    return float(got.get("signals", {}).get(signal, {}).get("miss", default * 100)) / 100


def holdout_figures(rates: dict[str, dict[str, float]]) -> dict[str, str]:
    values: dict[str, str] = {}
    for signal, got in rates.items():
        values[f"{signal}-holdout-miss"] = f"{got['miss']:.0f}%"
        values[f"{signal}-labels"] = f"{int(got['labels']):,}"
    return values


def main(cfg: Settings | None = None) -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    cfg = cfg or settings
    with connect(cfg) as conn:
        # `fetch_all` is only here to fail early and clearly if the dump is empty.
        if not fetch_all(conn, "SELECT 1 FROM inducks_entry LIMIT 1"):
            log.error("no entries in the dump")
            return
        rates = miss_rates(conn)
    RECORD.write_text(
        json.dumps(
            {
                "signals": rates,
                "held_out": HELD_OUT,
                "seed": SEED,
                "date": datetime.now(tz=UTC).date().isoformat(),
            },
            indent=2,
            sort_keys=True,
        )
        + "\n"
    )
    written, missing = figures.fill(holdout_figures(rates))
    log.info("holdout figures written: %s", ", ".join(written) or "none")
    if missing:
        log.info("computed but not used by the README: %s", ", ".join(missing))
    log.info("figures still unsourced in the README: %d", len(figures.audit()))


if __name__ == "__main__":
    main()
