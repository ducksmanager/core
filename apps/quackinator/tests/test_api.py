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
