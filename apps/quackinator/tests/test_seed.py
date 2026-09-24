"""Seeding a session with what a host system already knows.

Everything here is about a caller that is not the standalone reader: it arrives
holding candidate stories from its own tools, measurements out of its own
database, and the answers this reader gave the last time they sat down. The
three invariants those need are that a miss costs nothing, that a measurement
costs no turn, and that a stored answer replays into the same belief.
"""

import numpy as np
import pytest

from quackinator.engine.session import Engine, Session
from test_engine import make_index


@pytest.fixture
def engine() -> Engine:
    return Engine.from_index(make_index())


def test_a_boost_lifts_the_stories_it_names(engine):
    session = Session(engine=engine)
    before = session.story_probabilities().copy()

    assert session.boost({"S3": 1.0}) == []

    after = session.story_probabilities()
    story = engine.index.story_number("S3")
    assert after[story] > before[story]


def test_a_boost_that_misses_is_very_nearly_a_no_op(engine):
    """The contract that lets a seed be taken seriously at all.

    A list that does not contain the reader's story damps nobody — it only
    renormalises — so the belief it leaves behind is the one the session would
    have started from anyway.
    """
    seeded, bare = Session(engine=engine), Session(engine=engine)

    assert seeded.boost({"nosuchstory": 1.0}) == ["nosuchstory"]

    np.testing.assert_allclose(seeded.w, bare.w)


def test_a_boost_never_zeroes_a_candidate(engine):
    session = Session(engine=engine)
    session.boost({"S3": 1.0, "S7": 0.9})
    assert (session.w > 0).all()


def test_a_boost_is_bounded_by_its_score(engine):
    """0 is no lift at all, so a caller with no confidence spends nothing."""
    nudged, bare = Session(engine=engine), Session(engine=engine)
    nudged.boost({"S3": 0.0})
    np.testing.assert_allclose(nudged.w, bare.w)


def test_an_out_of_range_score_is_clamped_not_trusted(engine):
    """The caller's arithmetic is the caller's; it must not reach the belief."""
    wild, full = Session(engine=engine), Session(engine=engine)
    wild.boost({"S3": 40.0})
    full.boost({"S3": 1.0})
    np.testing.assert_allclose(wild.w, full.w)


def test_a_fact_answers_a_question_without_spending_a_turn(engine):
    session = Session(engine=engine)

    assert session.apply_fact("pages", 12) is True

    assert session.questions_asked == 0
    assert "pages" in session.asked
    assert session.next_question().key != "pages"


def test_a_fact_moves_the_belief(engine):
    session = Session(engine=engine)
    before = session.w.copy()
    session.apply_fact("pages", 12)
    assert not np.allclose(before, session.w)


def test_a_fact_off_the_scale_is_declined(engine):
    session = Session(engine=engine)
    assert session.apply_fact("rows", -5) is False
    assert "rows" not in session.asked


def test_a_fact_for_a_question_this_bank_lacks_is_declined(engine):
    """A caller assembles a seed without knowing which questions this index has."""
    session = Session(engine=engine)
    assert session.apply_fact("language", 3) is False


def test_a_fact_is_not_applied_twice(engine):
    session = Session(engine=engine)
    assert session.apply_fact("pages", 12) is True
    assert session.apply_fact("pages", 80) is False


def test_the_decade_is_answered_with_a_year(engine):
    """The caller holds the magazine's date, not an index into a list of decades."""
    session = Session(engine=engine)
    assert session.apply_fact("decade", 1974) is True
    assert session.history[-1]["answer"] == "1970s"


def test_a_year_outside_the_indexed_decades_is_declined(engine):
    session = Session(engine=engine)
    assert session.apply_fact("decade", 1830) is False


def test_an_answer_replays_by_code(engine):
    session = Session(engine=engine)
    assert session.replay("char", "C2", 0) is True
    assert session.history[-1]["key"] == "char:Character 2"


def test_replaying_reproduces_the_belief_it_recorded(engine):
    """Resuming is replay, because there is no belief to restore.

    The stored answers have to land the reader back where they left off, or
    reopening a session quietly costs them everything they had told it.

    Only the family questions travel this way, so the singles are retired up
    front on both sides: in the real flow they are not replayed either, they are
    re-derived from the caller's own database every time it opens a session.
    """
    played, resumed = Session(engine=engine), Session(engine=engine)
    for question in engine.bank.singles:
        played.asked.add(question.key)
        resumed.asked.add(question.key)

    trail = []
    for _ in range(6):
        pending = played.next_question()
        assert pending is not None
        family, _, label = pending.key.partition(":")
        # A character is stored by its code; a plot term is its own identity.
        trail.append((family, played.pending.question.subject or label, 0))
        played.answer(pending.key, 0)

    for family, code, option in trail:
        assert resumed.replay(family, code, option) is True

    np.testing.assert_allclose(played.w, resumed.w)
    assert resumed.questions_asked == played.questions_asked


def test_a_replayed_dont_know_still_costs_its_turn(engine):
    """It moved no belief, but it spent a turn and it damped its family.

    A resume that forgot would ask the reader the same unanswerable questions
    over again.
    """
    session = Session(engine=engine)
    assert session.replay("char", "C1", None) is True

    assert session.questions_asked == 1
    assert session.answer_rate("char") < 1.0
    assert np.allclose(session.w, engine.prior)


def test_a_replayed_answer_for_a_vanished_code_is_dropped(engine):
    """A rebuild can recode a character or drop a plot term, and the reader's
    other answers must survive it."""
    session = Session(engine=engine)
    assert session.replay("char", "gone", 0) is False
    assert session.replay("plot", "notaterm", 0) is False
    assert session.replay("nosuchfamily", "C1", 0) is False


def test_a_plot_answer_replays_by_its_term(engine):
    """The plot bank's columns are their own identity — there is no code."""
    session = Session(engine=engine)
    assert session.replay("plot", "term3", 1) is True


def test_the_fingerprint_tracks_what_answers_are_keyed_on(engine):
    """It must move when a code moves, and hold still otherwise."""
    same = Engine.from_index(make_index())
    assert same.index.fingerprint == engine.index.fingerprint

    moved = make_index()
    moved.char_codes = ["X" + c for c in moved.char_codes]
    moved._fingerprint = ""
    assert moved.fingerprint != engine.index.fingerprint


def test_the_fingerprint_ignores_a_rebuild_that_moves_only_a_measurement(engine):
    """A page count changing does not invalidate a stored character answer."""
    relaid = make_index()
    relaid.page_tenths = relaid.page_tenths + 1
    relaid._fingerprint = ""
    assert relaid.fingerprint == engine.index.fingerprint


# -- the report the API hands back --------------------------------------------
#
# A seed is assembled by a caller against an index it does not control, so the
# only way it learns that half of it no longer fits is by being told.


def test_the_seed_report_separates_what_landed_from_what_did_not(engine):
    from quackinator.api.app import FactIn, ReplayIn, SeedIn, _apply_seed

    session = Session(engine=engine)
    report = _apply_seed(
        session,
        SeedIn(
            prior={"S3": 0.9, "nosuchstory": 0.9},
            facts=[FactIn(key="pages", value=12), FactIn(key="language", value=1)],
            answers=[
                ReplayIn(family="char", code="C1", option=0),
                ReplayIn(family="char", code="gone"),
            ],
        ),
    )

    assert report.prior_applied == 1
    assert report.prior_unknown == ["nosuchstory"]
    assert report.facts_applied == ["pages"]
    assert report.facts_rejected == ["language"]
    assert report.answers_replayed == 1
    assert report.answers_dropped == ["char:gone"]
    assert report.index_fingerprint == engine.index.fingerprint


def test_an_entirely_stale_seed_still_yields_a_playable_session(engine):
    """The reason nothing in a seed raises.

    A caller can come back after a rebuild holding answers for characters that
    have been recoded and stories that have been merged away. That reader gets a
    fresh session, not a 400.
    """
    from quackinator.api.app import FactIn, ReplayIn, SeedIn, _apply_seed

    session = Session(engine=engine)
    report = _apply_seed(
        session,
        SeedIn(
            prior={"gone": 1.0},
            facts=[FactIn(key="gone", value=1)],
            answers=[ReplayIn(family="char", code="gone", option=0)],
        ),
    )

    assert report.answers_replayed == 0
    np.testing.assert_allclose(session.w, engine.prior)
    assert session.next_question() is not None


def test_the_seed_order_does_not_change_where_the_session_starts(engine):
    """Every update is a multiplication, so the three parts commute."""
    from quackinator.api.app import FactIn, ReplayIn, SeedIn, _apply_seed

    parts = {
        "prior": {"S3": 0.8},
        "facts": [FactIn(key="pages", value=12)],
        "answers": [ReplayIn(family="char", code="C1", option=0)],
    }
    first, second = Session(engine=engine), Session(engine=engine)
    _apply_seed(first, SeedIn(**parts))

    second.boost(parts["prior"])
    second.replay("char", "C1", 0)
    second.apply_fact("pages", 12)

    np.testing.assert_allclose(first.w, second.w)
