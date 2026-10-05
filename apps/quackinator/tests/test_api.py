"""The HTTP surface's own logic, such as it is."""

from quackinator.api.app import inducks_character_url, thumbnail_url


def test_a_character_question_links_to_the_character():
    assert inducks_character_url("DD") == "https://inducks.org/character.php?c=DD"


def test_a_code_that_is_a_whole_name_is_encoded():
    """`c=` takes the code, and for most characters the code is their name."""
    assert (
        inducks_character_url('"Pitbull" Bullford')
        == "https://inducks.org/character.php?c=%22Pitbull%22%20Bullford"
    )


def test_a_question_about_nothing_nameable_gets_no_link():
    """Takes a `Question.subject` straight through, None included."""
    assert inducks_character_url(None) is None
    assert inducks_character_url("") is None


def test_the_link_can_be_switched_off(monkeypatch):
    from quackinator.api import app

    monkeypatch.setattr(app.settings, "inducks_character_link", False)

    assert inducks_character_url("DD") is None


def test_a_scan_path_hangs_off_the_configured_mirror():
    """The path is relative to the mirror's root, transformations included: the
    whole left-hand side is one setting, so nothing here has to understand it."""
    assert thumbnail_url("webusers/webusers/2021/03/br_tp_0137b_001.jpg") == (
        "https://res.cloudinary.com/dl7hskxab/image/upload"
        "/c_fill,g_north,w_92,h_124,f_auto,q_auto/inducks-covers"
        "/webusers/webusers/2021/03/br_tp_0137b_001.jpg"
    )


def test_a_mirror_written_without_its_slash_still_joins(monkeypatch):
    """Both halves come from configuration — one from `inducks_site`, one from a
    `.env` — so neither can be trusted to agree about the separator."""
    from quackinator.api import app

    monkeypatch.setattr(app.settings, "thumbnail_base", "https://example.test/thumbs")

    assert thumbnail_url("/a/b_001.jpg") == "https://example.test/thumbs/a/b_001.jpg"


def test_a_story_nobody_has_scanned_gets_no_picture():
    """Takes a `Guess.thumbnail_path` straight through, "" included."""
    assert thumbnail_url("") is None
    assert thumbnail_url(None) is None


def test_an_empty_mirror_switches_every_picture_off(monkeypatch):
    """Which is how the frontend is told to stop reserving room for them."""
    from quackinator.api import app

    monkeypatch.setattr(app.settings, "thumbnail_base", "")

    assert thumbnail_url("webusers/2021/03/br_tp_0137b_001.jpg") is None


def _fill_sessions(monkeypatch, **last_used: float):
    from quackinator.api import app

    monkeypatch.setattr(
        app, "SESSIONS", app.OrderedDict((sid, (t, object())) for sid, t in last_used.items())
    )
    return app


def test_an_idle_session_is_dropped(monkeypatch):
    app = _fill_sessions(monkeypatch, old=0.0, recent=7000.0)
    monkeypatch.setattr(app.settings, "session_idle_seconds", 3600)

    app._evict(7200.0, limit=10)

    assert list(app.SESSIONS) == ["recent"]


def test_past_the_cap_the_least_recently_used_session_goes(monkeypatch):
    app = _fill_sessions(monkeypatch, a=0.0, b=1.0, c=2.0)

    app._evict(3.0, limit=2)

    assert list(app.SESSIONS) == ["b", "c"]


def test_using_a_session_keeps_it_alive(monkeypatch):
    app = _fill_sessions(monkeypatch, a=0.0, b=1.0)
    monkeypatch.setattr(app.time, "monotonic", lambda: 2.0)

    app._session("a")
    app._evict(2.0, limit=1)

    assert list(app.SESSIONS) == ["a"]


def _services(monkeypatch, kumiko, ocr=None):
    """Stand in for Kumiko and PaddleOCR, recording what each was sent."""
    from quackinator.api import app

    monkeypatch.setattr(app.settings, "kumiko_host", "http://kumiko")
    monkeypatch.setattr(app.settings, "ocr_host", "http://ocr" if ocr is not None else "")
    sent: dict[str, object] = {}

    def post(url, body, content_type):
        sent[url] = body
        result = kumiko if url == "http://kumiko" else ocr
        if isinstance(result, Exception):
            raise result
        return result

    monkeypatch.setattr(app, "_post", post)
    return app, sent


def test_an_upload_is_segmented_and_its_first_panel_read(monkeypatch):
    import json

    panels = [[10, 20, 300, 200], [320, 22, 300, 200], [10, 240, 600, 200]]
    app, sent = _services(
        monkeypatch,
        kumiko=[{"panels": panels}],
        ocr=[{"text": "Paperino", "confidence": 0.9, "box": [0, 0, 1, 1]}],
    )

    analysis = app._analyze(b"jpeg", "it")

    assert analysis.kumiko.pages[0].rows == 2
    assert analysis.kumiko.pages[0].panels == 3
    assert analysis.kumiko.whole_story is False
    assert [t.text for t in analysis.ocr] == ["Paperino"]
    assert json.loads(sent["http://ocr"])["crop"] == panels[0]
    assert analysis.errors == []


def test_without_a_language_the_title_is_not_read(monkeypatch):
    app, sent = _services(monkeypatch, kumiko=[{"panels": [[0, 0, 5, 5]]}], ocr=[])

    analysis = app._analyze(b"jpeg", None)

    assert analysis.ocr == []
    assert "http://ocr" not in sent


def test_a_page_with_no_panels_is_reported_unsegmented(monkeypatch):
    app, _ = _services(monkeypatch, kumiko=[{"panels": []}], ocr=[])

    analysis = app._analyze(b"jpeg", "it")

    assert analysis.kumiko.pages == [None]


def test_an_unreachable_service_is_reported_not_raised(monkeypatch):
    """The reader can always be asked questions instead."""
    app, _ = _services(
        monkeypatch, kumiko=[{"panels": [[0, 0, 5, 5]]}], ocr=OSError("connection refused")
    )

    analysis = app._analyze(b"jpeg", "it")

    assert analysis.kumiko is not None
    assert analysis.errors == ["ocr: connection refused"]

    app, _ = _services(monkeypatch, kumiko=OSError("down"))
    assert app._analyze(b"jpeg", "it").errors == ["kumiko: down"]


class _Upload:
    """A request body arriving in chunks, counting how many were read."""

    def __init__(self, chunks: list[bytes]):
        self.chunks = chunks
        self.read = 0

    async def stream(self):
        for chunk in self.chunks:
            self.read += 1
            yield chunk


def test_an_oversized_upload_is_refused_before_it_is_all_read(monkeypatch):
    import asyncio

    import pytest
    from fastapi import HTTPException

    from quackinator.api import app

    monkeypatch.setattr(app.settings, "max_upload_bytes", 10)
    upload = _Upload([b"x" * 8, b"x" * 8, b"x" * 8, b"x" * 8])

    with pytest.raises(HTTPException) as refused:
        asyncio.run(app.analyze(upload, "it"))  # type: ignore[arg-type]

    assert refused.value.status_code == 413
    assert upload.read == 2


def test_an_upload_within_the_limit_is_analysed_whole(monkeypatch):
    import asyncio

    from quackinator.api import app

    seen: list[bytes] = []
    monkeypatch.setattr(app.settings, "max_upload_bytes", 100)
    monkeypatch.setattr(app, "_analyze", lambda image, language: seen.append(image) or "analysed")

    assert asyncio.run(app.analyze(_Upload([b"ab", b"cd"]), None)) == "analysed"  # type: ignore[arg-type]
    assert seen == [b"abcd"]
