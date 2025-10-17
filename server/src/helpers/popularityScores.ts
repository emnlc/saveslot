import { fetchWeightedPopularity } from "./popularity";

async function fetchBatchWithRetry(
  batch: number[],
  retryCount = 0,
  maxRetries = 3
): Promise<any[]> {
  try {
    return await fetchWeightedPopularity(batch);
  } catch (error: any) {
    const isRateLimitError =
      error.message?.includes("429") ||
      error.message?.includes("rate limit") ||
      error.message?.includes("Too Many Requests");

    if (isRateLimitError && retryCount < maxRetries) {
      const waitTime = Math.pow(2, retryCount + 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return fetchBatchWithRetry(batch, retryCount + 1, maxRetries);
    }

    throw error;
  }
}

interface PopularityResult {
  popularityMap: Map<number, number>;
  totalFetched: number;
  totalRequested: number;
}

export async function fetchPopularityScores(
  gameIds: number[],
  options: {
    batchSize?: number;
    delayBetweenBatches?: number;
    verbose?: boolean;
  } = {}
): Promise<PopularityResult> {
  const {
    batchSize = 10,
    delayBetweenBatches = 500,
    verbose = false,
  } = options;

  let popularityScores = [];

  try {
    for (let i = 0; i < gameIds.length; i += batchSize) {
      const batch = gameIds.slice(i, i + batchSize);
      const batchScores = await fetchBatchWithRetry(batch);
      popularityScores.push(...batchScores);

      if (i + batchSize < gameIds.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    if (verbose) {
      const successRate = (
        (popularityScores.length / gameIds.length) *
        100
      ).toFixed(1);
      console.log(
        `Fetched ${popularityScores.length}/${gameIds.length} popularity scores (${successRate}%)`
      );
    }
  } catch (error) {
    console.error("Error fetching popularity scores:", error);
  }

  const popularityMap = new Map(
    popularityScores.map((score) => [score.game_id, score.popularity_score])
  );

  return {
    popularityMap,
    totalFetched: popularityScores.length,
    totalRequested: gameIds.length,
  };
}
