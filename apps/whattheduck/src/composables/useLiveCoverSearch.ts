import { CameraPreview } from '@capgo/camera-preview';

import useCoverSearch, { type Cover, normalizeBase64 } from '~/composables/useCoverSearch';
import useFrameSampler, {
  type FrameMetrics,
  type FrameSamplerConfig,
  type FrameSize,
} from '~/composables/useFrameSampler';

type SearchOneFrame = ReturnType<typeof useCoverSearch>['searchOneFrame'];

export const liveCoverSearchConfig = {
  /** Live frames go to the fast pastec index; the accurate one is reserved for confirmation. */
  pastecIndex: 1,
  /** Floor between two searches — the loop otherwise paces itself on the observed round trip. */
  minIntervalMs: 400,
  /** A gated frame costs nothing, so re-sample sooner than after a real search. */
  skippedFrameIntervalMs: 150,
  errorBackoffMs: 2000,
  captureQuality: 50,
  stability: {
    windowSize: 4,
    requiredVotes: 2,
  },
  session: {
    maxSearches: 40,
  },
};

export type LivePhase = 'idle' | 'scanning' | 'matched' | 'exhausted';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default (searchOneFrame: SearchOneFrame, samplerConfig?: FrameSamplerConfig, config = liveCoverSearchConfig) => {
  const sampler = useFrameSampler(samplerConfig);

  const phase = ref<LivePhase>('idle');
  const suggestion = ref<Cover>();
  const covers = ref<Cover[]>([]);
  /** Size of the frame the suggestion was matched on, to place its bounding rect on screen. */
  const suggestionFrameSize = ref<FrameSize>();

  /** Exposed for benchmarking the sampler stages. */
  const stats = ref({ searches: 0, skippedBlurry: 0, skippedUnchanged: 0, lastRoundTripMs: 0 });
  const lastMetrics = ref<FrameMetrics>();

  const dismissedIssuecodes = new Set<string>();
  let votes: string[] = [];
  let generation = 0;

  const stop = () => {
    generation++;
    if (phase.value === 'scanning') {
      phase.value = 'idle';
    }
  };

  const registerVote = (cover: Cover) => {
    votes = [...votes, cover.issuecode].slice(-config.stability.windowSize);
    const agreeing = votes.filter((issuecode) => issuecode === cover.issuecode).length;
    return agreeing >= config.stability.requiredVotes;
  };

  const start = async () => {
    const thisGeneration = ++generation;
    const isCurrent = () => generation === thisGeneration;

    sampler.reset();
    votes = [];
    stats.value = { searches: 0, skippedBlurry: 0, skippedUnchanged: 0, lastRoundTripMs: 0 };
    phase.value = 'scanning';

    let previousSearchFoundSomething = false;

    while (isCurrent() && phase.value === 'scanning') {
      if (stats.value.searches >= config.session.maxSearches) {
        phase.value = 'exhausted';
        break;
      }

      const captured = await CameraPreview.captureSample({ quality: config.captureQuality }).catch(() => undefined);
      if (!isCurrent()) {
        break;
      }
      if (!captured) {
        await sleep(config.errorBackoffMs);
        continue;
      }

      const frame = await sampler.prepare(normalizeBase64(captured.value), !previousSearchFoundSomething);
      if (!isCurrent()) {
        break;
      }
      lastMetrics.value = frame.metrics;

      if (frame.status === 'skipped') {
        if (frame.reason === 'blurry') {
          stats.value.skippedBlurry++;
        } else {
          stats.value.skippedUnchanged++;
        }
        await sleep(config.skippedFrameIntervalMs);
        continue;
      }

      const requestStartedAt = performance.now();
      console.log(frame.dataUrl);
      const outcome = await searchOneFrame(frame.dataUrl, config.pastecIndex);
      if (!isCurrent()) {
        break;
      }
      stats.value.searches++;
      stats.value.lastRoundTripMs = performance.now() - requestStartedAt;

      if (outcome.status === 'error') {
        previousSearchFoundSomething = false;
        // A rate-limited caller is told exactly how long to wait.
        await sleep(outcome.retryAfterMs ?? config.errorBackoffMs);
        continue;
      }

      if (outcome.status === 'no-match') {
        previousSearchFoundSomething = false;
        await sleep(Math.max(config.minIntervalMs, stats.value.lastRoundTripMs));
        continue;
      }

      debugger;

      previousSearchFoundSomething = true;
      const best = outcome.covers[0];

      if (!dismissedIssuecodes.has(best.issuecode) && registerVote(best)) {
        covers.value = outcome.covers;
        suggestion.value = best;
        suggestionFrameSize.value = frame.size;
        phase.value = 'matched';
        break;
      }

      await sleep(Math.max(config.minIntervalMs, stats.value.lastRoundTripMs));
    }
  };

  return {
    phase,
    suggestion,
    suggestionFrameSize,
    covers,
    stats,
    lastMetrics,
    start,
    stop,

    /** Rejects the current suggestion and resumes scanning. */
    dismiss: () => {
      if (suggestion.value) {
        dismissedIssuecodes.add(suggestion.value.issuecode);
      }
      suggestion.value = undefined;
      suggestionFrameSize.value = undefined;
      covers.value = [];
      return start();
    },

    /** Restarts a loop that hit the session cap. */
    restart: () => {
      dismissedIssuecodes.clear();
      return start();
    },
  };
};
