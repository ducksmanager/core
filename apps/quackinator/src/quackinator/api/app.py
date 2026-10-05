"""HTTP surface for the Vue frontend.

Session state is a 300k-float belief vector held in process memory. That is
fine for one node; put it in Redis (as a compressed sparse top-k) before
running more than one replica.
"""

from __future__ import annotations

import base64
import json
import logging
import time
import urllib.request
import uuid
from collections import OrderedDict
from contextlib import asynccontextmanager
from urllib.parse import quote

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from quackinator.config import settings
from quackinator.engine import evidence
from quackinator.engine.session import Engine, Session

log = logging.getLogger(__name__)

ENGINE: Engine | None = None
# Least recently used first, each with when it was last used.
SESSIONS: OrderedDict[str, tuple[float, Session]] = OrderedDict()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global ENGINE
    log.info("loading index from %s", settings.index_dir)
    ENGINE = Engine.load(settings)
    log.info("engine ready: %d storyversions", ENGINE.index.n_items)
    yield
    SESSIONS.clear()


def inducks_character_url(code: str | None) -> str | None:
    """Where the reader can go to see the character a question names.

    "Does Gyro Gearloose appear in the story?" is a question about a face, and
    the name is the part of it a reader may not have: theirs is a translation
    that renamed him, or they know the inventor with the light bulb and not the
    words. Inducks has the page that settles it, so the card links to it.

    `code` is a question's subject, None for every question not about one
    nameable thing, so a caller can pass it through without asking what kind of
    question it is holding. Codes reach `c=` verbatim once encoded — exact for
    the few hundred official characters (`DD`, `HDL`), best-effort for the
    16,000 coded by their own name.
    """
    if not code or not settings.inducks_character_link:
        return None
    return f"https://inducks.org/character.php?c={quote(code, safe='')}"


def thumbnail_url(path: str | None) -> str | None:
    """Where the scan of a guessed story's first page is served from.

    A picture of the page settles a guess faster than its title does: titles are
    translated, retitled per printing, or missing outright — 35% of the stories
    in the index have no title of their own, and a row for one of those reads
    "Untitled story" — while the drawing is the thing the reader is holding. Inducks records the path of one scan per printing and nothing
    about where it is hosted, so the base is ours to choose; see
    `Settings.thumbnail_base`, which is also how the picture gets switched off.

    Takes a `Guess.thumbnail_path` straight through, "" included, because 5% of
    stories have no scan and the caller should not have to ask which. Paths are
    lowercase ASCII by Inducks' scan-filename rules, so nothing here needs
    escaping the way a character code does.
    """
    if not path or not settings.thumbnail_base:
        return None
    return f"{settings.thumbnail_base.rstrip('/')}/{path.lstrip('/')}"


app = FastAPI(title="quackinator", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionOut(BaseModel):
    key: str
    prompt: str
    options: list[str]
    gain_bits: float = Field(description="Information this question is expected to yield")
    inducks_url: str | None = Field(
        default=None,
        description="Page on inducks.org for the character the question names, to link the "
        "reader to. Null for every question that is not about one character",
    )
    subject: str | None = Field(
        default=None,
        description="Inducks code of the thing the question is about. The stable identity, "
        "where `key` embeds a display name that moves with DESC_LANGUAGE — so this is what "
        "a host storing an answer to replay later must key it on. Null for a question about "
        "nothing nameable, and for the plot family, whose terms are their own identity",
    )


class GuessOut(BaseModel):
    storycode: str
    title: str
    year: int | None
    probability: float
    thumbnail_url: str | None = Field(
        default=None,
        description="Scan of the story's first page, to show beside the title. Null where the "
        "story has no scan (5% of them) or the mirror is switched off, so a row must read "
        "fine without it",
    )


class FactIn(BaseModel):
    key: str = Field(description="Question to answer: pages, rows, cols, panels or decade")
    value: int = Field(
        description="The raw quantity the question counts — tenths of a page, a row "
        "count, a four-digit year. Never an option index: those are re-derived from "
        "the live belief every turn and mean nothing outside the turn they were shown"
    )


class ReplayIn(BaseModel):
    family: str = Field(description="char or plot")
    code: str = Field(
        description="Inducks code of the character, or the plot term itself. The stable "
        "identity, not the question key, which embeds a display name that moves with "
        "DESC_LANGUAGE"
    )
    option: int | None = Field(default=None, description="0 yes, 1 no; null replays a 'don't know'")


class ImageMatchIn(BaseModel):
    storycode: str
    score: float = Field(description="1 - cosine distance, as DM's findSimilarImages reports it")


class OcrTextIn(BaseModel):
    text: str
    confidence: float


class KumikoPageIn(BaseModel):
    rows: int = Field(description="Rows of panels on the page; see `evidence.panel_rows`")
    panels: int


class KumikoIn(BaseModel):
    pages: list[KumikoPageIn | None] = Field(
        description="One per page of the story, in order, null where unsegmented"
    )
    whole_story: bool = Field(
        default=False,
        description="`pages` covers every page of the story, so the panels can be "
        "totalled. False for a single uploaded page",
    )


class SeedIn(BaseModel):
    """What a host system knows before the reader is asked anything.

    Every part is applied to the same belief and the updates are
    multiplications, so the order they arrive in does not change where the
    session starts.
    """

    prior: dict[str, float] = Field(
        default_factory=dict,
        description="storycode -> 0..1 confidence from the caller's own tools. Lifts "
        "those stories and damps nothing, so a list that misses costs nothing",
    )
    facts: list[FactIn] = Field(
        default_factory=list,
        description="Answers the caller can read out of its own records. Cost no turn",
    )
    answers: list[ReplayIn] = Field(
        default_factory=list,
        description="Answers this reader gave in an earlier session, to resume it",
    )
    image_matches: list[ImageMatchIn] = Field(
        default_factory=list,
        description="Reverse image search over the story's first page, unfiltered",
    )
    ocr: list[OcrTextIn] = Field(
        default_factory=list,
        description="OCR of the first panel of the story, where the title is printed",
    )
    kumiko: KumikoIn | None = None


class SeedOut(BaseModel):
    """What the seed actually did. Nothing in a seed is fatal, so a caller that
    wants to know whether its data still fits this index has to be told."""

    prior_applied: int
    prior_unknown: list[str] = Field(description="Storycodes this index does not have")
    facts_applied: list[str]
    facts_rejected: list[str] = Field(
        description="Questions not in this bank, already answered, or handed a value "
        "off their scale"
    )
    answers_replayed: int
    answers_dropped: list[str] = Field(
        description="`family:code` for answers this index can no longer place — a "
        "recoded character, or a plot term a rebuild dropped from the vocabulary"
    )
    image_applied: int = Field(
        default=0, description="Stories image search lifted, past its score gate"
    )
    image_unknown: list[str] = Field(
        default_factory=list, description="Image-search storycodes this index does not have"
    )
    ocr_words: list[str] | None = Field(
        default=None,
        description="Title words the OCR text matched. Null where this index carries "
        "no titles to match against",
    )
    kumiko_applied: list[str] = Field(
        default_factory=list, description="Layout questions Kumiko answered"
    )
    index_fingerprint: str


class TurnOut(BaseModel):
    session_id: str
    question: QuestionOut | None
    guesses: list[GuessOut]
    confidence: float
    confidence_threshold: float = Field(
        description="Confidence at which the engine stops asking; the full mark on a progress bar"
    )
    story_entropy_bits: float = Field(
        description="Over stories. How *spread* the belief is, not how close the engine is: "
        "a single answer can raise it while the leading guess improves, so it must not be "
        "presented as a progress score"
    )
    questions_asked: int
    done: bool
    seed: SeedOut | None = Field(
        default=None, description="Only on the turn that created the session"
    )


class AnswerIn(BaseModel):
    key: str
    option: int | None = Field(
        default=None, description="Index into the question's options; null means 'don't know'"
    )


class RejectIn(BaseModel):
    storycode: str


class CreatorOut(BaseModel):
    creator: int
    name: str
    matched: str = Field(description="The spelling that matched — an alias, where one did")
    stories: int


class CreatorIn(BaseModel):
    creator: int = Field(description="Index from /api/creators")


def _engine() -> Engine:
    if ENGINE is None:
        raise HTTPException(503, "index not loaded")
    return ENGINE


def _evict(now: float, limit: int) -> None:
    while SESSIONS:
        oldest, (last_used, _) = next(iter(SESSIONS.items()))
        if len(SESSIONS) <= limit and now - last_used < settings.session_idle_seconds:
            return
        del SESSIONS[oldest]


def _session(session_id: str) -> Session:
    now = time.monotonic()
    _evict(now, settings.max_sessions)
    entry = SESSIONS.get(session_id)
    if entry is None:
        raise HTTPException(404, "unknown session")
    session = entry[1]
    SESSIONS[session_id] = (now, session)
    SESSIONS.move_to_end(session_id)
    return session


def _turn(session_id: str, session: Session) -> TurnOut:
    pending = session.next_question()
    return TurnOut(
        session_id=session_id,
        question=(
            QuestionOut(
                key=pending.key,
                prompt=pending.prompt,
                options=pending.options,
                gain_bits=pending.gain_bits,
                # Characters are the only subjects the bank has, so a subject
                # is a character. See `Question.subject`.
                inducks_url=inducks_character_url(pending.subject),
                subject=pending.subject,
            )
            if pending
            else None
        ),
        guesses=[
            GuessOut(
                storycode=g.storycode,
                title=g.title,
                year=g.year,
                probability=g.probability,
                thumbnail_url=thumbnail_url(g.thumbnail_path),
            )
            for g in session.guesses(5)
        ],
        confidence=session.confidence,
        confidence_threshold=session.engine.cfg.confidence_threshold,
        story_entropy_bits=session.story_entropy_bits,
        questions_asked=session.questions_asked,
        done=pending is None,
    )


def _apply_seed(session: Session, seed: SeedIn) -> SeedOut:
    """Fold a caller's own knowledge into a fresh session.

    Nothing here can fail the request. A seed is assembled by a host system out
    of its own database against an index it does not control, so every part of
    it is allowed to miss — a storycode this index does not carry, a question it
    does not ask, a character recoded since the answer was stored. A miss is
    reported and skipped, never raised: a reader resuming a session should get
    their session back, not an error about a plot term that fell out of the
    vocabulary on the last rebuild.
    """
    facts_applied, facts_rejected = [], []
    for fact in seed.facts:
        (facts_applied if session.apply_fact(fact.key, fact.value) else facts_rejected).append(
            fact.key
        )

    replayed, dropped = 0, []
    for answer in seed.answers:
        if session.replay(answer.family, answer.code, answer.option):
            replayed += 1
        else:
            dropped.append(f"{answer.family}:{answer.code}")

    unknown = session.boost(seed.prior)

    cfg = session.engine.cfg
    index = session.engine.index
    lift, image_unknown = evidence.image_lifts(
        index, ((m.storycode, m.score) for m in seed.image_matches), cfg
    )
    session.lift_stories(lift)
    image_applied = int((lift > 1).sum())

    ocr_words: list[str] | None = None
    ocr = evidence.ocr_lifts(index, ((t.text, t.confidence) for t in seed.ocr), cfg)
    if ocr is not None:
        lift, ocr_words = ocr
        session.lift_stories(lift)

    kumiko_applied = []
    if seed.kumiko is not None:
        pages = [
            evidence.KumikoPage(rows=p.rows, panels=p.panels) if p is not None else None
            for p in seed.kumiko.pages
        ]
        for fact in evidence.kumiko_facts(pages, seed.kumiko.whole_story, cfg):
            if session.apply_fact(fact.key, fact.value, noise=fact.noise):
                kumiko_applied.append(fact.key)

    return SeedOut(
        prior_applied=len(seed.prior) - len(unknown),
        prior_unknown=unknown,
        facts_applied=facts_applied,
        facts_rejected=facts_rejected,
        answers_replayed=replayed,
        answers_dropped=dropped,
        image_applied=image_applied,
        image_unknown=image_unknown,
        ocr_words=ocr_words,
        kumiko_applied=kumiko_applied,
        index_fingerprint=session.engine.index.fingerprint,
    )


@app.post("/api/sessions", response_model=TurnOut)
def start_session(seed: SeedIn | None = None) -> TurnOut:
    """Start a game, optionally on top of what the caller already knows.

    An unseeded session is the standalone reader, who arrives with nothing. A
    seeded one is a host system — Dumili has already run reverse image search
    and OCR over the page, and holds the story's length and the magazine's year
    in its own database — or the same reader resuming.
    """
    session_id = uuid.uuid4().hex
    session = Session(engine=_engine())
    now = time.monotonic()
    # Room for the one about to be added.
    _evict(now, settings.max_sessions - 1)
    SESSIONS[session_id] = (now, session)
    report = _apply_seed(session, seed) if seed is not None else None
    turn = _turn(session_id, session)
    turn.seed = report
    return turn


@app.post("/api/sessions/{session_id}/answer", response_model=TurnOut)
def answer(session_id: str, body: AnswerIn) -> TurnOut:
    session = _session(session_id)
    try:
        if body.option is None:
            session.skip(body.key)
        else:
            session.answer(body.key, body.option)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    return _turn(session_id, session)


@app.post("/api/sessions/{session_id}/reject", response_model=TurnOut)
def reject(session_id: str, body: RejectIn) -> TurnOut:
    session = _session(session_id)
    session.eliminate(body.storycode)
    return _turn(session_id, session)


@app.get("/api/creators", response_model=list[CreatorOut])
def creators(q: str) -> list[CreatorOut]:
    """Autocomplete for the author box. Session-independent, so cacheable."""
    return [CreatorOut(**m.__dict__) for m in _engine().search_creators(q)]


@app.post("/api/sessions/{session_id}/creator", response_model=TurnOut)
def name_creator(session_id: str, body: CreatorIn) -> TurnOut:
    """The reader read a name off the first page.

    Not an answer to a question — it costs no turn, and a reader whose copy
    prints no credit simply never calls this. See `Session.volunteer`.
    """
    session = _session(session_id)
    try:
        session.volunteer("creator", body.creator)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    return _turn(session_id, session)


class AnalysisOut(BaseModel):
    """Kumiko and OCR over one uploaded page, shaped to go straight into a seed."""

    kumiko: KumikoIn | None
    ocr: list[OcrTextIn]
    errors: list[str] = Field(
        description="Services that were unreachable or not configured. Never fatal: "
        "the reader can always be asked questions instead"
    )


def _post(url: str, body: bytes, content_type: str) -> object:
    request = urllib.request.Request(
        url, data=body, method="POST", headers={"Content-Type": content_type}
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def _analyze(image: bytes, language: str | None) -> AnalysisOut:
    errors: list[str] = []
    if not settings.kumiko_host:
        return AnalysisOut(kumiko=None, ocr=[], errors=["kumiko: not configured"])
    try:
        pages = _post(settings.kumiko_host, image, "application/octet-stream")
        panels = pages[0]["panels"] if pages else []  # type: ignore[index]
    except (OSError, ValueError, KeyError, IndexError, TypeError) as exc:
        log.warning("kumiko failed: %s", exc)
        return AnalysisOut(kumiko=None, ocr=[], errors=[f"kumiko: {exc}"])

    kumiko = KumikoIn(
        pages=[
            KumikoPageIn(
                rows=evidence.panel_rows(panels, settings.kumiko_row_tolerance),
                panels=len(panels),
            )
        ]
        if panels
        else [None],
    )

    # The title is in the first panel, and the rest of the page is speech
    # balloons that would match every title sharing a word with them.
    ocr: list[OcrTextIn] = []
    if not settings.ocr_host:
        errors.append("ocr: not configured")
    elif language and panels:
        payload = {
            "image": base64.b64encode(image).decode("ascii"),
            "language": language,
            "crop": panels[0],
        }
        try:
            matches = _post(settings.ocr_host, json.dumps(payload).encode(), "application/json")
            ocr = [
                OcrTextIn(text=m["text"], confidence=m["confidence"])
                for m in matches  # type: ignore[union-attr]
            ]
        except (OSError, ValueError, KeyError, IndexError, TypeError) as exc:
            log.warning("ocr failed: %s", exc)
            errors.append(f"ocr: {exc}")
    return AnalysisOut(kumiko=kumiko, ocr=ocr, errors=errors)


@app.post("/api/analyze", response_model=AnalysisOut)
async def analyze(request: Request, language: str | None = None) -> AnalysisOut:
    """Run Kumiko and OCR over the first page of the reader's story.

    For the standalone reader, who has a photo rather than a host's database. The
    image is the raw request body, held in memory and never stored. `language`
    is the magazine's Inducks language code; OCR is skipped without one. Image
    search is not here: it is DM's, and the browser calls it directly.
    """
    # Counted as it arrives, so an oversized upload is refused before it is held
    chunks: list[bytes] = []
    size = 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > settings.max_upload_bytes:
            raise HTTPException(413, "image too large")
        chunks.append(chunk)
    if not size:
        raise HTTPException(400, "empty image")
    return await run_in_threadpool(_analyze, b"".join(chunks), language)


@app.delete("/api/sessions/{session_id}")
def end_session(session_id: str) -> dict:
    SESSIONS.pop(session_id, None)
    return {"ok": True}


@app.get("/api/health")
def health() -> dict:
    engine = _engine()
    return {
        "ok": True,
        "storyversions": engine.index.n_items,
        "stories": engine.index.n_stories,
        "sessions": len(SESSIONS),
        # Changes when a rebuild moves something a stored answer is keyed on, so
        # a caller holding answers can tell whether they will still replay. See
        # `StoryIndex.fingerprint`.
        "index_fingerprint": engine.index.fingerprint,
    }
