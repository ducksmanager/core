"""What tools looking at the page tell the engine before the first question."""

import numpy as np
import pytest
from test_engine import make_index

from quackinator.config import settings
from quackinator.engine import evidence
from quackinator.engine.evidence import KumikoPage
from quackinator.engine.session import Engine, Session


@pytest.fixture
def engine() -> Engine:
    return Engine.from_index(make_index())


def story_prob(session: Session, code: str) -> float:
    return float(session.story_probabilities()[session.engine.index.story_number(code)])


def test_panel_rows_clusters_panel_tops_like_dumili():
    panels = [[0, 0, 10, 10], [12, 3, 10, 10], [0, 50, 10, 10], [0, 120, 10, 10]]
    assert evidence.panel_rows(panels, tolerance=5) == 3
    assert evidence.panel_rows([], tolerance=5) == 0


def test_a_near_duplicate_scan_identifies_the_story_on_its_own(engine):
    """The point of an upload: a clear match needs no question at all."""
    session = Session(engine=engine)
    lift, unknown = evidence.image_lifts(engine.index, [("S3", 1.0)], settings)
    session.lift_stories(lift)

    assert unknown == []
    assert session.confidence >= settings.confidence_threshold
    assert session.guesses(1)[0].storycode == "S3"
    assert session.next_question() is None


def test_a_match_below_the_gate_moves_nothing(engine):
    session = Session(engine=engine)
    lift, _ = evidence.image_lifts(engine.index, [("S3", settings.image_min_score)], settings)
    session.lift_stories(lift)
    np.testing.assert_allclose(session.w, engine.prior)


def test_two_scans_of_one_story_count_once(engine):
    """Same drawing twice is not twice the evidence."""
    once, _ = evidence.image_lifts(engine.index, [("S3", 0.95)], settings)
    twice, _ = evidence.image_lifts(engine.index, [("S3", 0.95), ("S3", 0.93)], settings)
    np.testing.assert_allclose(once, twice)


def test_an_image_match_outside_the_index_is_reported(engine):
    lift, unknown = evidence.image_lifts(engine.index, [("gone", 0.99)], settings)
    assert unknown == ["gone"]
    assert (lift == 1).all()


def test_a_rejected_image_match_lets_the_questions_resume(engine):
    """A confidently wrong scan costs the reader one rejection."""
    session = Session(engine=engine)
    lift, _ = evidence.image_lifts(engine.index, [("S3", 1.0)], settings)
    session.lift_stories(lift)
    session.eliminate("S3")
    assert session.next_question() is not None


def test_ocr_lifts_the_story_whose_title_it_read(engine):
    # A word of its own is worth log(64) here, against log(150k) in the real
    # catalogue, so full strength is scaled to match.
    cfg = settings.model_copy(update={"ocr_full_match_idf": float(np.log(64))})
    session = Session(engine=engine)

    lift, words = evidence.ocr_lifts(engine.index, [("OWN5 the", 0.9)], cfg)
    session.lift_stories(lift)

    assert words == ["own5"]
    assert session.guesses(1)[0].storycode == "S5"


def test_ocr_folds_case_and_diacritics(engine):
    _, words = evidence.ocr_lifts(engine.index, [("Ówn5", 0.9)], settings)
    assert words == ["own5"]


def test_a_word_shared_by_many_titles_lifts_less_than_a_word_of_its_own(engine):
    own, _ = evidence.ocr_lifts(engine.index, [("own5", 0.9)], settings)
    shared, _ = evidence.ocr_lifts(engine.index, [("shared1", 0.9)], settings)
    assert own[engine.index.story_number("S5")] > shared[engine.index.story_number("S5")]


def test_low_confidence_ocr_is_ignored(engine):
    lift, words = evidence.ocr_lifts(engine.index, [("own5", 0.5)], settings)
    assert words == []
    assert (lift == 1).all()


def test_ocr_is_unavailable_on_an_index_without_titles():
    index = make_index()
    index.title = None
    assert evidence.ocr_lifts(index, [("own5", 0.9)], settings) is None


def test_kumiko_rows_are_the_median_page():
    pages = [KumikoPage(rows=1, panels=1), KumikoPage(4, 9), KumikoPage(4, 8), None]
    facts = evidence.kumiko_facts(pages, whole_story=False, cfg=settings)
    assert [(f.key, f.value, f.noise) for f in facts] == [("rows", 4, settings.kumiko_rows_noise)]


def test_one_page_alone_is_trusted_less():
    facts = evidence.kumiko_facts([KumikoPage(3, 7)], whole_story=False, cfg=settings)
    assert facts[0].noise == settings.kumiko_single_page_rows_noise


def test_panels_are_totalled_only_over_a_whole_segmented_story():
    pages = [KumikoPage(3, 7), KumikoPage(4, 9)]
    facts = evidence.kumiko_facts(pages, whole_story=True, cfg=settings)
    assert ("panels", 16) in [(f.key, f.value) for f in facts]

    gappy = evidence.kumiko_facts([*pages, None], whole_story=True, cfg=settings)
    assert "panels" not in [f.key for f in gappy]

    partial = evidence.kumiko_facts(pages, whole_story=False, cfg=settings)
    assert "panels" not in [f.key for f in partial]


def test_a_noisier_source_moves_the_belief_less(engine):
    """Kumiko counting rows is wrong more often than a reader counting them."""
    reader, kumiko = Session(engine=engine), Session(engine=engine)
    assert reader.apply_fact("rows", 2) is True
    assert kumiko.apply_fact("rows", 2, noise=0.6) is True
    assert kumiko.story_entropy_bits > reader.story_entropy_bits
    assert kumiko.questions_asked == 0


def test_the_seed_reports_what_evidence_landed(engine):
    from quackinator.api.app import (
        ImageMatchIn,
        KumikoIn,
        KumikoPageIn,
        OcrTextIn,
        SeedIn,
        _apply_seed,
    )

    session = Session(engine=engine)
    report = _apply_seed(
        session,
        SeedIn(
            image_matches=[
                ImageMatchIn(storycode="S3", score=0.97),
                ImageMatchIn(storycode="gone", score=0.97),
            ],
            ocr=[OcrTextIn(text="own3", confidence=0.9)],
            kumiko=KumikoIn(pages=[KumikoPageIn(rows=3, panels=7)]),
        ),
    )

    assert report.image_applied == 1
    assert report.image_unknown == ["gone"]
    assert report.ocr_words == ["own3"]
    assert report.kumiko_applied == ["rows"]
    assert session.guesses(1)[0].storycode == "S3"
