/**
 * How accurate is Kumiko's row count, really?
 *
 * Quackinator can be told how many rows (tiers) of panels a story has, which is
 * worth 0.73 bits — but only if the answer is right. Its own benchmark puts a
 * reader who answers wrongly 10% of the time 34 points of top-1 below an honest
 * one, with the true story buried 14x deeper, so a row count that is often
 * wrong is worse than no row count at all. That is what this measures, and it
 * is why `QUACKINATOR_TRUST_KUMIKO` defaults to false in Dumili.
 *
 * Ground truth is `inducks_storyversion.rowsperpage`, scored against Kumiko run
 * over the first-page scans already mirrored under
 * `packages/api/services/story-search/covers`.
 *
 * Two things to read carefully in the output:
 *
 *   - **The first page is the hardest page.** It carries the title panel and an
 *     establishing shot, so its layout is the least like the storyversion's
 *     typical page — which is what `rowsperpage` records. Dumili takes the
 *     *median* across every scanned page of an entry, so this is a lower bound
 *     on what it would really send.
 *   - **`rowsperpage = 4` is Inducks' documented default**, carried by 46% of
 *     comic storyversions, so it is not all measurement. The report repeats the
 *     score with those rows dropped; believe that one.
 *
 * Usage, from packages/api:
 *
 *   bun run scripts/measure-kumiko-accuracy.ts --sample 500
 *   bun run scripts/measure-kumiko-accuracy.ts --sample 2000 --seed 11 --out /tmp/kumiko.json
 */
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

// Relative on purpose: this is the row count Dumili actually computes and would
// send to Quackinator. Scoring a copy of it here would measure the copy.
import { getPanelRows } from "~dm-types/panelRows";
import { getPrefixedEntryurl } from "../services/coa/issue-details";

type Args = {
  sample: number;
  seed: number;
  covers: string;
  batch: number;
  image: string;
  out: string | null;
};

const parseArgs = (): Args => {
  const raw = process.argv.slice(2);
  const get = (name: string, fallback: string) => {
    const i = raw.indexOf(`--${name}`);
    return i === -1 ? fallback : raw[i + 1];
  };
  return {
    sample: Number(get("sample", "500")),
    seed: Number(get("seed", "11")),
    covers: resolve(get("covers", "services/story-search/covers")),
    // Kumiko's own startup dominates a single image, so they go in together.
    batch: Number(get("batch", "40")),
    image: get("image", "dumili-api-kumiko:latest"),
    out: raw.includes("--out") ? get("out", "") || null : null,
  };
};

type Candidate = {
  storycode: string;
  url: string;
  sitecode: string;
  rowsperpage: number;
  path: string;
};

/**
 * First-page scans of comic stories whose typical row count Inducks records.
 *
 * `kind = 'n'` because Kumiko segments comic panels, and everything else — a
 * cover, an illustration, a text story — has no tiers to count. `RAND(seed)`
 * keeps a run reproducible, and makes a larger `--sample` a superset of a
 * smaller one rather than a different population.
 */
const fetchCandidates = async ({ sample, seed, covers }: Args) => {
  const rows = await prismaCoa.$queryRawUnsafe<
    { storycode: string; url: string; sitecode: string; rowsperpage: number }[]
  >(
    `SELECT eu.storycode, eu.url, eu.sitecode, sv.rowsperpage
     FROM inducks_entryurl eu
     JOIN inducks_entry e ON e.entrycode = eu.entrycode
     JOIN inducks_storyversion sv ON sv.storyversioncode = e.storyversioncode
     WHERE eu.pagenumber = 1
       AND sv.kind = 'n'
       AND sv.rowsperpage > 0
       AND eu.sitecode NOT LIKE 'dbp/%'
       AND eu.sitecode NOT LIKE 'thumbnails%'
     ORDER BY RAND(?)
     LIMIT ?`,
    seed,
    // Over-fetch: a scan Inducks records is not always one the local mirror
    // holds, and only what is on disk can be measured.
    Math.ceil(sample * 1.5),
  );

  const candidates: Candidate[] = [];
  let missing = 0;
  for (const row of rows) {
    const path = `${covers}/${getPrefixedEntryurl(row.url, row.sitecode)}`;
    if (existsSync(path)) {
      candidates.push({ ...row, path });
    } else {
      missing++;
    }
    if (candidates.length === sample) {
      break;
    }
  }
  return { candidates, missing };
};

type KumikoPage = {
  filename: string;
  size: [number, number];
  panels: [number, number, number, number][];
};

const runKumiko = (paths: string[], args: Args) =>
  new Promise<KumikoPage[]>((resolvePromise) => {
    const child = spawn("docker", [
      "run",
      "--rm",
      "-v",
      `${args.covers}:${args.covers}:ro`,
      "--entrypoint",
      "python3",
      args.image,
      "./kumiko/kumiko",
      "-i",
      ...paths,
    ]);
    let stdout = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.on("close", () => {
      try {
        resolvePromise(JSON.parse(stdout));
      } catch {
        resolvePromise([]);
      }
    });
  });

const segment = async (candidates: Candidate[], args: Args) => {
  const byFilename = new Map<string, KumikoPage>();
  for (let i = 0; i < candidates.length; i += args.batch) {
    const batch = candidates.slice(i, i + args.batch);
    let pages = await runKumiko(
      batch.map(({ path }) => path),
      args,
    );
    // One unreadable file kills a whole batch, so the rest are worth retrying
    // singly rather than discarding.
    if (!pages.length && batch.length > 1) {
      pages = (
        await Promise.all(batch.map(({ path }) => runKumiko([path], args)))
      ).flat();
    }
    for (const page of pages) {
      byFilename.set(page.filename, page);
    }
    process.stderr.write(
      `\rsegmented ${Math.min(i + args.batch, candidates.length)}/${candidates.length}`,
    );
  }
  process.stderr.write("\n");
  return byFilename;
};

type Scored = Candidate & { detected: number; panels: number; height: number };

const percent = (part: number, whole: number) =>
  whole ? `${((100 * part) / whole).toFixed(1)}%` : "—";

const summarise = (label: string, scored: Scored[]) => {
  if (!scored.length) {
    return `${label}: nothing to score`;
  }
  const exact = scored.filter((s) => s.detected === s.rowsperpage).length;
  const within1 = scored.filter(
    (s) => Math.abs(s.detected - s.rowsperpage) <= 1,
  ).length;
  const over = scored.filter((s) => s.detected > s.rowsperpage).length;
  const under = scored.filter((s) => s.detected < s.rowsperpage).length;
  const mae =
    scored.reduce((t, s) => t + Math.abs(s.detected - s.rowsperpage), 0) /
    scored.length;
  return [
    `${label}  (n = ${scored.length})`,
    `  exact           ${percent(exact, scored.length)}`,
    `  within +/-1     ${percent(within1, scored.length)}`,
    `  wrong           ${percent(scored.length - exact, scored.length)}`,
    `  over / under    ${percent(over, scored.length)} / ${percent(under, scored.length)}`,
    `  mean abs error  ${mae.toFixed(2)} rows`,
  ].join("\n");
};

const main = async () => {
  const args = parseArgs();
  if (!existsSync(args.covers)) {
    console.error(`No covers directory at ${args.covers}`);
    process.exit(1);
  }
  console.log(
    `Sampling ${args.sample} first pages (seed ${args.seed}) from ${args.covers}\n`,
  );

  const { candidates, missing } = await fetchCandidates(args);
  console.log(
    `${candidates.length} scans on disk; ${missing} recorded by Inducks but not mirrored locally\n`,
  );
  if (!candidates.length) {
    process.exit(1);
  }

  const pages = await segment(candidates, args);

  const scored: Scored[] = [];
  const unsegmented: Candidate[] = [];
  for (const candidate of candidates) {
    const page = pages.get(candidate.path.split("/").pop()!);
    if (!page) {
      unsegmented.push(candidate);
      continue;
    }
    scored.push({
      ...candidate,
      detected: getPanelRows(
        page.panels.map(([x, y, width, height]) => ({ x, y, width, height })),
      ),
      panels: page.panels.length,
      height: page.size[1],
    });
  }

  // One panel for a whole page is Kumiko declining to find a layout, not a
  // one-tier comic, and Dumili already reads that as an illustration.
  const usable = scored.filter((s) => s.panels > 1);
  const degenerate = scored.filter((s) => s.panels <= 1);
  const measured = usable.filter((s) => s.rowsperpage !== 4);

  console.log(`\n${"=".repeat(62)}`);
  console.log("KUMIKO ROW-COUNT ACCURACY, FIRST PAGES");
  console.log("=".repeat(62));
  console.log(
    `\nKumiko produced no result for ${unsegmented.length} of ${candidates.length} scans`,
  );
  console.log(
    `Found one panel or none on ${percent(degenerate.length, scored.length)} of the rest, which is a whole-page read rather than a layout\n`,
  );
  console.log(summarise("All segmented pages", usable));
  console.log(
    `\n${summarise("Excluding rowsperpage = 4, Inducks' documented default", measured)}`,
  );

  console.log("\nBy true row count:");
  const byTrue = new Map<number, Scored[]>();
  for (const s of usable) {
    byTrue.set(s.rowsperpage, [...(byTrue.get(s.rowsperpage) ?? []), s]);
  }
  for (const rows of [...byTrue.keys()].sort((a, b) => a - b)) {
    const group = byTrue.get(rows)!;
    const exact = group.filter((s) => s.detected === rows).length;
    const median = [...group].map((s) => s.detected).sort((a, b) => a - b)[
      Math.floor(group.length / 2)
    ];
    console.log(
      `  ${String(rows).padStart(2)} rows  n=${String(group.length).padStart(4)}  exact ${percent(exact, group.length).padStart(6)}  median detected ${median}`,
    );
  }

  // getPanelRows clusters panel tops within 5 *pixels*, so what that tolerance
  // means depends on how tall the scan is. If the score splits here, the
  // constant is the bug rather than Kumiko.
  console.log(
    `\n${summarise(
      "Scans >= 1000px tall",
      usable.filter((s) => s.height >= 1000),
    )}`,
  );
  console.log(
    `\n${summarise(
      "Scans < 1000px tall",
      usable.filter((s) => s.height < 1000),
    )}`,
  );

  // The mirror under services/story-search/covers was fetched to train a
  // 224x224 embedding model, so every scan in it is capped around 400px tall.
  // Kumiko is panel segmentation over gutters, and a gutter a few pixels wide
  // is not a gutter any more — so a score from this corpus is a floor on what
  // Kumiko can do, not an estimate of what it does on the full-resolution
  // pages and PDFs a Dumili indexer actually uploads. Say so loudly, because
  // the number is otherwise perfectly usable-looking.
  const heights = usable.map((s) => s.height).sort((a, b) => a - b);
  const p90 = heights[Math.floor(heights.length * 0.9)] ?? 0;
  if (p90 < 800) {
    console.log(`\n${"!".repeat(62)}`);
    console.log(
      `THUMBNAIL CORPUS: 90% of these scans are under ${p90}px tall.\n` +
        `Kumiko finds panels by their gutters, and at this size a gutter is a\n` +
        `few pixels wide, so this measures Kumiko on thumbnails rather than on\n` +
        `what Dumili is given. Treat the score below as a floor, and re-run\n` +
        `with --covers pointed at a full-resolution source for a real answer.`,
    );
    console.log("!".repeat(62));
  }

  const wrong = usable.length
    ? (usable.length -
        usable.filter((s) => s.detected === s.rowsperpage).length) /
      usable.length
    : 1;
  console.log(`\n${"=".repeat(62)}`);
  console.log(
    `Wrong-answer rate ${percent(wrong * 100, 100)}. Quackinator's benchmark costs a\n` +
      `10%-wrong reader 34 points of top-1 and buries the true story 14x\n` +
      `deeper, so set QUACKINATOR_TRUST_KUMIKO=true only well below that.`,
  );
  console.log("=".repeat(62));

  if (args.out) {
    writeFileSync(
      args.out,
      JSON.stringify(
        { args, unsegmented: unsegmented.length, scored },
        null,
        2,
      ),
    );
    console.log(`\nPer-scan results written to ${args.out}`);
  }
  await prismaCoa.$disconnect();
};

void main();
