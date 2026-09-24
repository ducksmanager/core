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

    # Link "Does X appear in the story?" to the character's page on inducks.org,
    # for a reader who does not recognise the name. See
    # `api.app.inducks_character_url`.
    inducks_character_link: bool = True

    # Root of the scan mirror, under which every path in the index resolves. The
    # index holds paths only, so the mirror can move or the transformation be
    # retuned without a rebuild. The leading segment is a Cloudinary transformation:
    # crop to the top of the page at twice the rendered 46x62, webp or avif, ~6 KB
    # from originals of 40-250 KB. Empty disables the picture everywhere and rows
    # fall back to their titles, which they must do anyway for the stories nobody
    # has scanned.
    #
    # NOTE (2026-09-02): the mirror fetches uncached paths on first request, and
    # that fetch is failing — 400, `Timed out connecting to server`. Covers are
    # cached and serve; most story first pages are not, and need the upstream back.
    thumbnail_base: str = (
        "https://res.cloudinary.com/dl7hskxab/image/upload"
        "/c_fill,g_north,w_92,h_124,f_auto,q_auto/inducks-covers/"
    )

    # Probability mass reserved for a wrong answer. Non-zero on purpose: the
    # engine must never hard-eliminate a candidate on a single answer.
    noise_floor: float = 0.05

    # P(the layout Inducks records is not the layout in the reader's hands).
    # Inducks does not mint a storyversion per re-layout, so the rate is not in the
    # dump; tuned against `simulate.py --layout-mismatch-rate`, where 0.10 is free
    # against a reader the index describes correctly and worth 6 points of top-1 to
    # one it does not. More flattens the useful part of the band without buying
    # further robustness. Applies to pages/rows/cols.
    layout_mismatch: float = 0.10

    # P("yes") for a character cell the reader cannot check: a cameo, a character
    # present only as a photo or statue, a one-time character indexers need not
    # list, or a cast list Inducks flags with `appisxapp = 'N'`. Neutral because
    # the claim is that these cells are not evidence, not that they lean one way.
    # Moving it off 0.5 asserts a direction; check `mise run sim`.
    char_weak_evidence: float = 0.5

    # Same idea for the decade printed on the cover. Deliberately *not* raised to
    # absorb the issues Inducks is missing: an unindexed magazine leaves no trace,
    # so slack lifts the true story and every rival together. Sweeping it to 0.30
    # buys 17% of that reader's median rank for 11x the information and a worse
    # p90. `decade_impossible` is what actually protects them.
    decade_noise: float = 0.05

    # P(reader's magazine is dated before the story was first published). Not a
    # reader error — they can read a date — but an error in
    # `inducks_story.firstpublicationdate`, which disagrees with the recorded
    # printings on 0.02% of rows.
    decade_impossible: float = 0.002

    # Decades are shown whole rather than condensed: a reader scans dates in date
    # order, and condensing a chronological list keeps the *earliest* labels
    # rather than the likeliest.
    decade_options: int = 16

    # P(the name printed on the page is one Inducks records for that story). The
    # one number here that is not measured: the dump records who made a story,
    # never whether a printing said so, so there is nothing to hold out. High
    # because the failure it models is narrow — a publisher crediting someone
    # Inducks disagrees with, or a pseudonym no alias covers. Treat as an
    # assumption until real sessions can measure it.
    creator_coverage: float = 0.90

    # Longest list of names the search box offers for one query.
    creator_matches: int = 10

    # P(reader rejects the guess | it really is their story). A deliberate
    # rejection is far more reliable than an incidental miscount, so this is
    # much stricter than the noise floor — but still non-zero.
    rejection_likelihood: float = 0.02

    # Ceiling on the prior multiplier a host system's own candidate list may
    # apply. A caller that has already identified the story by other means —
    # Dumili runs reverse image search and OCR over the page before ever opening
    # a session — can name a handful of storycodes it believes in, scored 0..1,
    # and each is lifted by `1 + (seed_boost - 1) * score`.
    #
    # It can afford to be large because of what it is *not*: no candidate is
    # damped, so a list that misses the true story renormalises everyone else by
    # a hair — sixteen stories out of 150k lifted 50x move the rest by about a
    # percent — and the session proceeds as if nothing had been offered. That is
    # the same contract the author box has, and the reason both may use evidence
    # a *question* may not.
    #
    # The risk it does carry is a confident wrong list, which lands the reader on
    # a guess they must reject. `rejection_likelihood` is what recovers that, and
    # the caller is expected to gate its list on its own confidence first.
    #
    # Unmeasured: no simulated reader arrives holding an image-search shortlist.
    # Price it with `mise run sim` before trusting this default.
    seed_boost: float = 50.0

    # How much reprint count favours a story: our proxy for "likely to be in the
    # magazine a reader happens to be holding".
    popularity_prior_weight: float = 0.5

    # Belief mass that question *scoring* may ignore. Ten answers in, most of
    # the catalogue holds a vanishing share of the belief between them, and
    # scoring the bank against those rows is arithmetic that cannot change which
    # question wins. Never applies to the belief itself, which is always updated
    # in full, so a candidate left out of the scoring keeps its mass and can
    # climb back in. Zero scores every candidate every turn.
    # Off: measured at 5% faster when it changes no answer, and faster than
    # that only by changing which question the engine asks.
    selection_drop: float = 0.0

    # How many answers' worth of benefit of the doubt a question family gets
    # before the engine concludes the reader cannot answer it and stops spending
    # turns there. A skip is the reader saying so in as many words, so the
    # evidence is strong and this is low: at 2, one skip damps the family to
    # two-thirds of its information, five skips to two-sevenths.
    #
    # It damps *selection* only. The family stays in the bank, its questions
    # keep their real gain, and one good enough still wins — a reader who could
    # not name the first three plot words is not barred from the fourth.
    family_patience: float = 2.0

    # Engine bounds.
    max_questions: int = 25
    confidence_threshold: float = 0.85

    # Longest list of answers to put in front of a reader. Questions with more
    # categories are condensed: set-valued ones to the currently plausible labels
    # plus "Something else", ordered scales by merging neighbouring buckets, which
    # keeps every value on the scale answerable.
    max_options: int = 8

    # Plot vocabulary bounds (see etl/plot.py). Raising min_df to 400 shrinks the
    # bank to ~330 terms and costs 9 points of top-1; below 20 buys nothing.
    plot_min_df: int = 20
    plot_max_df_ratio: float = 0.25
    plot_vocab_size: int = 10_000

    # A plot term must be attested in real `desc_language` prose, not only in the
    # multilingual `keywordsummary` fallback, or the reader gets asked about a word
    # from a language they may not read: "does the story involve dagobert?".
    # A lift against the corpus mix, so it does not tighten when `desc_language`
    # changes; foreign tokens land under 0.04 and genuine plot words above 0.47.
    plot_min_native_lift: float = 0.2

    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
