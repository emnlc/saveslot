import { fetchIGDB } from "../services/igdb";

interface PopularityPrimitive {
  id: number;
  game_id: number;
  popularity_type: number;
  value: number;
}

interface GamePopularityScore {
  game_id: number;
  popularity_score: number;
  breakdown: {
    visits?: number;
    want_to_play?: number;
    playing?: number;
    total_reviews?: number;
  };
}

export const fetchGamePopularity = async (
  gameIds: number[]
): Promise<PopularityPrimitive[]> => {
  const gameIdList = `(${gameIds.join(",")})`;
  const allResults: PopularityPrimitive[] = [];
  const types = [1, 2, 3, 8]; // Visits, Want to Play, Playing, Total Reviews

  for (const type of types) {
    const body = `fields game_id,value,popularity_type; where game_id = ${gameIdList} & popularity_type = ${type};`;

    try {
      const results = await fetchIGDB("popularity_primitives", body);
      allResults.push(...results);

      // delay
      if (type !== 8) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    } catch (error) {
      console.error(`Failed to fetch popularity type ${type}:`, error);
    }
  }

  return allResults;
};

export const calculateWeightedPopularity = (
  popularityData: PopularityPrimitive[],
  weights = {
    visits: 0.4,
    wantToPlay: 0.3,
    playing: 0.2,
    totalReviews: 0.1,
  },
  multiplier = 1000000
): GamePopularityScore[] => {
  const byGame = popularityData.reduce((acc, item) => {
    if (!acc[item.game_id]) {
      acc[item.game_id] = [];
    }
    acc[item.game_id].push(item);
    return acc;
  }, {} as Record<number, PopularityPrimitive[]>);

  return Object.entries(byGame).map(([gameId, primitives]) => {
    const breakdown: GamePopularityScore["breakdown"] = {};

    primitives.forEach((primitive) => {
      switch (primitive.popularity_type) {
        case 1:
          breakdown.visits = primitive.value;
          break;
        case 2:
          breakdown.want_to_play = primitive.value;
          break;
        case 3:
          breakdown.playing = primitive.value;
          break;
        case 8:
          breakdown.total_reviews = primitive.value;
          break;
      }
    });

    const weighted_score =
      (breakdown.visits || 0) * weights.visits +
      (breakdown.want_to_play || 0) * weights.wantToPlay +
      (breakdown.playing || 0) * weights.playing +
      (breakdown.total_reviews || 0) * weights.totalReviews;

    return {
      game_id: parseInt(gameId),
      popularity_score: weighted_score * multiplier,
      breakdown,
    };
  });
};

export const fetchWeightedPopularity = async (
  gameIds: number[],
  weights?: {
    visits?: number;
    wantToPlay?: number;
    playing?: number;
    totalReviews?: number;
  },
  multiplier?: number
): Promise<GamePopularityScore[]> => {
  const popularityData = await fetchGamePopularity(gameIds);
  return calculateWeightedPopularity(
    popularityData,
    weights as any,
    multiplier
  );
};
