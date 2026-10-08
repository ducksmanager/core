"""Figures that only the dump can answer. `mise run dump-facts`.

The *Data traps* section of the README is a list of claims about Inducks columns
— how often `estimatedpanels` is just `pages × rows × cols`, how many issues
carry the `9999-12-31` sentinel, how much of the catalogue is a half-page gag.
Every one of them was true of the dump somebody had in front of them at the
time, and none of them could be checked afterwards.

So each claim is a query here, and the number in the README is whatever the query
returns. A trap that stops being a trap should show up as a figure that has
quietly gone to zero, not as a paragraph nobody can test.

Needs the database up (`mise run etl` needs it too). The index-only figures are
in `quackinator/facts.py`, which does not.
"""

from __future__ import annotations

import logging

import pymysql

from quackinator import figures
from quackinator.config import Settings, settings
from quackinator.etl.extract import connect, fetch_all

log = logging.getLogger(__name__)

# Every figure is `SELECT <part>, <whole>`, so the query itself says what the
# percentage is a percentage *of* — the detail these claims lose first.
QUERIES: dict[str, str] = {
    # `estimatedpanels` is arithmetic, not observation.
    "estimatedpanels-derived": """
        SELECT SUM(estimatedpanels = entirepages * rowsperpage * columnsperpage), COUNT(*)
        FROM inducks_storyversion
        WHERE kind = 'n' AND entirepages > 0 AND rowsperpage > 0 AND columnsperpage > 0
    """,
    # The panels-per-tier default, indistinguishable from a real count of two.
    "defaulted-columns": """
        SELECT SUM(columnsperpage = 2), COUNT(*)
        FROM inducks_storyversion WHERE kind = 'n'
    """,
    # The catalogue that whole-page lengths recorded as "length not known".
    "sub-page-rows": """
        SELECT SUM(entirepages = 0), COUNT(*)
        FROM inducks_storyversion WHERE kind = 'n'
    """,
    # Cast-list cells a reader turning pages will not report.
    "cameo-rows": """
        SELECT SUM(appearancecomment LIKE '%%cameo%%'), COUNT(*)
        FROM inducks_appearance
    """,
    # The date sentinel that becomes a phantom decade.
    "sentinel-dates": """
        SELECT SUM(filledoldestdate = '9999-12-31'), COUNT(*) FROM inducks_issue
    """,
    # Titles taken off a contents page rather than the story.
    "contents-page-titles": """
        SELECT SUM(reallytitle = 'N'), COUNT(*)
        FROM inducks_entry WHERE title <> '' AND is_cover = 0
    """,
    # Issues Inducks itself flags as incompletely indexed.
    "partly-indexed-issues": """
        SELECT SUM(fullyindexed = 'N'), COUNT(*) FROM inducks_issue
    """,
    # A "which world is this?" question that was measured and rejected.
    "universes": "SELECT COUNT(*), COUNT(*) FROM inducks_universe",
    "characters": "SELECT COUNT(*), COUNT(*) FROM inducks_character",
    # Cast lists Inducks itself flags as possibly incomplete.
    "unreliable-cast-lists": """
        SELECT SUM(appisxapp = 'N'), COUNT(*)
        FROM inducks_storyversion WHERE kind = 'n'
    """,
    # `number` on an appearance is a group size, not a count: mostly zero.
    "appearance-number-zero": """
        SELECT SUM(number = 0 OR number IS NULL), COUNT(*) FROM inducks_appearance
    """,
    # A story code printed on the page, which the reader could copy verbatim.
    "printed-codes": """
        SELECT SUM(printedcode <> ''), COUNT(*) FROM inducks_entry WHERE is_cover = 0
    """,
    # The magazine fast path's key space.
    "issue-keys": """
        SELECT COUNT(DISTINCT CONCAT(publicationcode, '/', issuenumber)), COUNT(*)
        FROM inducks_issue
    """,
    # Sparse layout flags, none of them worth a question.
    "sideways-entries": "SELECT SUM(sideways = 'Y'), COUNT(*) FROM inducks_entry",
    "mirrored-entries": "SELECT SUM(mirrored = 'Y'), COUNT(*) FROM inducks_entry",
    "missingpanels-entries": "SELECT SUM(missingpanels = 'Y'), COUNT(*) FROM inducks_entry",
}

# Figures the README states as a count, not a share of the table queried.
AS_COUNT = {
    "cameo-rows",
    "sentinel-dates",
    "sub-page-rows",
    "universes",
    "characters",
    "issue-keys",
    "sideways-entries",
    "mirrored-entries",
    "missingpanels-entries",
}
# ...and the ones it states both ways.
ALSO_SHARE = {"sub-page-rows", "partly-indexed-issues"}


def dump_figures(conn: pymysql.Connection) -> dict[str, str]:
    out: dict[str, str] = {}
    for name, query in QUERIES.items():
        try:
            part, whole = fetch_all(conn, query)[0]
        except pymysql.Error as err:
            # A column that has moved is a finding, not a crash: the claim it
            # backs is the one to go and look at.
            log.warning("%-24s cannot be measured: %s", name, err.args[-1])
            continue
        part, whole = int(part or 0), int(whole or 0)
        log.info("%-24s %12s of %12s", name, f"{part:,}", f"{whole:,}")
        if name in AS_COUNT:
            out[name] = f"{part:,}"
        if name not in AS_COUNT or name in ALSO_SHARE:
            key = f"{name}-share" if name in ALSO_SHARE else name
            out[key] = f"{100 * part / whole:.1f}%" if whole else "—"
        out[f"{name}-total"] = f"{whole:,}"
    return out


def main(cfg: Settings | None = None) -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    cfg = cfg or settings
    with connect(cfg) as conn:
        values = dump_figures(conn)
    written, missing = figures.fill(values)
    log.info("dump figures written: %s", ", ".join(written) or "none")
    if missing:
        log.info("computed but not used by the README: %s", ", ".join(missing))
    log.info("figures still unsourced in the README: %d", len(figures.audit()))


if __name__ == "__main__":
    main()
