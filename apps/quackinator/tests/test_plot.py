"""Plot vocabulary construction.

The bank is what the reader is literally asked about, so a bad token is not a
small accuracy tax — it is a question nobody can answer.
"""

from quackinator.etl import plot as plotlib


def docs(*texts: str) -> list[set[str]]:
    return [plotlib.tokenize(t) for t in texts]


def test_tokenize_drops_short_tokens_and_stopwords():
    assert plotlib.tokenize("Donald and the Golden Helmet") == {"golden", "helmet"}
    # Accented letters are part of a word, not a boundary.
    assert "fantôme" in plotlib.tokenize("le fantôme noir")


def corpora(n_native: int, n_fallback: int):
    """Native prose and multilingual fallback sharing one genuine plot word."""
    native = docs(*["treasure island adventure"] * n_native)
    fallback = docs(*["dagobert schatz treasure"] * n_fallback)
    return native, fallback


def build(native, fallback, **kwargs):
    return plotlib.build_vocabulary(
        native + fallback,
        n_docs=len(native) + len(fallback),
        min_df=5,
        max_df_ratio=1.0,
        size=100,
        **kwargs,
    )


def test_a_token_only_the_multilingual_fallback_attests_is_dropped():
    """The reported bug: "Does the story involve dagobert?" asked of a French reader.

    Inducks' `keywordsummary` is a multilingual concatenation, so foreign words
    and foreign character names reach the bank on volume alone. `dagobert` occurs
    in 2 English descriptions against 2,232 keyword summaries; a real plot word
    is attested in both.
    """
    native, fallback = corpora(140, 60)  # the real corpus is native-majority
    vocab = build(native, fallback, native_docs=native, min_native_lift=0.2)

    assert "dagobert" not in vocab
    assert "schatz" not in vocab
    assert "treasure" in vocab, "a word attested in both must survive"
    assert "island" in vocab, "a word only the native corpus attests must survive"


def test_without_the_filter_the_foreign_token_survives():
    """Guards the filter itself: the corpus must otherwise admit `dagobert`."""
    native, fallback = corpora(140, 60)
    assert "dagobert" in build(native, fallback)


def test_the_cut_does_not_tighten_when_the_native_corpus_is_small():
    """A lift, not a raw share.

    Switching `desc_language` to one Inducks describes less thoroughly shrinks
    the native corpus. Under a raw share that silently prunes real plot words —
    "treasure" is attested in both corpora either way, and must survive both.
    """
    for n_native, n_fallback in ((140, 60), (30, 300), (10, 500)):
        native, fallback = corpora(n_native, n_fallback)
        vocab = build(native, fallback, native_docs=native, min_native_lift=0.2)
        assert "treasure" in vocab, f"lost at {n_native}/{n_fallback}"
        assert "dagobert" not in vocab, f"admitted at {n_native}/{n_fallback}"


def test_frequency_band_excludes_the_useless_extremes():
    corpus = docs(*(["common word here"] * 90 + ["rarity"] * 2 + ["middling"] * 30))
    vocab = plotlib.build_vocabulary(
        corpus, n_docs=len(corpus), min_df=5, max_df_ratio=0.5, size=100
    )
    assert "rarity" not in vocab, "too rare to ever be worth asking"
    assert "common" not in vocab, "in most stories, so it carries almost no information"
    assert "middling" in vocab


def test_vocabulary_is_ranked_towards_a_balanced_split():
    corpus = docs(*(["balanced"] * 50 + ["balanced skewed"] * 0 + ["skewed"] * 8))
    vocab = plotlib.build_vocabulary(corpus, n_docs=100, min_df=5, max_df_ratio=0.9, size=2)
    assert vocab[0] == "balanced"
