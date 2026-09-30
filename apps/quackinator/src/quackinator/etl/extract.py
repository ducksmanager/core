"""Streaming extraction from the Inducks MariaDB instance."""

from __future__ import annotations

import logging
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

import pymysql
import pymysql.cursors

from quackinator.config import Settings

log = logging.getLogger(__name__)


@contextmanager
def connect(cfg: Settings) -> Iterator[pymysql.Connection]:
    conn = pymysql.connect(
        host=cfg.db_host,
        port=cfg.db_port,
        user=cfg.db_user,
        password=cfg.db_password,
        database=cfg.db_name,
        charset="utf8mb4",
        # utf8mb3 tables with mixed encodings: never blow up on a bad byte.
        use_unicode=True,
    )
    try:
        yield conn
    finally:
        conn.close()


def stream(
    conn: pymysql.Connection, query: str, params: tuple[Any, ...] | None = None
) -> Iterator[tuple]:
    """Iterate rows without buffering the whole result set in memory.

    SSCursor keeps the result on the server; inducks_entry alone is 2M rows.
    """
    with conn.cursor(pymysql.cursors.SSCursor) as cur:
        cur.execute(query, params)
        while True:
            rows = cur.fetchmany(50_000)
            if not rows:
                break
            yield from rows


def fetch_all(
    conn: pymysql.Connection, query: str, params: tuple[Any, ...] | None = None
) -> list[tuple]:
    with conn.cursor() as cur:
        cur.execute(query, params)
        return list(cur.fetchall())


def to_int(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
