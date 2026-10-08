"""Raw extraction queries.

Each query reads one table in full; build.py joins them in Python.
"""

# kind 'n' = comic story, 'c' = cover. Length is entirepages + the brokenpage* fraction.
STORYVERSIONS = """
SELECT storyversioncode, storycode, entirepages, rowsperpage, columnsperpage,
       estimatedpanels, keywordsummary,
       brokenpagenumerator, brokenpagedenominator, brokenpageunspecified, kind
FROM inducks_storyversion
WHERE kind IN ('n', 'c')
"""

# `oldestdate`, not `filledoldestdate`, which fills gaps with the sentinel 9999-12-31.
ISSUE_DATES = """
SELECT issuecode, oldestdate
FROM inducks_issue
WHERE oldestdate IS NOT NULL AND oldestdate <> ''
"""

# One row per printing: popularity, language, decade and printed titles.
ENTRIES = """
SELECT storyversioncode, languagecode, issuecode, title, is_cover
FROM inducks_entry
WHERE storyversioncode IS NOT NULL AND storyversioncode <> ''
"""

# `appearancecomment` flags cameos, photos, dreams etc.: see UNSEEN_APPEARANCE.
APPEARANCES = """
SELECT storyversioncode, charactercode, appearancecomment
FROM inducks_appearance
WHERE doubt <> 'Y' OR doubt IS NULL
"""

HEROES = """
SELECT storycode, charactercode
FROM inducks_herocharacter
"""

# Writers ('w') and artists ('a') only, for the creator search box.
STORY_JOBS = """
SELECT storyversioncode, personcode
FROM inducks_storyjob
WHERE plotwritartink IN ('w', 'a') AND (doubt <> 'Y' OR doubt IS NULL)
"""

PERSONS = """
SELECT personcode, fullname, isfake
FROM inducks_person
"""

# Pseudonyms and alternative spellings, for the creator search box.
PERSON_ALIASES = """
SELECT personcode, surname, givenname
FROM inducks_personalias
"""

CHARACTERS = """
SELECT charactercode, charactername, onetime
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

# Public first-page scans, one row per scanned printing; ordered so pick_thumbnails is stable.
STORY_SCANS = """
SELECT storycode, sitecode, url
FROM inducks_entryurl
WHERE public = 'Y' AND pagenumber = 1
  AND storycode IS NOT NULL AND storycode <> ''
ORDER BY url
"""

# Base URL of each site that hosts scans (images = 'N' sites are external links).
IMAGE_SITES = """
SELECT sitecode, urlbase
FROM inducks_site
WHERE images = 'Y'
"""
