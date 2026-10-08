from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="QUACKINATOR_", env_file=".env", extra="ignore")

    db_host: str = "localhost"
    db_port: int = 64999
    db_user: str = "root"
    db_password: str = "changeme"
    db_name: str = "coa"

    index_dir: Path = Path("data/index")
    desc_language: str = "en"

    # Link character questions to the character's page on inducks.org.
    inducks_character_link: bool = True

    # Image CDN prefix for first-page scans; the index stores only the path after it.
    # Empty disables thumbnails.
    thumbnail_base: str = (
        "https://res.cloudinary.com/dl7hskxab/image/upload"
        "/c_fill,g_north,w_92,h_124,f_auto,q_auto/inducks-covers/"
    )

    # Probability that an answer is wrong. Non-zero so one answer never rules out a story.
    noise_floor: float = 0.05

    # Probability that the page/row/column layout Inducks records differs from the reader's copy.
    layout_mismatch: float = 0.10

    # P("yes") for a character the reader may not notice (cameo, photo, unlisted).
    # 0.5 means "no evidence either way".
    char_weak_evidence: float = 0.5

    # Error rate for the decade question.
    decade_noise: float = 0.05

    # Probability that the reader's magazine predates the story's recorded first
    # publication (an Inducks data error).
    decade_impossible: float = 0.002

    # Probability that a creator named on the page is one Inducks credits. Assumed, not measured.
    creator_coverage: float = 0.90

    # Max creator names returned per search.
    creator_matches: int = 10

    # Probability the reader rejects a guess that is actually their story.
    rejection_likelihood: float = 0.02

    # Max prior multiplier for a host's candidate list: each story is lifted by
    # `1 + (seed_boost - 1) * score`, score in 0..1. Assumed, not measured.
    seed_boost: float = 50.0

    # How much reprint count favours a story.
    popularity_prior_weight: float = 0.5

    # How quickly skips de-prioritise a question family (lower = faster). Affects
    # question choice only, not the family's information value.
    family_patience: float = 2.0

    # In-memory sessions: idle timeout and cap (least recently used dropped first).
    session_idle_seconds: int = 2 * 3600
    max_sessions: int = 200

    max_questions: int = 25
    # Probability of the top guess at which the engine stops asking.
    confidence_threshold: float = 0.85

    # Max answer options shown; questions with more are condensed.
    max_options: int = 8

    # Plot vocabulary bounds (see etl/plot.py): min stories per term, max share of
    # stories per term, vocabulary size.
    plot_min_df: int = 20
    plot_max_df_ratio: float = 0.25
    plot_vocab_size: int = 10_000

    # Minimum frequency of a plot term in `desc_language` text relative to the
    # whole corpus, so the reader is not asked about foreign words.
    plot_min_native_lift: float = 0.2

    # Title words in more than this share of stories are not indexed for OCR matching.
    title_max_df_ratio: float = 0.01

    # Evidence from images, OCR and panel detection (see `engine.evidence`). Each
    # multiplies a story's weight by `boost ** strength`, strength in 0..1.
    # Assumed, not measured.
    image_min_score: float = 0.9
    image_boost: float = 1e5
    ocr_min_confidence: float = 0.75
    ocr_boost: float = 100.0
    # Total matched-word IDF that counts as a full-strength OCR match.
    ocr_full_match_idf: float = 16.0
    # Error rates for Kumiko's panel counts. Assumed; measure with
    # packages/api/scripts/measure-kumiko-accuracy.ts.
    kumiko_rows_noise: float = 0.4
    kumiko_single_page_rows_noise: float = 0.6
    kumiko_panels_noise: float = 0.4
    # Panel tops within this many pixels are on the same row.
    kumiko_row_tolerance: int = 5

    # Panel detection and OCR services for uploads. Required at startup.
    kumiko_host: str = ""
    ocr_host: str = ""
    max_upload_bytes: int = 15 * 1024 * 1024

    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
