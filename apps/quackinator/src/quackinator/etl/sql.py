"""Raw extraction queries.

Deliberately flat: every query hits one table with at most a trivial predicate,
and all joining happens in Python. Server-side joins across
inducks_storyversion x inducks_entry x inducks_appearance are unindexed in the
stock Inducks dump and can take minutes; streaming the tables takes seconds.
"""

# Comic stories only. kind='n' is the normal multi-panel comic; the other kinds
# are illustrations, text stories, covers, games and puzzles.
#
# `entirepages` is only part of the length: 111,350 of these rows have
# entirepages = 0 and carry their whole length in brokenpage*, because the story
# is a half-page or quarter-page strip. `brokenpageunspecified = 'Y'` means "there
# is a fraction but we do not know what it is".
STORYVERSIONS = """
SELECT storyversioncode, storycode, entirepages, rowsperpage, columnsperpage,
       estimatedpanels, keywordsummary,
       brokenpagenumerator, brokenpagedenominator, brokenpageunspecified
FROM inducks_storyversion
WHERE kind = 'n'
"""

# Publication date of each issue, for the decade question.
#
# `oldestdate`, not `filledoldestdate`: the latter fills its gaps with the
# sentinel 9999-12-31 on 12,107 issues, which reaches 15.5% of storyversions and
# turns into a phantom "9990s" decade carrying 45k rows. `oldestdate` has no
# sentinels and is still populated on 99.4% of issues.
ISSUE_DATES = """
SELECT issuecode, oldestdate
FROM inducks_issue
WHERE oldestdate IS NOT NULL AND oldestdate <> ''
"""

# Non-cover entries: one row per physical printing of a story in an issue.
# Drives both the popularity prior and the language of the magazine.
ENTRIES = """
SELECT storyversioncode, languagecode, issuecode
FROM inducks_entry
WHERE is_cover = 0 AND storyversioncode IS NOT NULL AND storyversioncode <> ''
"""

# `appearancecomment` carries the signal `number` does not: `number` only ever
# holds group sizes (BB(12)), which is why it is 97% zeros, but the comment is
# where Inducks records "cameo", "photo", "picture", "statue", "dream". Those
# are appearances a reader turning pages will not register, so they must not be
# scored as a sighting the reader failed to report.
APPEARANCES = """
SELECT storyversioncode, charactercode, appearancecomment
FROM inducks_appearance
WHERE doubt <> 'Y' OR doubt IS NULL
"""

HEROES = """
SELECT storycode, charactercode
FROM inducks_herocharacter
"""

# Who wrote and drew the story. Excluded as a *question* — see questions.py —
# but a printed credit on the first page is the strongest single thing a reader
# can tell us, so it feeds the author search box. `w` and `a` only: plot and ink
# credits are rarely what a page prints, and `r` is a creator merely mentioned
# in the story rather than one who worked on it.
STORY_JOBS = """
SELECT storyversioncode, personcode
FROM inducks_storyjob
WHERE plotwritartink IN ('w', 'a') AND (doubt <> 'Y' OR doubt IS NULL)
"""

PERSONS = """
SELECT personcode, fullname, isfake
FROM inducks_person
"""

# Pseudonyms and alternative spellings, for the search box only: a printed page
# may say "Romano Scarpa" where Inducks holds a different form of the name.
PERSON_ALIASES = """
SELECT personcode, surname, givenname
FROM inducks_personalias
"""

CHARACTERS = """
SELECT charactercode, charactername, official, onetime, heroonly
FROM inducks_character
"""

CHARACTER_NAMES = """
SELECT charactercode, languagecode, charactername, preferred
FROM inducks_charactername
"""

LANGUAGE_NAMES = """
SELECT languagecode, languagename
FROM inducks_languagename
WHERE desclanguagecode = %s
"""

STORIES = """
SELECT storycode, originalstoryversioncode, title, firstpublicationdate
FROM inducks_story
"""

DESCRIPTIONS = """
SELECT storyversioncode, desctext
FROM inducks_storydescription
WHERE languagecode = %s AND desctext IS NOT NULL AND desctext <> ''
"""

# First-page scans, for the picture on a guess. `inducks_entryurl` holds one row
# per (scan, site): a `pagenumber = 1` row is a scan of the first page of a
# printing, which is what a guess shows.
#
# `storycode` is Inducks' own resolution of which story the scanned entry
# prints — populated where it is known and correct, which covers 95% of the
# stories in the index. `public = 'N'` scans exist and must not be linked.
#
# Every site, because a scan sits in exactly one of them (0 files are in two)
# and they are what the mirror is organised by. `inducks_site` says which sites
# are images at all and where each one's tree hangs; see `IMAGE_SITES`.
#
# One story has as many rows as it has scanned printings; the caller keeps one —
# see `pick_thumbnails`, which reads this twice, once to rank the collections and
# once to pick. Ordered so the pick within a collection is the same on every
# rebuild.
STORY_SCANS = """
SELECT storycode, sitecode, url
FROM inducks_entryurl
WHERE public = 'Y' AND pagenumber = 1
  AND storycode IS NOT NULL AND storycode <> ''
ORDER BY url
"""

# Where each site's files hang, so a scan can be addressed by a path relative to
# the root all of them share rather than by a site and a base URL. 57 rows.
#
# `images = 'N'` sites are links to other websites — a Wikipedia article, a
# publisher's shop — and carry no scan of anything.
IMAGE_SITES = """
SELECT sitecode, urlbase
FROM inducks_site
WHERE images = 'Y'
"""
