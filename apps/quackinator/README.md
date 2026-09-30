# quackinator

Identify the Disney comic story you are holding, by asking as few questions as
possible.

You have a magazine in front of you — possibly in a language you don't read — and
you don't know which story you're looking at. quackinator asks short
multiple-choice questions you answer *by turning the pages*, and narrows the
Inducks catalogue down to a ranked shortlist.

Every answer is checked against the page rather than recalled. That is what lets
the engine ask questions nobody could answer from memory, like an exact page
count, and why it never asks about anything the printed copy doesn't show.

ETL, engine and frontend run against a local Inducks MariaDB dump.

## Getting started

You need a MariaDB with the Inducks (`coa`) dump loaded.

```bash
mise run install       # or: python -m venv .venv && .venv/bin/pip install -e '.[dev]'
cp .env.example .env   # point it at your MariaDB
mise run etl           # build the index into data/index
mise run api           # serve on :8000
```

```bash
mise run ui-install
mise run ui            # http://localhost:5173, proxies /api to :8000
```

`mise run test`, `mise run lint`, `mise run ui-build` (typecheck + build), and
`mise run sim` to benchmark the engine against the built index.

## Code map

| Path | Role |
|---|---|
| [`etl/`](src/quackinator/etl/) | MariaDB → the on-disk index. Joining happens in Python against streamed flat tables; server-side joins on the stock dump take minutes |
| [`index/model.py`](src/quackinator/index/model.py) | The index: dense per-storyversion columns plus sparse boolean feature matrices |
| [`engine/information.py`](src/quackinator/engine/information.py) | Expected information gain, in closed form |
| [`engine/questions.py`](src/quackinator/engine/questions.py) | The question bank: an ordered scale, two set-valued single-selects and one yes/no family, behind one `Question` protocol |
| [`engine/selector.py`](src/quackinator/engine/selector.py) | Picks the next question by gain; applies an answer to the belief |
| [`engine/creators.py`](src/quackinator/engine/creators.py) | Autocomplete over creator names and their alternative spellings |
| [`engine/session.py`](src/quackinator/engine/session.py) | One reader, one magazine |
| [`engine/simulate.py`](src/quackinator/engine/simulate.py) | Benchmark harness |
| [`api/app.py`](src/quackinator/api/app.py) | FastAPI surface |
| [`frontend/src/`](frontend/src/) | Vue 3 + Vite + TypeScript, no UI framework |

Frontend state lives in
[`useGame.ts`](frontend/src/composables/useGame.ts); the backend holds the belief
vector, the browser holds only the session id and what the reader has seen.

## What each question is worth

Every figure here is written by `mise run sim`. The belief is over storyversions
— separate printings of one story, kept apart because their page counts differ —
but the bits below count *stories*, which is what a reader wants. A session
starts at about <!-- fig:session-start-bits -->17 bits<!-- /fig -->.

<!-- sim:questions:begin -->

Written by `mise run sim`. Do not edit by hand.

The honest reader, 2026-09-04, 500 trials, seed 11. Bits are the drop in the effective
number of candidate *stories* — the engine's belief is over storyversions, but
a reader wants the story, so that is what these count.

| Question | Asked per session | Answered | Avg bits | Narrows by | Bits per session | Median turn |
|---|---|---|---|---|---|---|
| Does *X* appear in the story? | 12.5 | 99% | 0.43 | 1.3x | 5.29 | 10 |
| How long is the story? | 1.0 | 98% | 1.72 | 3.3x | 1.69 | 0 |
| Does the story involve *X*? | 6.0 | 85% | 0.32 | 1.2x | 1.62 | 17 |
| What decade was the magazine published in? | 1.0 | 99% | 1.31 | 2.5x | 1.30 | 1 |
| How many rows (tiers) of panels are on a typical page? | 1.0 | 97% | 0.73 | 1.7x | 0.68 | 2 |
| Roughly how many panels does the story have in total? | 0.8 | 95% | 0.77 | 1.7x | 0.60 | 6 |
| How many panels are in a typical row? | 0.1 | 31% | 0.90 | 1.9x | 0.04 | 9 |

<!-- sim:questions:end -->

| Column | Meaning |
|---|---|
| Asked per session | How often the engine chose it. The character and plot families hold thousands of questions each; every other row is a single question, askable once |
| Answered | How often the index holds a value to check the answer against. The gaps are Inducks' rather than the reader's — a person can always count the rows on a page |
| Avg bits | Information gained per answer. One bit halves the field |
| Narrows by | The same figure as a factor, `2**bits` |
| Bits per session | `avg bits` × `asked per session` × `answered` |
| Median turn | Where it comes up. Nothing schedules this: the selector re-scores the whole bank every turn and takes the best |

Read *bits per session*, not *avg bits*: the questions worth the most per answer
are asked once each, while the character family is asked over and over.

Some answers **widen** the field rather than narrowing it — Bayesian updating is
not monotone in spread, which is why the progress bar tracks confidence instead.
And the panels-per-row row is asked rarely and answered in a fraction of those:
that is [the defaulted column](#data-traps-in-inducks) being folded away, working
as intended.

## Design

These are the decisions that look like defects until you know why they're there.

### The unit of identification is the storyversion

A reprint is re-laid-out and sometimes cut, so its page and panel counts differ
from the original — and the page count is exactly what the reader counts. The
engine reasons over storyversions and aggregates back to stories when presenting
guesses. Two limits on that unit, both of which have bitten:

| Limit | Consequence | Handling |
|---|---|---|
| A storyversion is not one layout. Inducks does not mint one per re-layout: `fr/IRS 1` prints `I TL 116-AP` recomposed two Topolino pages to the page, under the original code | A reader counting six tiers where the index says three is not wrong | `LAYOUT_MISMATCH`, a flat component on top of the miscount band. The band alone eliminates that reader outright |
| A storyversion is not one language. `I TL 116-AP` was printed in nine | Recorded as its plurality language, Finnish, a correct answer of "French" penalised it by orders of magnitude | Language is a sparse set per row, not a category |

`inducks_entry` carries only three layout columns — `sideways` (<!-- fig:sideways-entries -->6,414<!-- /fig --> of <!-- fig:sideways-entries-total -->2,015,859<!-- /fig -->
entries), `mirrored` (<!-- fig:mirrored-entries -->15,482<!-- /fig -->), `missingpanels` (<!-- fig:missingpanels-entries -->0<!-- /fig -->) — far too sparse to
reconstruct a per-printing layout from.

### What the engine asks, and what it refuses to

The bank splits on one question: is this a fact about the **story**, or about the
**printing**? Story facts hold for whichever copy the reader is holding. Printing
facts can only be checked against the printings Inducks happens to have — and the
engine's target reader is precisely the one whose printing it does not.

| Signal | Role | Why |
|---|---|---|
| Characters, plot, length, layout | Question | True of whatever copy is in front of the reader |
| Decade on the cover | Question | A printing fact, but the only one carrying an independent bound — see below |
| Writer / artist | Fast path, not a question | Moves the true story into the first page of guesses, and costs no turn — [see the numbers](#the-author-box-is-a-search-box-not-a-question) |
| Magazine title, issue number | Fast path, not a question | <!-- fig:magazine-holdout-miss -->82%<!-- /fig --> of held-out printings are unrecorded. A miss in a fast path costs nothing; as a question it would punish the true story |
| Language | Deleted | <!-- fig:language-holdout-miss -->50%<!-- /fig --> holdout miss and no bound exists to pair with it |
| Country, currency, magazine size, story position | Never built | Country misses <!-- fig:country-holdout-miss -->50%<!-- /fig --> of held-out printings for a tenth of language's labels; the others are thinner still |
| Original publication year, subseries | Excluded | A reader holding a foreign reprint cannot see them |

The **decade question** is the one printing-level question that survives, because
it is two independent pieces of evidence rather than one:

| Component | What it does | Why it is safe |
|---|---|---|
| Decades the storyversion is recorded as printed in | Set membership, same shape as language | A popular story is reprinted for fifty years, so printings cluster in time |
| Decade its story was *first* published | A floor, never a match | A magazine cannot print a story before the story exists |

Each half alone, and the two together, against both readers — the one whose
magazine Inducks has indexed and the one whose magazine it has never seen:

<!-- sim:decade:begin -->

Written by `mise run sim`. Do not edit by hand.

| Reader | top-1 | top-5 | top-20 | p90 | p99 | buried >500 | asked | vs baseline | measured |
|---|---|---|---|---|---|---|---|---|---|
| Honest reader | 55% | 63% | 73% | 208 | 1247 | 3.0% | 22.4 | — | 2026-09-04, 500 trials, seed 11 |
| Unindexed magazine (36% unindexed) | 44% | 51% | 62% | 414 | 3017 | 8.6% | 23.0 | −11.4 pts p<0.001 · rank ×4.21 p<0.001 | 2026-09-04, 500 trials, seed 11 |
| Recorded printings only | 54% | 62% | 72% | 215 | 1247 | 3.0% | 22.5 | −0.8 pts p=0.125 · rank ×1.05 p<0.001 | 2026-09-04, 500 trials, seed 11 |
| Recorded printings only, unindexed (36% unindexed) | 46% | 53% | 62% | 397 | 2721 | 7.8% | 23.1 | +1.8 pts p=0.391 · rank ×0.96 p=0.519 | 2026-09-04, 500 trials, seed 11 |
| First-publication floor only | 45% | 53% | 67% | 428 | 2493 | 8.8% | 23.3 | −10.0 pts p<0.001 · rank ×2.16 p<0.001 | 2026-09-04, 500 trials, seed 11 |
| Floor only, unindexed (36% unindexed) | 46% | 53% | 67% | 397 | 2468 | 8.4% | 23.2 | +2.2 pts p=0.266 · rank ×1.14 p=0.273 | 2026-09-04, 500 trials, seed 11 |

The last column compares each row against the row it argues with (`Honest reader`, `Unindexed magazine`) story by story rather than as two
percentages: every row plays the same targets in the same order, so a difference
shows up in the trials where the two disagree. The first half is first place, the
second is where the true story landed — a rank ratio above 1 is worse. Rank sees
differences that never cross first place, so read it first.

<!-- sim:decade:end -->

Read the rows in pairs. Set membership does the work: on its own it scores what
the shipped question scores. The floor on its own is worse than not asking at
all — compare it against the `No decade question` row in the previous table —
because it costs a turn and a bound alone cannot single a story out.

The floor earns its place on rank, not on first place. It almost never changes
which story leads — four sessions in five hundred — but removing it puts the
true story measurably further down (`rank ×1.05`, p<0.001), and that is the
column to read: a bound cannot single a story out, it can only push the
impossible ones below the reader's. It does not rescue the reader whose magazine
is unindexed, which is what it was added for; against that reader it makes no
difference either way.

Slack is not the alternative either. Raising `DECADE_NOISE` until it absorbs the
same readers costs an order of magnitude more information and makes the unindexed
reader's tail *worse* — an unindexed magazine leaves no trace at all, so a higher
floor lifts the true story and every rival by the same factor. The numbers
behind that sit next to the setting in
[`config.py`](src/quackinator/config.py).

### Why a fast path may use a signal a question may not

A question that misses *penalises* the true story. A fast path that misses is a
no-op: nothing enters the belief and the question bank proceeds as if it had
never been tried.

The holdout figures measure P(answer unrecorded | the reader's printing is
unindexed) — hide a printing, then ask whether another printing of the same story
appears in that same magazine. Magazine title scores worst because most (story,
magazine) pairs are a single printing, not because that share of magazines is
missing.

| Candidate | Labels | Holdout miss | Verdict |
|---|---|---|---|
| Decade of printing | <!-- fig:decade-labels -->10<!-- /fig --> | <!-- fig:decade-holdout-miss -->36%<!-- /fig --> | Question, with the floor |
| Country of publication | <!-- fig:country-labels -->77<!-- /fig --> | <!-- fig:country-holdout-miss -->50%<!-- /fig --> | Dropped |
| Magazine title | <!-- fig:magazine-labels -->6,242<!-- /fig --> | <!-- fig:magazine-holdout-miss -->82%<!-- /fig --> | Fast path |
| Language | <!-- fig:language-labels -->76<!-- /fig --> | <!-- fig:language-holdout-miss -->50%<!-- /fig --> | Deleted |

`mise run holdout` writes that table's figures.

### Nothing is ever hard-filtered

Readers miscount pages and miss background characters. Every answer multiplies
the belief by a likelihood with a non-zero floor (`NOISE_FLOOR`), so a single
wrong answer is recoverable; a hard `WHERE` clause would eliminate the true story
permanently.

The floor wants to stay low. Raising it to absorb an unreliable reader does not
help against one — measured against the lying reader below, a high floor is
*worse* — and it costs about half of top-1 accuracy against an honest reader.

### Questions are chosen by information gain

Almost every question is modelled identically: a partition into K categories plus
a confusion matrix `P(answer | true category)`. Expected information gain then
has a closed form that never materialises a posterior, needing only two moments
per category:

```
A_k = sum of w over candidates in category k
S_k = sum of w*log(w) over candidates in category k
```

Both are matrix products against the sparse feature matrix, so the whole bank is
scored in two sparse matvecs per turn rather than one posterior per question —
which is what makes asking about every character in Inducks tractable. The closed
form is checked against brute force in
[test_information.py](tests/test_information.py).

Set-valued questions are the exception: the reader gives one answer, but a
candidate carries several true labels at once, which a partition cannot express.
Those become one single-select question over a membership matrix whose categories
are per answer, with the answer distribution renormalised across options.

### Every question family is load-bearing

No family is sufficient alone. Characters leave the field wide open but do the
most total work; layout narrows it substantially; plot questions contribute most
at the margin, because the catalogue's long tail is one-page gags, thousands of
which share an identical character set and page count. Dropping the plot family
roughly halves top-1. `mise run sim` before ripping one out.

Plot questions are frequency-filtered tokens from Inducks description text, so
the bank holds bare words ("does the story involve treasure?") rather than
propositions; replacing them means replacing `build_vocabulary` in
[plot.py](src/quackinator/etl/plot.py) and nothing else. The tokens come from
prose descriptions in `desc_language` and from `keywordsummary`, a multilingual
concatenation covering far more stories. Left unfiltered the second floods the
bank with words the reader cannot read — one real session spent five of its
twenty-two questions on Mickey Mouse's name in Norwegian, Serbian, Finnish and
Polish. `PLOT_*` requires a token to be attested in real prose.

This is the clearest case of [the benchmark lying](#benchmarking): scored the
default way the filter *costs* 3 points of top-1, because the simulated reader
answers `topolino` as happily as `treasure`. Scored against a reader who says
"don't know" to words they cannot read, the filter is worth several points.

### A character question links to the character

"Does Gyro Gearloose appear in the story?" is a question about a face, and the
name is the part of it the reader may not have: names come out of the index in
whichever `DESC_LANGUAGE` was built, while the reader is holding a translation
that renamed him. So the card links the question to that character's Inducks
page, in a new tab — losing the session to a lookup would cost the reader every
answer they had given.

Which makes it presentation, not evidence: nothing about the belief update
changes. The one piece in the engine is a `subject` on the `Question` protocol —
the Inducks code of the thing a question is about, `None` for a page count. The
code rather than the name, because the name is whichever language was built and
the link is not.

### A guess shows the first page of the story

Titles are the weakest part of a shortlist. <!-- fig:stories-without-title -->35%<!-- /fig --> of the stories in the index have
no title of their own, and the ones that do are titled in whichever language
`DESC_LANGUAGE` was built. The drawing is the thing the reader is actually
holding, so each row leads with a scan of the story's first page — the title
panel and the establishing shot. `inducks_entryurl` has 790k `pagenumber = 1`
rows across the image sites in `inducks_site`, covering <!-- fig:scan-coverage -->94.8%<!-- /fig --> of the index's
stories.

Inducks records where a scan sits and nothing about who serves it, and
outducks.org answers 404 for every path in the dump (checked 2026-09-02). So the
pictures come off our own Cloudinary mirror, which is also what resizes them: the
transformation in `THUMBNAIL_BASE` crops each page to its top at twice the
rendered size, around 6 KB from originals of 40-250 KB. The mirror fetches on
first request, and as of 2026-09-02 that fetch is failing upstream for uncached
story pages (400, `Timed out connecting to server`), so most rows currently fall
back to the title.

A story has one scan per scanned printing, all photographs of the same drawn
page. The pick goes to the collection that has scanned the most of the
catalogue: taking the first path alphabetically hands most of the shortlist to
`ar` and `au`, and Arabic editions are right-to-left reprints whose pages are
*mirrored*; taking one at random reshuffles every picture on every rebuild.

What goes into the index is the *path*, relative to the root the sites share.
`inducks_entryurl.url` is relative to its own site and the sites overlap, so the
prefixes are read off `inducks_site.urlbase` at build time and folded into the
path — one base then addresses every scan and nothing downstream knows a site
exists. The three `thumbnails*` sites are skipped: pre-shrunk copies of files the
other sites already have.

Emptying `THUMBNAIL_BASE` turns the pictures off everywhere without a rebuild.
Every row has to read without one anyway — <!-- fig:stories-without-scan -->5%<!-- /fig --> of stories have no scan, and any
URL can fail — so rows fall back to the title, and the frame is dropped entirely
when nothing in the shortlist has a picture that loads.

### The author box is a search box, not a question

A creator's name is the most valuable thing a reader can tell the engine. It is a
fact about the *story* rather than about the printing, so unlike every
magazine-level signal there is nothing to hold out, and a reader who can supply
one lands the true story about six times higher in the list and finishes several
questions sooner — the `Reads the author off the page` row in
[the table above](#where-the-engine-stands) against the honest reader.

What kills it as a *question* is the list. The first row below is `MAX_OPTIONS`,
the last is the box that shipped:

<!-- sim:shortlists:begin -->

Written by `mise run sim`. Do not edit by hand.

Computed from the index at the prior on 2026-09-04 — no simulation, except
the rank column, which is the median over 400 seeded prior-sampled readers who
answer truthfully. They start at a median rank in the tens of thousands.

| Names shown | Reader's name is on the list | Bits from a true answer | Median rank after answering |
|---|---|---|---|
| 8 | 32% | 0.5 | 26,945 |
| 25 | 46% | 0.6 | 18,884 |
| 100 | 73% | 0.6 | 10,696 |
| 500 | 95% | 0.5 | 475 |
| a search box | 98% | 0.4 | 369 |

<!-- sim:shortlists:end -->

At eight options two thirds of readers cannot answer at all, and the eight shown
at the start are American newspaper-strip creators — Bob Karp, Al Taliaferro,
Floyd Gottfredson — the material least likely to carry a printed credit. The list
has to reach into the hundreds before it holds most readers' names, and by then
it is not a list anyone reads.

Read the rank column, not the bits. A name barely moves the *spread* of the
belief, because absence is deliberately weak evidence here — which is what
`AttestedMultiLabelQuestion` is for — so the field stays wide however the answer
lands. What it does is *reorder* the field, lifting every candidate that carries
the name over everything that does not, and the order is all the reader sees.

The other half of the argument is the turn. Inducks records who made a story and
never whether a printing said so, so the one number that decides whether a
question earns its turn is not in the dump. A box costs no turn, so it pays at
*any* rate. `CREATOR_COVERAGE` is assumed rather than measured, as `SEED_BOOST` is;
replace it once real sessions can supply one.

### A host system may seed a session

The standalone reader arrives with nothing. A host embedding the engine does
not: [Dumili](https://github.com/bperel/dm) is indexing the very issue in the
reader's hands, so before it asks anything it has already run reverse image
search and OCR over the page, and holds the story's length and the magazine's
year in its own database. `POST /api/sessions` takes all of it in one body.

| Part | What it is | What it costs |
|---|---|---|
| `prior` | `{storycode: 0..1}` from the caller's own tools | No turn. Lifts those stories by up to `SEED_BOOST`; damps nothing |
| `facts` | `{key, value}` — a measurement answering `pages`, `rows`, `cols`, `panels` or `decade` | No turn. An ordinary soft update otherwise |
| `answers` | `{family, code, option}` — what this reader said last time | The turns they cost then |

The three are multiplications against one belief, so the order they arrive in
does not change where the session starts.

**Why a seed may use evidence a question may not** is the [same argument as the
author box](#why-a-fast-path-may-use-a-signal-a-question-may-not), and it is
load-bearing here: `prior` only ever multiplies *up*. A shortlist naming a story
this index does not have leaves the belief bit-identical, and one that names five
real stories but not the reader's costs them at worst <!-- fig:seed-miss-cost -->5.2%<!-- /fig --> of their
mass — the five fattest stories in the catalogue, renormalising everyone else.
A hit is worth far more than that: at the default `SEED_BOOST` it lifts a story
<!-- fig:seed-boost-lift -->50x<!-- /fig --> before a single question is asked. What the mechanism cannot
survive is a *confident wrong* list, which lands the reader on a guess they must
reject — so the caller is expected to gate its own list first, and
`REJECTION_LIKELIHOOD` is what recovers it.

`SEED_BOOST` is the second likelihood in the engine that is assumed rather than
measured, for the same reason `CREATOR_COVERAGE` is: no simulated reader arrives
holding an image-search shortlist. Build one before trusting the default.

**A fact is not a free answer.** It is soft-updated like any other, because a
page count in a host's database describes the printing the host indexed, which
is the same mismatch `LAYOUT_MISMATCH` already carries. What it skips is the
*turn*, because the reader did not spend one. The value is the raw quantity the
scale counts — tenths of a page, a row count, a four-digit year — never an
option index: options are re-condensed against the live belief every turn, so an
index means nothing outside the turn it was shown on.

**Only the family questions can be stored and replayed.** Yes/no is the one
option list in the bank that never condenses, so an option recorded last week
still means what it meant. They are keyed on `Question.subject` — the Inducks
code — rather than on `key`, which embeds a display name in whichever
`DESC_LANGUAGE` the index was built. Everything else is re-derived from the
caller's own data on every resume, which is why there is nothing to migrate when
a rebuild moves a page count. `GET /api/health` reports an `index_fingerprint`
over exactly what replay depends on — the story codes and the family columns —
so a caller can tell a rebuild that invalidates its stored answers from one that
does not.

Nothing in a seed can fail the request. It is assembled against an index the
caller does not control, so every part of it is allowed to miss, and the
response reports what landed rather than refusing what did not. A reader
resuming after a rebuild gets their session back, not an error about a plot term
that fell out of the vocabulary.

### The progress bar tracks confidence, not how far the search has narrowed

It must not be driven by `story_entropy_bits`. That is perplexity — how *spread*
the belief is — and Bayesian updating does not make it monotone: <!-- fig:answers-that-widen -->14%<!-- /fig --> of answers
raise it, and <!-- fig:sessions-that-widen -->80%<!-- /fig --> of <!-- fig:honest-sessions -->500<!-- /fig --> honest sessions contained at least one, with the true
story's rank holding or improving through them. Every backwards step was a false
alarm.

The bar is `confidence / confidence_threshold` instead. That still moves
backwards sometimes, and almost always because the leading story changed — a real
event worth showing. Do not clamp it to a running maximum; that hides the thing
it is there to report. Spread is displayed as a secondary readout, rounded,
because `2**entropy` is an effective count.

### Data traps in Inducks

Columns that read as measurements and are not. Each was found the same way: a
question scoring readers against a number nobody ever recorded.

| Column | The trap | Handling |
|---|---|---|
| `estimatedpanels` | Inducks computes it as `pages × rows × cols` — it reproduces that product exactly on <!-- fig:estimatedpanels-derived -->96.3%<!-- /fig --> of rows — so it inherits whatever is wrong with those three | Kept as a question anyway: the column is arithmetic, but the reader counts panels on the page, which is a fresh observation. Removing it costs 11 points of top-1 |
| `columnsperpage` | `pagel`'s panels-per-tier letter is "not mandatory"; where missing Inducks writes the default **2**, on **<!-- fig:defaulted-columns -->88.0%<!-- /fig -->** of rows, indistinguishable from an indexer who counted two | `DEFAULTED_COLUMNS_PER_PAGE` folds 2 into `UNKNOWN`. Those rows answer "don't know" |
| `rowsperpage` | Also has a documented default (4) | Left alone. The digits are written whenever layout is recorded at all, and the distribution is what real comics look like — 4, then 3, 2, 5, 6, 7 — not a spike |
| `entirepages` alone | <!-- fig:sub-page-rows -->122,448<!-- /fig --> comic storyversions have `entirepages = 0`; their whole length is in `brokenpage*` | Length in tenths of a page. Whole pages recorded every half- and quarter-page gag as "length not known" — <!-- fig:sub-page-rows-share -->35.4%<!-- /fig --> of the catalogue |
| `estimatedpanels` on sub-page rows | A count derived from a length that was never recorded reads as a confident measurement | `MIN_CREDIBLE_PANELS` is a floor for whole-page rows *only*: a quarter-page strip really is two or three panels, and applied everywhere the floor deleted all <!-- fig:sub-page-rows -->122,448<!-- /fig --> of those honest counts |
| `appearancecomment` | `cameo` (<!-- fig:cameo-rows -->15,619<!-- /fig --> rows), plus `photo`, `picture`, `statue`, `portrait`, `painting`, `silhouette`, `logo`, `thought`, `dream`, `flashback`, `head` — genuine appearances a reader turning pages will not report | Those cells go in `index.char_weak` and score in a fourth category at `CHAR_WEAK_EVIDENCE`, neutral by default. <!-- fig:weak-character-cells -->4.3%<!-- /fig --> of the character matrix. Hero folds are never weak |
| `character.onetime` | One-time characters are "not mandatory (not even in the xapp field)", so a cast list omitting one asserts nothing | Same weak mask |
| `character.charactername` | `--` means "no identifiable characters" and its English name is literally "No one", so the engine cheerfully asks "Does No one appear?" | [`PLACEHOLDER_CHARACTERS`](src/quackinator/etl/build.py) |
| `person.isfake` | Placeholders for unidentified creators — `?`, `various`, `unknown / mickey 7` | Filtered, or the search box offers "various" as an author |
| `issue.filledoldestdate` | Fills gaps with `9999-12-31` on <!-- fig:sentinel-dates -->12,107<!-- /fig --> issues, which becomes a phantom "9990s" decade | Use `oldestdate` |
| `entry.reallytitle` | `N` where the title came from a contents page, not the story — <!-- fig:contents-page-titles -->10.8%<!-- /fig --> of titled non-cover entries | Filter the title fast path on `= 'Y'` |
| `issue.fullyindexed` | `N` on <!-- fig:partly-indexed-issues -->47,980<!-- /fig --> issues (<!-- fig:partly-indexed-issues-share -->18.6%<!-- /fig -->): partly indexed or not at all | A magazine fast-path hit is not authoritative; the reader's story may not be among the entries |

### Measured and rejected

Recorded so they are not re-proposed.

| Candidate | Measurement | Verdict |
|---|---|---|
| `storyversion.appisxapp` as a neutral likelihood | Inducks' flag for a cast list that is "possibly incomplete", on <!-- fig:unreliable-cast-lists -->3.7%<!-- /fig --> of comic storyversions. Scored neutral, the tail got an order of magnitude worse and burials doubled | Harmful. Most answers to a character question are "no", and a neutral 0.5 damps an incomplete row *harder* than the 0.95 a confident absence earns. Re-adding needs a likelihood derived from how often an unlisted character really is present |
| Dropping the `panels` question as redundant | `estimatedpanels` is arithmetic on the other three, so it looked like double-counted evidence | Wrong: it confuses the redundant *column* with the reader's *observation*. −11 points of top-1, and the re-laid-out reader got worse |
| `inducks_universe` as a "which world is this?" question | <!-- fig:universes -->170<!-- /fig --> universes over <!-- fig:characters -->14,228<!-- /fig --> characters | Not a partition. A character may belong to several and the popular ones do — Donald is in twelve, because spin-off sagas reuse the main cast. The median storyversion touches twelve or thirteen |
| `inducks_appearance.number` for cameos | <!-- fig:appearance-number-zero -->97%<!-- /fig --> zeros | It only ever holds group sizes like `BB(12)`. The cameo signal is in `appearancecomment` |
| `entry.printedcode` as a question | A real story code the reader could copy without reading a word — but populated on <!-- fig:printed-codes -->5.4%<!-- /fig --> of entries | Fast-path material |
| The language question, re-added with a tuned noise floor | `mise run holdout` puts language at <!-- fig:language-holdout-miss -->50%<!-- /fig --> of held-out printings unrecorded, far above what a tuned floor could survive | No fact about a story makes a language impossible, so there is no bound to pair the membership with — which is the only thing that rescues the decade question. Re-adding needs a bound, not a re-tuned floor. `index.lang` is still built |
| Re-deriving the noise floor from measured completeness | Spreads a wrong answer's probability by how common each label is rather than evenly | Changes nothing end to end, and was consistently worse in the tail across seeds |

## API

| Endpoint | Purpose |
|---|---|
| `POST /api/sessions` | Start a game; returns the first question. An optional seed body carries what a host system already knows — see [below](#a-host-system-may-seed-a-session) |
| `POST /api/sessions/{id}/answer` | `{key, option}`; `option: null` means "don't know" |
| `GET /api/creators?q=` | Autocomplete for the author box; session-independent |
| `POST /api/sessions/{id}/creator` | `{creator}` — a name read off the first page. Costs no turn |
| `POST /api/sessions/{id}/reject` | `{storycode}` — the reader says that guess is wrong |
| `DELETE /api/sessions/{id}` | End a session |
| `GET /api/health` | Index stats, including the fingerprint a stored answer is keyed on |

Each guess carries a `thumbnail_url` for the scan of its first page, `null`
where the story has no scan or the mirror is switched off — so a row must render
without one.

Every turn returns the next `question` (or `null` when done), the top `guesses`,
`confidence`, `confidence_threshold`, `story_entropy_bits` and
`questions_asked`. Drive a progress indicator from
`confidence / confidence_threshold`; see above on why `story_entropy_bits` is the
wrong choice.

Rejecting a guess damps it rather than deleting it, and it keeps informing
question selection: readers do reject the right story when a translated title
looks unfamiliar. Session state is a belief vector in process memory — move it to
Redis, as a compressed sparse top-k, before running more than one replica.

## Configuration

All settings are `QUACKINATOR_`-prefixed and read from `.env`; see
[config.py](src/quackinator/config.py) for defaults and the reasoning behind each.

| Setting | What it controls |
|---|---|
| `DB_*` | MariaDB connection |
| `INDEX_DIR` | Where the built index lives |
| `DESC_LANGUAGE` | Language for descriptions, character names and language names |
| `INDUCKS_CHARACTER_LINK` | Link the character questions to inducks.org |
| `THUMBNAIL_BASE` | Root of the scan mirror, transformation included; empty shows no pictures |
| `CORS_ORIGINS` | Allowed browser origins for the API |
| `NOISE_FLOOR` | Probability mass reserved for a wrong answer |
| `LAYOUT_MISMATCH` | Probability the indexed layout is not the reader's printing |
| `CHAR_WEAK_EVIDENCE` | P("yes") for a character cell the reader cannot check |
| `CREATOR_COVERAGE` | How often a printed credit matches Inducks. Assumed, not measured |
| `CREATOR_MATCHES` | Longest list the author search box offers for one query |
| `DECADE_NOISE` | Same for printing decades — and see above on why it stays low |
| `DECADE_IMPOSSIBLE` | Probability a magazine predates its own story's first publication |
| `DECADE_OPTIONS` | Longest decade list; above the decade count, so it never condenses |
| `POPULARITY_PRIOR_WEIGHT` | How much reprint count favours a story |
| `REJECTION_LIKELIHOOD` | How hard a rejected guess is damped |
| `SEED_BOOST` | Ceiling on the lift a host system's own candidate list may apply. Assumed, not measured |
| `MAX_QUESTIONS`, `CONFIDENCE_THRESHOLD` | When to stop asking |
| `MAX_OPTIONS` | Longest answer list to show |
| `PLOT_*` | Plot vocabulary bounds |

Option lists are condensed each turn to keep a 16-bucket scale down to something
a person will actually read. Set-valued questions drop the labels carrying no
belief mass and offer "Something else". Ordered scales are coarsened instead —
neighbouring buckets merge, cheapest pair first — so the options still tile the
whole range and never leave holes ("less than half a page", "1 page", "1½-4
pages", … "more than 20 pages"). Decades are the exception and are shown whole.

## Benchmarking

`mise run sim` plays simulated readers against the built index and reports
accuracy, question count and the rank distribution of the true story.

**The benchmark lies in one specific direction.** The simulated reader answers
from the same table the engine scores against, so any data the index asserts is
correct by construction — removing wrong data always looks like a regression, and
over-trusting a column always looks like a win. Averages also hide the failure
that matters most, a single answer burying the true story, so read the tail
percentiles. One flag exists per table the index over-trusts:

| Flag | The reader it models | What it is for |
|---|---|---|
| `--layout-mismatch-rate` | Holds a re-laid-out reprint; layout answers come off a *different* printing of the same story | Tuning `LAYOUT_MISMATCH` against a reader who never mismatches just argues for trusting the layout columns unconditionally |
| `--unindexed-magazine-rate` | Holds an issue Inducks does not have; the decade answer is true but unrecorded | `mise run holdout` puts it at <!-- fig:decade-holdout-miss -->36%<!-- /fig --> |
| `--defaulted-layout-rate` | Counts panels per tier in the real comic instead of repeating Inducks' default of 2 | The only way to see the `columnsperpage` fold at all |
| `--lie-rate` | Answers wrongly at some rate | Sanity-checking `NOISE_FLOOR` |

### Where the engine stands

<!-- sim:scenarios:begin -->

Written by `mise run sim`. Do not edit by hand.

| Reader | top-1 | top-5 | top-20 | p90 | p99 | buried >500 | asked | vs baseline | measured |
|---|---|---|---|---|---|---|---|---|---|
| Honest reader | 55% | 63% | 73% | 208 | 1247 | 3.0% | 22.4 | — | 2026-09-04, 500 trials, seed 11 |
| Re-laid-out reprint 20% | 54% | 60% | 70% | 251 | 1400 | 4.0% | 22.5 | −1.4 pts p=0.265 · rank ×1.36 p=0.006 | 2026-09-04, 500 trials, seed 11 |
| Unindexed magazine (36% unindexed) | 44% | 51% | 62% | 414 | 3017 | 8.6% | 23.0 | −11.4 pts p<0.001 · rank ×4.21 p<0.001 | 2026-09-04, 500 trials, seed 11 |
| Counts the real panels | 56% | 62% | 72% | 206 | 892 | 3.2% | 22.3 | +1.0 pts p=0.359 · rank ×0.90 p=0.214 | 2026-09-04, 500 trials, seed 11 |
| Half the plot terms are opaque | 47% | 57% | 69% | 258 | 1336 | 4.4% | 23.2 | −8.0 pts p<0.001 · rank ×1.39 p<0.001 | 2026-09-04, 500 trials, seed 11 |
| Every plot term is opaque | 32% | 51% | 63% | 299 | 1637 | 6.0% | 23.9 | −23.0 pts p<0.001 · rank ×2.00 p<0.001 | 2026-09-04, 500 trials, seed 11 |
| Answers wrongly 10% | 21% | 28% | 37% | 2001 | 19441 | 22.6% | 23.8 | −34.2 pts p<0.001 · rank ×14.00 p<0.001 | 2026-09-04, 500 trials, seed 11 |
| Reads the author off the page | 77% | 83% | 87% | 60 | 646 | 2.0% | 18.2 | +21.8 pts p<0.001 · rank ×0.17 p<0.001 | 2026-09-04, 500 trials, seed 11 |

The last column compares each row against `Honest reader` story by story rather than as two
percentages: every row plays the same targets in the same order, so a difference
shows up in the trials where the two disagree. The first half is first place, the
second is where the true story landed — a rank ratio above 1 is worse. Rank sees
differences that never cross first place, so read it first.

<!-- sim:scenarios:end -->

`mise run sim` plays the honest reader and rewrites its row; `mise run sim-all`
plays every row in every table here, which takes a couple of hours. A run at
another trial count, or with flags matching no documented row, prints its numbers
and records nothing — rows are only comparable when they played the same targets,
and which rows are worth documenting stays an editorial decision, curated in
`engine/benchmark.py`.

No table in this README is transcribed by hand. A figure the repository cannot
regenerate is a figure nothing can check.

### What the two big changes bought

The engine as it was before sub-page lengths and the decade question, played
against the same targets. Both are `--ablate` flags rather than a script someone
ran once, so this argument can be re-checked against whatever the code does now:

<!-- sim:ablations:begin -->

Written by `mise run sim`. Do not edit by hand.

| Reader | top-1 | top-5 | top-20 | p90 | p99 | buried >500 | asked | vs baseline | measured |
|---|---|---|---|---|---|---|---|---|---|
| Honest reader | 55% | 63% | 73% | 208 | 1247 | 3.0% | 22.4 | — | 2026-09-04, 500 trials, seed 11 |
| Half opaque, asks anyway | 46% | 55% | 67% | 286 | 1382 | 4.6% | 23.2 | −1.6 pts p=0.332 · rank ×1.01 p=0.446 | 2026-09-04, 500 trials, seed 11 |
| Every term opaque, asks anyway | 28% | 46% | 61% | 324 | 1673 | 6.8% | 24.0 | −4.6 pts p<0.001 · rank ×1.07 p<0.001 | 2026-09-04, 500 trials, seed 11 |
| No fractional lengths | 55% | 62% | 72% | 217 | 1304 | 4.6% | 22.2 | +0.0 pts p=1.000 · rank ×1.04 p=0.184 | 2026-09-04, 500 trials, seed 11 |
| No decade question | 47% | 55% | 68% | 409 | 2391 | 8.6% | 23.1 | −8.0 pts p<0.001 · rank ×2.10 p<0.001 | 2026-09-04, 500 trials, seed 11 |
| Neither | 47% | 54% | 67% | 550 | 3732 | 10.8% | 23.1 | −8.2 pts p<0.001 · rank ×2.09 p<0.001 | 2026-09-04, 500 trials, seed 11 |
| Decade only, unindexed magazine (36% unindexed) | 44% | 50% | 62% | 517 | 3473 | 10.4% | 22.9 | +0.2 pts p=1.000 · rank ×1.02 p=0.165 | 2026-09-04, 500 trials, seed 11 |

The last column compares each row against the row it argues with (`Every plot term is opaque`, `Half the plot terms are opaque`, `Honest reader`, `Unindexed magazine`) story by story rather than as two
percentages: every row plays the same targets in the same order, so a difference
shows up in the trials where the two disagree. The first half is first place, the
second is where the true story landed — a rank ratio above 1 is worse. Rank sees
differences that never cross first place, so read it first.

<!-- sim:ablations:end -->

The two changes do different jobs, and reading only top-1 hides one of them.
Fractional page lengths barely move top-1 and pull the tail in: knowing a story
is a quarter-page strip rarely singles it out, but it stops the engine
confidently ranking it nowhere. The decade question is what moves top-1.

Treat individual top-1 cells as a couple of points either way. The gaps between
rows and the tail percentiles are what reproduce across seeds. Optimise the tail.

The last row plays the decade question against the reader it is worst for — one
whose magazine Inducks has not indexed. Its baseline is the `Neither` row, which
scores identically against that reader and against an honest one: an engine that
never asks about the decade cannot be misled by a magazine the index has no
record of.

### The `columnsperpage` fold

Inducks defaults panels-per-tier to 2 on <!-- fig:defaulted-columns -->88%<!-- /fig --> of rows, and the ETL folds those
away rather than believing them; `--defaulted-layout-rate` is what a reader who
counts the real comic instead scores. Folding costs a little on p90 against a
reader who never contradicts the default and buys a burial rate that does not
move as the reader starts to.

The comparison that decided it — the folded index against one that kept the
default — is not reproducible here, because only the folded index is built.
`--defaulted-layout-rate` is the live check: if folding were wrong, that reader
would be the one to show it.

## Known limitations

- Many stories have no English description. `keywordsummary` covers most of the
  gap but is a multilingual concatenation, so naive English tokenising
  under-serves them; multilingual embeddings would not.
- The short-gag tail is genuinely ambiguous, even with fractional lengths
  splitting it three ways. The UI shows a ranked shortlist rather
  than a single confident guess, and each row carries a scan of the story's first
  page for the <!-- fig:scan-coverage -->94.8%<!-- /fig --> of stories that have one.
- Inducks does not have every issue ever printed. Roughly <!-- fig:decade-holdout-miss -->36%<!-- /fig --> of readers will
  name a decade the index has no record of for their story; `DECADE_IMPOSSIBLE`
  bounds how far that can push the true story down but does not remove the cost.
- <!-- fig:stories-without-title -->35%<!-- /fig --> of Inducks stories have no title; the UI shows those as "Untitled
  story" with their storycode.
- Inducks' own indexing is uneven. Storyversions with no character data answer
  "unknown" to every character question and are neither favoured nor penalised.

## Not yet built

| Feature | Why it is worth it | Status |
|---|---|---|
| **Magazine and issue-number fast path** | `(publicationcode, issuenumber)` is <!-- fig:issue-keys -->257,497<!-- /fig --> distinct pairs out of <!-- fig:issue-keys-total -->257,500<!-- /fig --> issues — very nearly a key. A reader who reads "Topolino" and "1234" off the cover would cut most of the <!-- fig:session-start-bits -->17 bits<!-- /fig --> in two steps. Degrades gracefully: no match, keep asking | Not staged. The title→`publicationcode` step is *not* a clean key, and `fullyindexed = 'N'` on <!-- fig:partly-indexed-issues-share -->18.6%<!-- /fig --> of issues |
| **Title fast path** | Most non-cover entries carry a printed title, and the large majority of (language, title) pairs resolve to a single storyversion | Needs a query against `inducks_entry` filtered on `reallytitle = 'Y'` |
| **Year drill-down after the decade** | The first-publication bound rules out more at year granularity than at decade granularity | Bound only, inside the decade step. Set membership at year granularity misses far more — check with `mise run holdout` — and a bound alone is not worth its own turn |
| **Proposition-based plot questions** | Replaces bare tokens with canonical propositions | Seam is `build_vocabulary` in [plot.py](src/quackinator/etl/plot.py); the engine only ever sees a sparse boolean matrix |
| **Photo lookup** | `inducks_entryurl_vector` already holds `vector(512)` rows with a native `VECTOR KEY ... DISTANCE=COSINE` index | Available without adding a vector store |
