"""HTTP API for the Vue frontend.

Sessions live in process memory, so this runs as a single replica.
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
from quackinator.engine.questions import Text
from quackinator.engine.session import Engine, Session

log = logging.getLogger(__name__)

ENGINE: Engine | None = None
# Least recently used first, each with when it was last used.
SESSIONS: OrderedDict[str, tuple[float, Session]] = OrderedDict()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global ENGINE
    require_services()
    log.info("loading index from %s", settings.index_dir)
    ENGINE = Engine.load(settings)
    log.info("engine ready: %d storyversions", ENGINE.index.n_items)
    yield
    SESSIONS.clear()


def require_services() -> None:
    """Refuse to serve without the services an upload is analysed with."""
    missing = [
        f"QUACKINATOR_{name.upper()}"
        for name in ("kumiko_host", "ocr_host")
        if not getattr(settings, name)
    ]
    if missing:
        raise RuntimeError(f"not configured: {', '.join(missing)}")


def inducks_character_url(code: str | None) -> str | None:
    """inducks.org page for a character code, so a reader can check who a name refers to."""
    if not code or not settings.inducks_character_link:
        return None
    return f"https://inducks.org/character.php?c={quote(code, safe='')}"


def thumbnail_url(path: str | None) -> str | None:
    """Full URL of a story's first-page scan, or None if it has none or thumbnails are off."""
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


class MessageOut(BaseModel):
    """Text to show, as a client translates it: an English template and what fills it."""

    id: str = Field(description="The English template, with {placeholders}")
    params: dict[str, str] = Field(
        default_factory=dict,
        description="Fills the placeholders. Names and terms from the index, never translated",
    )


def message(text: str) -> MessageOut:
    """Wrap plain text (e.g. a name) as a parameter so clients don't treat it as a template."""
    if isinstance(text, Text):
        return MessageOut(id=text.id, params=text.params)
    return MessageOut(id="{text}", params={"text": text})


class QuestionOut(BaseModel):
    key: str
    prompt: str
    options: list[str]
    prompt_message: MessageOut = Field(description="`prompt`, for a client to translate")
    option_messages: list[MessageOut] = Field(
        description="`options`, in the same order, for a client to translate"
    )
    gain_bits: float = Field(description="Information this question is expected to yield")
    inducks_url: str | None = Field(
        default=None,
        description="inducks.org page of the character the question is about, if any",
    )
    subject: str | None = Field(
        default=None,
        description="Inducks code the question is about; use this, not `key`, to store "
        "answers for replay",
    )


class GuessOut(BaseModel):
    storycode: str
    title: str
    year: int | None
    probability: float
    thumbnail_url: str | None = Field(
        default=None,
        description="First-page scan, or null if there is none",
    )


class FactIn(BaseModel):
    key: str = Field(description="Question to answer: pages, rows, cols, panels or decade")
    value: int = Field(
        description="Raw value (tenths of a page, row count, year), not an option index"
    )


class ReplayIn(BaseModel):
    family: str = Field(description="char or plot")
    code: str = Field(description="Character code or plot term (the question's `subject`)")
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
    """What a host system already knows before the first question."""

    prior: dict[str, float] = Field(
        default_factory=dict,
        description="storycode -> 0..1 confidence; boosts those stories",
    )
    facts: list[FactIn] = Field(
        default_factory=list,
        description="Answers known from the caller's own records",
    )
    exclude: list[str] = Field(
        default_factory=list,
        description="Question keys never to ask",
    )
    answers: list[ReplayIn] = Field(
        default_factory=list,
        description="Answers from an earlier session, to resume it",
    )
    image_matches: list[ImageMatchIn] = Field(
        default_factory=list,
        description="Reverse image search results for the first page",
    )
    ocr: list[OcrTextIn] = Field(
        default_factory=list,
        description="OCR of the first panel, where the title is",
    )
    kumiko: KumikoIn | None = None
    cover: bool = Field(
        default=False,
        description="Identify a cover instead of a story (no layout questions)",
    )


class SeedOut(BaseModel):
    """What was applied from the seed and what was skipped."""

    prior_applied: int
    prior_unknown: list[str] = Field(description="Storycodes this index does not have")
    facts_applied: list[str]
    facts_rejected: list[str] = Field(
        description="Unknown, already answered, or out-of-range value"
    )
    answers_replayed: int
    answers_dropped: list[str] = Field(
        description="`family:code` of answers this index no longer recognises"
    )
    image_applied: int = Field(default=0, description="Stories boosted by image search")
    image_unknown: list[str] = Field(
        default_factory=list, description="Image-search storycodes this index does not have"
    )
    ocr_words: list[str] | None = Field(
        default=None,
        description="Title words the OCR text matched; null if the index has no titles",
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
    confidence_threshold: float = Field(description="Confidence at which the engine stops asking")
    story_entropy_bits: float = Field(
        description="Spread of the belief over stories; not a progress measure"
    )
    questions_asked: int
    done: bool
    cover: bool = Field(description="Identifying a cover instead of a story")
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
    matched: str = Field(description="The name or alias that matched")
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
                prompt_message=message(pending.prompt),
                option_messages=[message(option) for option in pending.options],
                gain_bits=pending.gain_bits,
                # All question subjects are characters.
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
        cover=session.cover,
    )


def _apply_seed(session: Session, seed: SeedIn) -> SeedOut:
    """Apply a seed to a new session. Parts that don't match the index are
    reported and skipped, never raised, so an outdated seed still works."""
    facts_applied, facts_rejected = [], []
    for fact in seed.facts:
        (facts_applied if session.apply_fact(fact.key, fact.value) else facts_rejected).append(
            fact.key
        )
    for key in seed.exclude:
        session.exclude(key)

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
    """Start a game, optionally seeded with what the caller already knows."""
    session_id = uuid.uuid4().hex
    try:
        session = Session(engine=_engine(), cover=seed is not None and seed.cover)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
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
    """Record a creator name the reader saw on the page. Costs no turn."""
    session = _session(session_id)
    try:
        session.volunteer("creator", body.creator)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    return _turn(session_id, session)


class AnalysisOut(BaseModel):
    """Kumiko and OCR over one uploaded page, shaped to go straight into a seed."""

    kumiko: KumikoIn
    ocr: list[OcrTextIn]


def _post(url: str, body: bytes, content_type: str) -> object:
    request = urllib.request.Request(
        url, data=body, method="POST", headers={"Content-Type": content_type}
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def _analyze(image: bytes, language: str | None) -> AnalysisOut:
    try:
        pages = _post(settings.kumiko_host, image, "application/octet-stream")
        panels = pages[0]["panels"] if pages else []  # type: ignore[index]
    except (OSError, ValueError, KeyError, IndexError, TypeError) as exc:
        log.warning("kumiko failed: %s", exc)
        raise HTTPException(502, f"Could not segment the page: {exc}") from exc

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
    if language and panels:
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
            raise HTTPException(502, f"Could not read the title: {exc}") from exc
    return AnalysisOut(kumiko=kumiko, ocr=ocr)


@app.post("/api/analyze", response_model=AnalysisOut)
async def analyze(request: Request, language: str | None = None) -> AnalysisOut:
    """Run Kumiko and OCR on an uploaded first page (raw request body, not stored).

    `language` is the Inducks language code; OCR is skipped without it.
    """
    # Size checked while streaming, so oversized uploads are refused early.
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


@app.get("/api/health")
def health() -> dict:
    engine = _engine()
    return {
        "ok": True,
        "storyversions": engine.index.n_items,
        "stories": engine.index.n_stories,
        "sessions": len(SESSIONS),
        # Changes when a rebuild may invalidate stored answers.
        "index_fingerprint": engine.index.fingerprint,
    }
