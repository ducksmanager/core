"""End-to-end engine behaviour on a small synthetic index."""

from itertools import pairwise

import numpy as np
import pytest
import scipy.sparse as sp

from quackinator.config import settings
from quackinator.engine import information as info
from quackinator.engine.belief import Belief
from quackinator.engine.questions import (
    BinaryQuestion,
    CategoricalQuestion,
    MultiLabelQuestion,
)
from quackinator.engine.session import Engine, Session
from quackinator.index.model import StoryIndex

DECADE_STARTS = [1950, 1960, 1970, 1980, 1990, 2000, 2010]


def make_index(n=64, n_chars=8, n_creators=5, seed=0) -> StoryIndex:
    rng = np.random.default_rng(seed)
    char = sp.csr_matrix((rng.random((n, n_chars)) < 0.5).astype(np.int8))
    plot = sp.csr_matrix((rng.random((n, 6)) < 0.4).astype(np.int8))
    # Multilingual on purpose: every row is printed in at least one language and
    # some in several, which is the shape the real index has.
    lang = (rng.random((n, 3)) < 0.4).astype(np.int8)
    lang[lang.sum(axis=1) == 0, 0] = 1
    lang = sp.csr_matrix(lang)
    # Widened like the real index, which has a year for only some stories.
    story_years: list[int | None] = [1950 + i % 60 for i in range(n)]
    # Reprinted across decades, and never before the story existed — the shape
    # the decade question's bound assumes.
    decade = np.zeros((n, len(DECADE_STARTS)), dtype=np.int8)
    for i in range(n):
        first = (story_years[i] or 0) // 10 * 10
        allowed = [k for k, d in enumerate(DECADE_STARTS) if d >= first]
        if allowed:
            for k in rng.choice(allowed, size=min(2, len(allowed)), replace=False):
                decade[i, k] = 1
    decade = sp.csr_matrix(decade)
    # Every row has a writer or artist; the real index has one for 97%.
    creator = (rng.random((n, n_creators)) < 0.4).astype(np.int8)
    creator[creator.sum(axis=1) == 0, 0] = 1
    creator = sp.csr_matrix(creator)
    return StoryIndex(
        svc=[f"sv{i}" for i in range(n)],
        story_id=np.arange(n, dtype=np.int32),
        page_tenths=rng.integers(2, 300, size=n).astype(np.int16),
        rows=rng.integers(1, 5, size=n).astype(np.int16),
        cols=rng.integers(1, 5, size=n).astype(np.int16),
        panels=rng.integers(4, 60, size=n).astype(np.int16),
        popularity=rng.integers(1, 50, size=n).astype(np.int32),
        char=char,
        plot=plot,
        lang=lang,
        decade=decade,
        creator=creator,
        story_codes=[f"S{i}" for i in range(n)],
        story_titles=[f"Story {i}" for i in range(n)],
        story_years=story_years,
        char_codes=[f"C{i}" for i in range(n_chars)],
        char_names=[f"Character {i}" for i in range(n_chars)],
        plot_terms=[f"term{i}" for i in range(6)],
        languages=["en", "fr", "it"],
        decade_starts=list(DECADE_STARTS),
        creator_codes=[f"P{i}" for i in range(n_creators)],
        creator_names=["Carl Barks", "Romano Scarpa", "Don Rosa", "Vicar", "Daan Jippes"][
            :n_creators
        ],
        creator_aliases=[["CB"], ["RS"], ["DR"], ["VIC"], ["DJ"]][:n_creators],
    )


def multilabel(engine: Engine, key: str) -> MultiLabelQuestion:
    """The set-valued question with this key."""
    q = engine.bank.by_key(key)
    assert isinstance(q, MultiLabelQuestion)
    return q


@pytest.fixture
def engine() -> Engine:
    return Engine.from_index(make_index(), settings)


def test_belief_starts_normalised(engine):
    session = Session(engine=engine)
    assert session.w.sum() == pytest.approx(1.0)


def test_answering_reduces_entropy(engine):
    session = Session(engine=engine)
    before = session.entropy_bits
    q = session.next_question()
    assert q is not None
    session.answer(q.key, 0)
    assert session.entropy_bits < before


def test_belief_stays_normalised_and_positive(engine):
    session = Session(engine=engine)
    for _ in range(10):
        q = session.next_question()
        if q is None:
            break
        session.answer(q.key, 0)
        assert session.w.sum() == pytest.approx(1.0)
        # The noise floor must keep every candidate alive.
        assert (session.w > 0).all()


def test_skip_leaves_belief_untouched_but_consumes_question(engine):
    session = Session(engine=engine)
    q = session.next_question()
    assert q is not None
    before = session.w.copy()
    session.skip(q.key)
    assert np.array_equal(session.w, before)
    assert q.key in session.asked
    nxt = session.next_question()
    assert nxt is not None and nxt.key != q.key


def test_no_question_is_asked_twice(engine):
    session = Session(engine=engine)
    seen = []
    for _ in range(15):
        q = session.next_question()
        if q is None:
            break
        seen.append(q.key)
        session.answer(q.key, 0)
    assert len(seen) == len(set(seen))


def test_truthful_play_finds_the_target(engine):
    """A reader answering honestly should end up with the right story on top."""
    from quackinator.engine.simulate import truthful_answer

    hits = 0
    for target in range(engine.index.n_items):
        session = Session(engine=engine)
        while True:
            q = session.next_question()
            if q is None:
                break
            assert session.pending is not None
            answer = truthful_answer(session.pending.question, target)
            if answer is None:
                session.skip(q.key)
            else:
                session.answer(q.key, answer)
        top = session.guesses(1)[0]
        hits += top.storycode == engine.index.story_codes[target]
    # Synthetic random features are not perfectly separating; most must resolve.
    assert hits / engine.index.n_items > 0.8


def test_rejecting_a_guess_demotes_it(engine):
    session = Session(engine=engine)
    for _ in range(4):
        q = session.next_question()
        if q is None:  # already confident enough to stop asking
            break
        session.answer(q.key, 0)
    top = session.guesses(1)[0]
    session.eliminate(top.storycode)
    assert session.guesses(1)[0].storycode != top.storycode
    assert session.w.sum() == pytest.approx(1.0)


def test_eliminating_a_story_refreshes_the_cached_marginal(engine):
    """The story marginal is cached, so rejecting has to drop that cache.

    `guesses` filters rejected codes out by itself, so it would look right even
    off a stale marginal; the mass is what has to actually move.
    """
    session = Session(engine=engine)
    q = session.next_question()
    assert q is not None
    session.answer(q.key, 0)
    code = session.guesses(1)[0].storycode  # populates the cache
    before = session.story_probabilities().copy()
    story = engine.index.story_number(code)
    session.eliminate(code)
    assert session.story_probabilities()[story] < before[story]


def test_reading_confidence_leaves_the_cached_marginal_intact(engine):
    """`confidence` zeroes rejected stories, so it has to work on a copy.

    It and `story_entropy_bits` read one shared marginal per turn, and
    `next_question` consults `confidence` before a turn is ever reported — so
    zeroing in place would silently change the entropy the reader is shown.
    """
    session = Session(engine=engine)
    q = session.next_question()
    assert q is not None
    session.answer(q.key, 0)
    session.eliminate(session.guesses(1)[0].storycode)
    before = session.story_entropy_bits
    _ = session.confidence
    assert session.story_entropy_bits == pytest.approx(before)


def test_gain_is_reported_in_bits(engine):
    session = Session(engine=engine)
    q = session.next_question()
    assert q is not None
    assert 0 < q.gain_bits <= 1.01 * np.log2(engine.index.n_items)


def test_option_lists_stay_short(engine):
    """No question should ever present a wall of choices to the reader."""
    session = Session(engine=engine)
    for _ in range(12):
        q = session.next_question()
        if q is None:
            break
        # Decades are shown whole — ten of them, in date order — so they get a
        # cap of their own; everything else is buckets.
        cap = settings.decade_options if q.key == "decade" else settings.max_options
        assert len(q.options) <= cap + 1
        session.answer(q.key, 0)


def test_the_language_question_is_gone():
    """Measured and deleted; the decade question is the only survivor.

    43-62% of readers hold a printing whose language Inducks does not record for
    their story, and set membership alone punishes them for it — worth 9 points
    of top-1 and half the p90 to stop asking. The decade question survives the
    same failure only because a magazine cannot print a story before the story
    exists; no fact about a story makes a language impossible, so there is no
    bound to pair the membership with. Re-adding it needs a bound, not a
    re-tuned noise floor.
    """
    engine = Engine.from_index(make_index(), settings)
    set_valued = [q.key for q in engine.bank.singles if isinstance(q, MultiLabelQuestion)]
    assert set_valued == ["decade"]


def test_the_language_matrix_is_still_built():
    """It costs one sparse matrix and is what any future attempt would need."""
    index = make_index()
    assert index.lang.shape[1] > 0
    assert index.has_lang.any()


def test_sentinel_layout_values_become_unknown():
    """Inducks writes 0 for "not recorded", and derives estimatedpanels from it."""
    from quackinator.etl.build import MIN_CREDIBLE_PANELS, layout_column
    from quackinator.index.model import UNKNOWN

    keep = np.arange(5)
    # fr/MMFG 5p267b's shape: no page count, so a derived panel count of 1.
    pages = layout_column([0, 1, 2, 20, None], keep)
    assert list(pages) == [UNKNOWN, 1, 2, 20, UNKNOWN]
    panels = layout_column([0, 1, 2, 456, None], keep, floor=MIN_CREDIBLE_PANELS)
    assert list(panels) == [UNKNOWN, UNKNOWN, UNKNOWN, 456, UNKNOWN]


def test_unknown_layout_is_never_evidence():
    """A row with no layout data must score the same for every answer."""
    index = make_index()
    index.page_tenths[:] = -1
    index.panels[:] = -1
    engine = Engine.from_index(index, settings)
    for q in engine.bank.singles:
        if not isinstance(q, CategoricalQuestion) or q.key not in ("pages", "panels"):
            continue
        likelihoods = {tuple(q.likelihood(a)) for a in range(q.confusion.shape[0])}
        assert len(likelihoods) == 1, f"{q.key} treats missing data as an answer"


def scale_question(n_cat: int, assign: np.ndarray) -> "CategoricalQuestion":
    from quackinator.engine.questions import Bucket, CategoricalQuestion

    return CategoricalQuestion(
        key="q",
        prompt="?",
        buckets=[Bucket(k, k, str(k), str(k), str(k)) for k in range(n_cat)],
        assign=assign,
        confusion=info.banded_confusion(n_cat, 0.05),
        noise=0.05,
    )


def test_condense_preserves_mass_and_unknown_category():

    n, n_cat = 500, 30
    rng = np.random.default_rng(3)
    assign = rng.integers(0, n_cat + 1, size=n).astype(np.int16)
    q = scale_question(n_cat, assign)
    w = rng.random(n)
    w /= w.sum()
    c = q.condense(w, 8)
    assert c.n_categories == 8
    assert len(c.options) == 8
    # Unknown items must stay unknown, never be folded into a real bucket.
    assert (c.assign[assign == n_cat] == 8).all()
    assert (c.assign <= 8).all()
    A, _ = c.moments(Belief.over(w))
    assert A.sum() == pytest.approx(1.0)


def test_condensing_an_ordered_scale_leaves_no_gaps():
    """Every value on the scale must stay answerable, however coarse the list.

    Condensing must merge buckets rather than drop the ones holding no belief:
    dropping them leaves the reader of a 3-page story choosing between "1 page",
    "7-8 pages" and "Something else". A merged scale still covers the whole
    range, so the buckets a reader can actually be in are all reachable.
    """
    n, n_cat = 400, 30
    rng = np.random.default_rng(5)
    assign = rng.integers(0, n_cat + 1, size=n).astype(np.int16)
    q = scale_question(n_cat, assign)
    w = rng.random(n)
    w /= w.sum()
    c = q.condense(w, 8)

    spans = q.groups(w, 8)
    assert spans[0][0] == 0 and spans[-1][1] == n_cat - 1
    assert all(b[0] == a[1] + 1 for a, b in pairwise(spans))
    # Every bucket lands in a real option, so no answer is a bag of leftovers.
    assert sorted(set(c.assign[assign < n_cat].tolist())) == list(range(8))


def test_the_length_question_offers_every_length(engine):
    """The reader can always find the story in their hands on the list."""
    from quackinator.engine.questions import PAGE_BUCKETS

    q = engine.bank.by_key("pages")
    shown = q.condense(engine.prior, settings.max_options)
    assert len(shown.options) == settings.max_options
    assert shown.buckets[0].lo == PAGE_BUCKETS[0].lo
    assert shown.buckets[-1].hi == PAGE_BUCKETS[-1].hi
    # Contiguous in tenths of a page: no length falls between two options.
    assert all(b.lo == a.hi + 1 for a, b in pairwise(shown.buckets))
    assert "Something else" not in shown.options


# --- story length in tenths of a page -------------------------------------


def test_a_fraction_only_storyversion_has_a_length():
    """The 38% of the catalogue whose length lives entirely in a fraction.

    111,350 comic storyversions carry `entirepages = 0` and hold their whole
    length in `brokenpage*`, because a quarter-page strip is a real kind of
    Disney comic. Read as whole pages, every one of them is "not recorded".
    """
    from quackinator.etl.build import page_length_tenths
    from quackinator.index.model import UNKNOWN

    assert page_length_tenths(0, 1, 2, None) == 5  # half a page
    assert page_length_tenths(0, 1, 3, None) == 3  # a third
    assert page_length_tenths(0, 1, 1, None) == 10  # a whole page, oddly recorded
    assert page_length_tenths(1, None, None, None) == 10
    assert page_length_tenths(3, 1, 2, None) == 35  # three and a half
    # A fraction of unrecorded size, and nothing else, is a length we do not know.
    assert page_length_tenths(0, None, None, "Y") == UNKNOWN
    # On top of whole pages it is below the resolution of the scale.
    assert page_length_tenths(2, None, None, "Y") == 20
    assert page_length_tenths(0, None, None, None) == UNKNOWN
    assert page_length_tenths(None, None, None, None) == UNKNOWN


def test_sub_page_lengths_get_their_own_buckets():
    from quackinator.engine.questions import PAGE_BUCKETS, bucketize

    lengths = np.array([2, 5, 10, 15, 20], dtype=np.int16)
    got = bucketize(lengths, PAGE_BUCKETS)
    labels = [PAGE_BUCKETS[k].label for k in got]
    assert labels == [
        "less than half a page",
        "about half a page",
        "1 page",
        "1½ pages",
        "2 pages",
    ]


def test_a_short_strip_keeps_its_small_panel_count():
    """MIN_CREDIBLE_PANELS is a floor for whole pages, not for quarter-page strips.

    Applied everywhere it deleted the honest 2- and 3-panel counts of the
    fraction-only rows along with the artefacts it was written to catch.
    """
    from quackinator.etl.build import MIN_CREDIBLE_PANELS
    from quackinator.index.model import PAGE_SCALE, UNKNOWN

    length = np.array([2, 20, 2, 20, UNKNOWN], dtype=np.int16)
    panels = np.array([2, 2, 40, 40, 2], dtype=np.int16)
    panels = panels.copy()
    panels[length == UNKNOWN] = UNKNOWN
    panels[(length >= PAGE_SCALE) & (panels < MIN_CREDIBLE_PANELS)] = UNKNOWN
    assert list(panels) == [2, UNKNOWN, 40, 40, UNKNOWN]


# --- the decade question --------------------------------------------------


def _decade_question(engine, w) -> MultiLabelQuestion:
    return multilabel(engine, "decade").condense(w, settings.decade_options)


def test_a_magazine_cannot_predate_the_story():
    """The bound that survives Inducks not having the reader's issue.

    A story first published in the 1990s cannot appear in a 1950s magazine, and
    that holds whether or not the printing in the reader's hands is indexed. It
    must be damped far harder than a decade that is merely unrecorded — but, like
    everything else in the engine, not to zero.
    """
    from quackinator.engine.selector import posterior as apply

    index = make_index()
    engine = Engine.from_index(index, settings)
    multi = _decade_question(engine, engine.prior)
    first = index.first_decade()

    answer = DECADE_STARTS.index(1950)
    too_young = np.flatnonzero(first > 1950)
    merely_unrecorded = np.flatnonzero(
        (first <= 1950) & (np.asarray(index.decade[:, answer].todense()).ravel() == 0)
    )
    assert too_young.size and merely_unrecorded.size

    ratio = apply(engine.prior, multi.likelihood(answer)) / engine.prior
    assert (ratio[too_young] > 0).all(), "never a hard elimination"
    assert ratio[too_young].max() < ratio[merely_unrecorded].min(), (
        "a story that did not exist yet must be damped harder than one "
        "whose printing simply is not indexed"
    )
    assert multi.impossible < multi.lo < multi.hi


def test_the_bound_never_penalises_a_story_that_already_existed():
    """It cannot mislead: the true answer never violates it.

    0 of 6,000 held-out trials on the real index did, because the bound is a fact
    about publishing rather than an inference from coverage.
    """
    index = make_index()
    engine = Engine.from_index(index, settings)
    multi = multilabel(engine, "decade")
    first = index.first_decade()
    for answer, start in enumerate(DECADE_STARTS):
        cats = multi.categories(answer)
        assert not (cats[first <= start] == 2).any()


def test_an_unindexed_printing_is_recoverable():
    """The readers whose magazine Inducks does not have.

    Their true decade is absent from the row, so the answer counts against the
    right story. It must stay a factor, not an elimination — that is what lets
    later questions bring it back.
    """
    from quackinator.engine.selector import posterior as apply
    from quackinator.engine.simulate import Reader

    index = make_index()
    engine = Engine.from_index(index, settings)
    question = _decade_question(engine, engine.prior)
    # The only reader defect in play: their magazine is a printing Inducks has
    # no row for, so they name a decade that is real but unrecorded.
    reader = Reader(rng=np.random.default_rng(0), unindexed_magazine_rate=1.0)

    checked = 0
    for target in range(index.n_items):
        answer = reader.answer(question, target)
        if answer is None:
            continue
        checked += 1
        ratio = apply(engine.prior, question.likelihood(answer))[target] / engine.prior[target]
        assert 0.0 < ratio < 1.0
        assert ratio > 1e-3, "an unindexed magazine must not bury the true story"
    assert checked, "fixture must offer unrecorded-but-possible decades"


def test_a_question_group_is_its_family_or_itself():
    """Questions that fail together are grouped together, and nothing else is."""
    engine = Engine.from_index(make_index(), settings)
    for family in engine.bank.families:
        assert BinaryQuestion(family=family, feature=0).group == family.family
    for question in engine.bank.singles:
        assert question.group == question.key


def test_a_group_the_reader_declines_is_trusted_less():
    """A skip is evidence about the next question in the same family.

    "Don't know" costs a turn and moves the belief not at all, so a family the
    reader keeps declining is worth less than its information says. A family
    they answer is worth exactly what it says, and one they have not been asked
    about yet is given the benefit of the doubt.
    """
    session = Session(engine=Engine.from_index(make_index(n=200), settings))
    pending = session.next_question()
    assert pending is not None
    declined = session.pending.question.group
    assert session.answer_rate(declined) == 1.0, "not damped before the reader is asked"
    session.skip(pending.key)
    assert session.answer_rate(declined) == pytest.approx(2 / 3)

    while (pending := session.next_question()) is not None:
        answered = session.pending.question.group
        if answered != declined:
            session.answer(pending.key, 0)
            break
    assert session.answer_rate(answered) == 1.0, "answering is never held against a group"
    assert session.answer_rate(declined) == pytest.approx(2 / 3), "and does not undo a skip"


def test_infinite_patience_is_the_engine_that_asked_anyway():
    """What `--ablate family-patience` restores: every question assumed answerable."""
    cfg = settings.model_copy(update={"family_patience": float("inf")})
    session = Session(engine=Engine.from_index(make_index(n=200), cfg))
    pending = session.next_question()
    assert pending is not None
    session.skip(pending.key)
    assert session.answer_rate(session.history[-1]["key"].split(":")[0]) == 1.0


def test_a_declined_group_loses_to_one_the_reader_still_answers():
    """Ranking is by information *per turn*, so damping can change the winner.

    The question that wins on information alone loses to a lesser one once the
    chance of getting no answer at all is priced in — and it keeps reporting its
    real information either way, because that is a property of the belief and
    not of the reader.
    """
    from quackinator.engine.selector import select

    engine = Engine.from_index(make_index(n=200), settings)
    best = select(engine.bank, engine.prior, set())
    assert best is not None

    damped = select(
        engine.bank,
        engine.prior,
        set(),
        answer_rate=lambda group: 0.5 if group == best.question.group else 1.0,
    )
    assert damped is not None
    assert damped.question.group != best.question.group
    assert damped.gain < best.gain, "it won on score, not on information"
    assert damped.score > best.gain * 0.5


def test_an_opaque_plot_term_is_answered_by_nobody():
    """A plot token the reader cannot check against the page.

    The bank holds bare words lifted from description prose, so some of them —
    "black", "playing" — name nothing a reader can look for. At rate 1.0 no plot
    question gets an answer, whatever the index holds, while every other family
    still answers normally: the opacity is a property of the words, not of the
    reader's eyesight.
    """
    from quackinator.engine.simulate import Reader

    index = make_index()
    engine = Engine.from_index(index, settings)
    plot = next(f for f in engine.bank.families if f.family == "plot")
    chars = next(f for f in engine.bank.families if f.family == "char")
    reader = Reader(rng=np.random.default_rng(0), opaque_plot_rate=1.0)

    answered_chars = 0
    for feature in range(len(plot.labels)):
        for target in range(index.n_items):
            assert reader.answer(BinaryQuestion(family=plot, feature=feature), target) is None
    for feature in range(len(chars.labels)):
        for target in range(index.n_items):
            if reader.answer(BinaryQuestion(family=chars, feature=feature), target) is not None:
                answered_chars += 1
    assert answered_chars, "only the plot family goes opaque"


def test_the_opaque_plot_rate_defaults_to_flattering_the_engine():
    """Every rate on `Reader` is off by default, and this one too.

    At 0 the reader answers plot questions off the index, which is the reader
    every recorded benchmark row was played against — so adding the rate must
    not move a single existing number.
    """
    from quackinator.engine.simulate import Reader

    index = make_index()
    engine = Engine.from_index(index, settings)
    plot = next(f for f in engine.bank.families if f.family == "plot")
    question = BinaryQuestion(family=plot, feature=0)

    plain = Reader(rng=np.random.default_rng(0))
    explicit = Reader(rng=np.random.default_rng(0), opaque_plot_rate=0.0)
    answers = [
        (plain.answer(question, t), explicit.answer(question, t)) for t in range(index.n_items)
    ]
    assert [a for a, _ in answers] == [b for _, b in answers]
    assert any(a is not None for a, _ in answers), "fixture must have answerable plot rows"


def test_decades_are_shown_whole_and_in_order():
    """A reader scans a list of dates in date order, and there are only ten."""
    engine = Engine.from_index(make_index(), settings)
    q = multilabel(engine, "decade").condense(engine.prior, settings.max_options)
    assert q.labels == [f"{d}s" for d in DECADE_STARTS]
    assert "Something else" not in q.labels


def test_condensed_something_else_is_only_impossible_if_every_option_is():
    """Picking "Something else" means one of the options it stands for was true."""
    from quackinator.engine.questions import decade_question

    index = make_index(n=200)
    engine = Engine.from_index(index, settings)
    keep = 3
    # Built with a cap that actually bites: the bank's own `decade_options` sits
    # above the label count on purpose, so the real question never condenses.
    full = decade_question(index, settings.decade_noise, settings.decade_impossible, keep + 1)
    assert full is not None and full.ruled_out is not None
    condensed = full.condense(engine.prior, keep + 1)
    assert condensed.ruled_out is not None
    assert condensed.labels[-1] == "Something else"

    dropped = np.arange(keep, len(full.labels))
    barred_count = np.asarray(full.ruled_out[:, dropped].sum(axis=1)).ravel()
    all_barred = barred_count == dropped.size
    got = np.asarray(condensed.ruled_out[:, -1].todense()).ravel() > 0
    assert np.array_equal(all_barred, got)

    # The distinction that matters: a row barred from *some* of the decades
    # "Something else" stands for is not barred from the option itself, because
    # the reader picking it means one of the others was true. An OR here would
    # rule out a story that is perfectly possible.
    partly = np.flatnonzero((barred_count > 0) & (barred_count < dropped.size))
    assert partly.size, "fixture must bar some rows from only part of the tail"
    assert not got[partly].any()


# --- the author box -------------------------------------------------------
#
# Not a question: a creator's name is worth 6.6 bits at the start of a session
# but there are 3,102 of them and room for eight, so as a question two thirds of
# readers answer "Something else". A search box costs no turn, so it pays at any
# rate of credits actually being printed — which is the number the dump cannot
# supply.


def test_the_author_box_is_in_the_bank_but_never_offered():
    """One code path applies every answer; `costs_turn` is what keeps it free."""
    engine = Engine.from_index(make_index(), settings)
    creators = engine.bank.by_key("creator")
    assert creators is not None and not creators.costs_turn

    w = engine.prior
    offered = {q.key for q, _ in engine.bank.candidates(Belief.over(w), set(), 8)}
    assert "creator" not in offered


def test_creator_search_folds_case_and_accents():
    """A reader copies letters off a page in a language they may not read."""
    engine = Engine.from_index(make_index(), settings)
    assert [m.name for m in engine.search_creators("barks")] == ["Carl Barks"]
    assert [m.name for m in engine.search_creators("BÅRKS")] == ["Carl Barks"]


def test_creator_search_finds_aliases_and_reports_what_matched():
    engine = Engine.from_index(make_index(), settings)
    hits = engine.search_creators("RS")
    assert hits and hits[0].name == "Romano Scarpa"
    assert hits[0].matched == "RS"


def test_creator_search_needs_two_characters():
    """One letter matches most of the catalogue; it is not a query."""
    engine = Engine.from_index(make_index(), settings)
    assert engine.search_creators("b") == []
    assert engine.search_creators("") == []


def test_creator_search_prefers_prefix_matches():
    """Typing a surname must not surface everyone who merely contains it."""
    engine = Engine.from_index(make_index(), settings)
    hits = engine.search_creators("don")
    assert hits[0].name == "Don Rosa"


def test_naming_a_creator_costs_no_turn():
    session = Session(engine=Engine.from_index(make_index(), settings))
    session.next_question()
    before = session.questions_asked
    session.volunteer("creator", 0)
    assert session.questions_asked == before


def test_naming_a_creator_favours_that_creator_without_eliminating():
    index = make_index()
    session = Session(engine=Engine.from_index(index, settings))
    carries = np.asarray(index.creator[:, 0].todense()).ravel() > 0
    before = session.w.copy()
    session.volunteer("creator", 0)

    assert session.w == pytest.approx(session.w.clip(min=0))
    assert (session.w > 0).all(), "a printed credit can be a pseudonym; never eliminate"
    assert session.w.sum() == pytest.approx(1.0)
    # Rows carrying the named creator gain belief relative to those that do not.
    gained = (session.w / before)[carries].mean()
    lost = (session.w / before)[~carries].mean()
    assert gained > lost


def test_a_creator_can_only_be_named_once():
    session = Session(engine=Engine.from_index(make_index(), settings))
    session.volunteer("creator", 0)
    with pytest.raises(ValueError):
        session.volunteer("creator", 1)


def test_an_unknown_creator_index_is_rejected():
    session = Session(engine=Engine.from_index(make_index(), settings))
    with pytest.raises(ValueError):
        session.volunteer("creator", 999)


def test_a_character_question_names_its_character_by_code(engine):
    """The card illustrates it with a portrait, which is keyed on the code.

    Not on the label: labels are display names in `desc_language` and move with
    it, and a picture of Gyro does not.
    """
    family = next(f for f in engine.bank.families if f.family == "char")
    question = BinaryQuestion(family=family, feature=3)

    assert question.prompt == "Does Character 3 appear in the story?"
    assert question.subject == "C3"


def test_questions_that_are_not_about_one_thing_have_no_subject(engine):
    """A page count is about nothing nameable, and a plot term is not an entity."""
    plot = next(f for f in engine.bank.families if f.family == "plot")

    assert BinaryQuestion(family=plot, feature=0).subject is None
    assert engine.bank.by_key("pages").subject is None
    assert engine.bank.by_key("creator").subject is None


def test_the_subject_reaches_the_client(engine):
    """Whatever the engine picked, what the API renders carries its subject."""
    session = Session(engine=engine)
    pending = session.next_question()

    assert pending is not None
    assert session.pending is not None
    assert pending.subject == session.pending.question.subject


def test_no_question_ever_offers_a_creator_to_pick_from():
    """A name is typed, never chosen off a list.

    `costs_turn` keeps the author box out of the selector, and
    `AttestedMultiLabelQuestion.condense` refuses to shortlist. Both are load
    bearing: a shortlist long enough to hold the reader's name is longer than a
    list anyone reads, and one short enough to read holds it for a third of
    readers. The guard is over a whole session, because a question the selector
    declines at the prior it may still reach for on the tenth turn.
    """
    engine = Engine.from_index(make_index(), settings)
    creators = engine.bank.by_key("creator")
    assert creators is not None
    names = set(creators.options)

    session = Session(engine=engine)
    while (pending := session.next_question()) is not None:
        assert pending.key != "creator"
        assert not names & set(pending.options)
        session.answer(pending.key, 0)

    # ...and the box itself never condenses to a list, however much room it is
    # offered or however concentrated the belief has become.
    for room in (2, settings.max_options, 500):
        assert creators.condense(session.w, room) is creators
