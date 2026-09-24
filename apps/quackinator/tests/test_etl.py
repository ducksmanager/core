"""Index assembly, with no MariaDB in sight.

Everything here runs against a hand-built `Raw` — which is the whole point of
`extract` and `assemble` being separate functions: the cleaning rules are where
the ETL's real decisions live, so they have to be reachable from a test.
"""

import gzip
import json
from collections.abc import Callable

import numpy as np
import pytest

from quackinator.config import settings
from quackinator.etl.build import (
    DEFAULTED_COLUMNS_PER_PAGE,
    MIN_CREDIBLE_PANELS,
    Raw,
    assemble,
    page_length_tenths,
    pick_thumbnails,
    scan_country,
    set_matrix,
    site_prefixes,
)
from quackinator.index.model import META_FILE, PAGE_SCALE, UNKNOWN, StoryIndex


def make_raw(n=6) -> Raw:
    """Six storyversions of three stories, the last one never printed."""
    # Annotated because Inducks leaves any layout column unrecorded, and `list`
    # is invariant: a `list[int]` is not a `list[int | None]` a caller may write
    # a None into.
    sv_rows: list[int | None] = [3, 1, 4, 4, 4, 3]
    sv_cols: list[int | None] = [3, 2, 2, 4, 3, 3]
    sv_panels: list[int | None] = [9, 2, 16, 16, 48, 9]
    return Raw(
        sv_codes=[f"sv{i}" for i in range(n)],
        sv_story=["A", "A", "B", "B", "C", "C"][:n],
        sv_length=[10, 5, 120, 120, 300, 10][:n],
        sv_rows=sv_rows[:n],
        sv_cols=sv_cols[:n],
        sv_panels=sv_panels[:n],
        popularity=np.array([5, 1, 12, 3, 7, 0][:n], dtype=np.int32),
        languages_of={0: {"en"}, 1: {"en", "fr"}, 2: {"it"}, 3: {"fr"}, 4: {"en"}},
        decades_of={0: {1950, 1990}, 1: {1950}, 2: {1970}, 3: {1970, 1980}, 4: {2000}},
        creators_of={0: {"barks"}, 1: {"barks"}, 2: {"scarpa"}, 3: {"scarpa", "barks"}},
        char_pos={"DD": 0, "MM": 1},
        app_rows=[0, 1, 2, 3, 4],
        app_cols=[0, 0, 1, 1, 0],
        story_title={"A": "Story A", "B": "Story B", "C": ""},
        story_year={"A": 1950, "B": 1972, "C": None},
        person_name={"barks": "Carl Barks", "scarpa": "Romano Scarpa"},
        char_names_raw={"DD": "Donald Duck", "MM": "Mickey Mouse"},
    )


# --- set_matrix ----------------------------------------------------------


def test_a_row_belongs_to_every_code_it_carries():
    """Not the most frequent one: that is the bug the helper exists to prevent."""
    matrix, codes = set_matrix({0: {"en", "fr"}, 1: {"fr"}}, [0, 1])
    assert matrix.shape == (2, 2)
    # fr is on both rows, en on one, so prevalence order puts fr first.
    assert codes == ["fr", "en"]
    assert matrix.toarray().tolist() == [[1, 1], [1, 0]]


def test_prevalence_order_counts_rows_not_printings():
    matrix, codes = set_matrix({0: {"a"}, 1: {"a"}, 2: {"b"}}, [0, 1, 2])
    assert codes == ["a", "b"]
    assert list(np.asarray(matrix.sum(axis=0)).ravel()) == [2, 1]


def test_natural_order_is_chronological_not_popular():
    """Decades are scanned in date order, however rare a decade is."""
    _, codes = set_matrix({0: {2000}, 1: {2000}, 2: {1950}}, [0, 1, 2], order="natural")
    assert codes == [1950, 2000]


def test_only_kept_rows_shape_the_columns():
    """A code carried solely by a dropped row must not become an option."""
    matrix, codes = set_matrix({0: {"kept"}, 1: {"dropped"}}, [0])
    assert codes == ["kept"]
    assert matrix.shape == (1, 1)


def test_an_empty_family_still_yields_a_matrix():
    matrix, codes = set_matrix({}, [0, 1])
    assert codes == []
    assert matrix.shape == (2, 1)
    assert matrix.nnz == 0


# --- page lengths --------------------------------------------------------


@pytest.mark.parametrize(
    ("entire", "num", "den", "unspecified", "expected"),
    [
        (1, None, None, None, PAGE_SCALE),
        # The 38% of the catalogue that is a fraction of a page and nothing else.
        # A quarter page is 2.5 tenths; `round` breaks the tie to even, and both
        # 2 and 3 land in the "less than half a page" bucket either way.
        (0, 1, 4, None, 2),
        (0, 1, 2, None, 5),
        (2, 1, 2, None, 25),
        # A fraction of unrecorded size, and nothing else: genuinely unknown.
        (0, None, None, "Y", UNKNOWN),
        # The same fraction on top of whole pages is below the scale's resolution.
        (3, None, None, "Y", 30),
        (0, None, None, None, UNKNOWN),
    ],
)
def test_page_length_reads_whole_pages_and_fractions_together(
    entire, num, den, unspecified, expected
):
    assert page_length_tenths(entire, num, den, unspecified) == expected


# --- assemble ------------------------------------------------------------


def test_unprinted_storyversions_are_dropped():
    """An unprinted storyversion cannot be the thing in the reader's hands."""
    index = assemble(make_raw(), settings)
    assert index.svc == ["sv0", "sv1", "sv2", "sv3", "sv4"]
    assert index.n_stories == 3


def test_story_ids_index_the_story_catalog():
    index = assemble(make_raw(), settings)
    assert index.story_codes == ["A", "B", "C"]
    assert index.story_id.tolist() == [0, 0, 1, 1, 2]
    assert index.story_number("B") == 1
    assert index.story_number("nope") is None


def test_a_defaulted_panels_per_tier_is_not_a_measurement():
    """Inducks writes its documented default of 2 where nobody counted."""
    index = assemble(make_raw(), settings)
    assert DEFAULTED_COLUMNS_PER_PAGE == 2
    # sv1 and sv2 recorded 2 columns, indistinguishable from the default.
    assert index.cols.tolist() == [3, UNKNOWN, UNKNOWN, 4, 3]
    # Tier counts need no such treatment; they are written whenever layout is.
    assert index.rows.tolist() == [3, 1, 4, 4, 4]


def test_a_panel_count_without_a_length_is_not_a_panel_count():
    raw = make_raw()
    raw.sv_length[2] = UNKNOWN
    index = assemble(raw, settings)
    assert index.panels[2] == UNKNOWN


def test_a_short_strip_keeps_its_honest_small_panel_count():
    """The credible-panels floor is for whole pages, not quarter-page strips."""
    raw = make_raw()
    raw.sv_length[1] = 5  # half a page
    raw.sv_panels[1] = 2
    raw.sv_length[3] = 2 * PAGE_SCALE
    raw.sv_panels[3] = 2
    index = assemble(raw, settings)
    assert MIN_CREDIBLE_PANELS == 3
    assert index.panels[1] == 2, "a half-page strip really is two panels"
    assert index.panels[3] == UNKNOWN, "a two-page story with two panels is not credible"


def test_heroes_fold_into_the_character_matrix():
    """Hero is recorded per story; for the reader it is the same observation."""
    raw = make_raw()
    raw.hero_by_story = {"C": {"GG"}}
    index = assemble(raw, settings)
    assert "GG" in index.char_codes
    column = index.char_codes.index("GG")
    # Story C's printed storyversion is row 4.
    assert index.char[4, column] == 1
    assert index.char.data.max() == 1, "a duplicate fold must not double a cell"


def test_characters_absent_from_every_kept_row_are_dropped():
    raw = make_raw()
    raw.char_pos["XX"] = 2
    raw.app_rows.append(5)  # the unprinted row
    raw.app_cols.append(2)
    index = assemble(raw, settings)
    assert "XX" not in index.char_codes


def test_a_onetime_character_is_marked_weak_evidence():
    """A cast list may omit one, so a "no" from the reader is not a contradiction."""
    raw = make_raw()
    raw.onetime_chars = {"MM"}
    index = assemble(raw, settings)
    assert index.char_weak is not None
    column = index.char_codes.index("MM")
    carried = np.flatnonzero(np.asarray(index.char[:, column].todense()).ravel())
    weak = np.flatnonzero(np.asarray(index.char_weak[:, column].todense()).ravel())
    assert carried.size and weak.tolist() == carried.tolist()


def test_weak_cells_are_always_a_subset_of_carried_ones():
    """A hero fold is a title logo — the one appearance a reader cannot miss."""
    raw = make_raw()
    raw.hero_by_story = {"A": {"MM"}}
    raw.onetime_chars = {"MM"}
    raw.weak_rows, raw.weak_cols = [4], [1]
    index = assemble(raw, settings)
    assert index.char_weak is not None
    assert (index.char_weak > index.char).nnz == 0


def test_has_data_follows_the_matrices():
    index = assemble(make_raw(), settings)
    assert index.has_char.tolist() == [True, True, True, True, True]
    # Row 4 has no creator recorded; rows 0-3 do.
    assert index.has_creator.tolist() == [True, True, True, True, False]
    assert not index.has_plot.any(), "the fixture has no descriptions"


def test_display_names_fall_back_to_codes():
    raw = make_raw()
    del raw.char_names_raw["MM"]
    index = assemble(raw, settings)
    assert index.char_names[index.char_codes.index("MM")] == "MM"
    assert index.creator_names == ["Carl Barks", "Romano Scarpa"]


# --- first-page scans ----------------------------------------------------


def test_a_story_carries_the_scan_of_its_first_page():
    """Parallel to `story_codes`, which is sorted, not the order they arrived."""
    raw = make_raw()
    raw.story_thumb = {"B": "webusers/2011/01/b_001.jpg", "A": "renamed/us/a_001.jpg"}
    index = assemble(raw, settings)

    assert index.story_codes == ["A", "B", "C"]
    assert index.story_thumbs == ["renamed/us/a_001.jpg", "webusers/2011/01/b_001.jpg", ""]


def test_a_story_nobody_has_scanned_gets_an_empty_path():
    """5% of the catalogue. The list stays parallel rather than going sparse, so
    a reader of it never has to check whether the story has a row."""
    index = assemble(make_raw(), settings)
    assert index.story_thumbs == ["", "", ""]


def test_an_index_built_before_scans_existed_still_loads(tmp_path):
    """An index on disk predates the column, and rebuilding one takes a MariaDB
    and several minutes. A missing list is padded, so it reads as "no story has
    a scan" rather than as an index-length mismatch downstream."""
    assemble(make_raw(), settings).save(tmp_path)
    meta_file = tmp_path / META_FILE
    with gzip.open(meta_file, "rt", encoding="utf-8") as fh:
        meta = json.load(fh)
    del meta["story_thumbs"]
    with gzip.open(meta_file, "wt", encoding="utf-8") as fh:
        json.dump(meta, fh)

    reloaded = StoryIndex.load(tmp_path)

    assert reloaded.story_thumbs == ["", "", ""]


# --- picking which scan of a story to show -------------------------------

# Two sites off one host, shaped the way `inducks_site` shapes them: the upload
# tree sits two levels down and addresses its files from there, the per-country
# ones sit one level down.
SITES = [
    ("webusers", "https://outducks.org/webusers/webusers/"),
    ("us", "https://outducks.org/us/"),
    ("ar", "https://outducks.org/ar/"),
    ("thumbnails2", "https://outducks.org/thumbnails2/"),
]


def scans(*rows: tuple[str, str, str]) -> Callable[[], list[tuple[str, str, str]]]:
    """`pick_thumbnails` reads its rows twice; in the build they come off a cursor."""
    return lambda: list(rows)


def test_a_scan_path_is_relative_to_the_root_the_sites_share():
    """Not to its own site: a mirror copies the tree, and one base has to address
    every path in it."""
    prefixes = site_prefixes(SITES)
    assert prefixes["webusers"] == "webusers/webusers/"
    assert prefixes["us"] == "us/"


def test_the_sites_holding_pre_shrunk_copies_are_skipped():
    """`thumbnails*` are Outducks' own resized derivatives of files that are
    already in the other sites, and the mirror does not carry them."""
    assert "thumbnails2" not in site_prefixes(SITES)


def test_the_best_scanned_collection_wins():
    """Not the first path: alphabetical order hands the shortlist to `ar`, which
    is a handful of mirrored right-to-left reprints."""
    picked = pick_thumbnails(
        site_prefixes(SITES),
        scans(
            ("A", "ar", "dis/ar_dis_214a_001.jpg"),
            ("A", "us", "wdc/0608/us_wdc_608g_001.jpg"),
            ("B", "webusers", "2021/03/us_dd_0249d_001.jpg"),
        ),
    )
    # `us` scanned two pages here and `ar` one, so `us` outranks it for A.
    assert picked == {
        "A": "us/wdc/0608/us_wdc_608g_001.jpg",
        "B": "webusers/webusers/2021/03/us_dd_0249d_001.jpg",
    }


def test_the_only_collection_a_story_is_in_wins_by_default():
    picked = pick_thumbnails(
        site_prefixes(SITES),
        scans(("A", "webusers", "2021/03/us_a_001.jpg"), ("B", "ar", "dis/ar_b_001.jpg")),
    )
    assert picked["B"] == "ar/dis/ar_b_001.jpg"


def test_a_scan_on_a_site_nothing_knows_about_is_dropped():
    """Rather than guessed at: a path with no tree under it resolves to nothing."""
    picked = pick_thumbnails(
        site_prefixes(SITES),
        scans(("A", "thumbnails2", "webusers/2021/03/us_a_001.jpg")),
    )
    assert picked == {}


def test_two_scans_from_one_collection_keep_the_first_row():
    """Which is the first path, since the query is ordered by it. Arbitrary, but
    a shortlist whose pictures reshuffle between rebuilds reads as a bug."""
    picked = pick_thumbnails(
        site_prefixes(SITES),
        scans(
            ("A", "webusers", "2011/01/it_a_001.jpg"),
            ("A", "webusers", "2021/03/it_a2_001.jpg"),
        ),
    )
    assert picked["A"] == "webusers/webusers/2011/01/it_a_001.jpg"


def test_a_path_with_no_readable_country_is_a_last_resort():
    prefixes = site_prefixes(SITES)
    picked = pick_thumbnails(
        prefixes,
        scans(("A", "webusers", "2021/03/x.jpg"), ("A", "ar", "dis/ar_a_001.jpg")),
    )
    assert picked["A"] == "ar/dis/ar_a_001.jpg"

    only = pick_thumbnails(prefixes, scans(("A", "webusers", "2021/03/x.jpg")))
    assert only["A"] == "webusers/webusers/2021/03/x.jpg"


@pytest.mark.parametrize(
    ("url", "country"),
    [
        # The directories above the filename vary by site and are not the
        # country; only the filename carries it.
        ("webusers/webusers/2021/03/br_tp_0137b_001.jpg", "br"),
        ("renamed/us/wdc/0608/us_wdc_608g_001.jpg", "us"),
        ("nl/dd/1974/51/nl_dd1974_51g_001.jpg", "nl"),
        ("00001.jpg", ""),
        ("webusers/webusers/2021/03/xyz_001.jpg", ""),
    ],
)
def test_the_country_comes_off_the_filename(url, country):
    assert scan_country(url) == country
