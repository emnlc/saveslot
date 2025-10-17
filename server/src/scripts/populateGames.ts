import { IGDB_BODY } from "../constant";
import { fetchIGDB } from "../services/igdb";
import { fetchPopularityScores } from "../helpers/popularityScores";
import { insertAllEntities } from "../helpers/insertion/insertEntities";
import { insertGames } from "../helpers/insertion/insertGames";
import { insertAllRelationships } from "../helpers/insertion/insertRelationships";

async function populateGames(totalLimit: number = 500) {
  console.log(`Starting game population (target: ${totalLimit} games)...`);

  const IGDB_LIMIT = 500;
  const batches = Math.ceil(totalLimit / IGDB_LIMIT);
  let totalFetched = 0;
  let offset = 0;

  try {
    for (let batch = 1; batch <= batches; batch++) {
      const remaining = totalLimit - totalFetched;
      const currentLimit = Math.min(IGDB_LIMIT, remaining);

      console.log(
        `Batch ${batch}/${batches} (fetching ${currentLimit} games, offset: ${offset})`
      );

      const gamesBody = `
        fields 
          ${IGDB_BODY}
        where
          total_rating_count > 5 &
          game_type != (13, 14);
        sort hypes desc;
        limit ${currentLimit};
        offset ${offset};
      `;

      const games = await fetchIGDB("games", gamesBody);
      console.log(`Fetched ${games.length} games from IGDB`);

      if (games.length === 0) {
        console.log("No more games found");
        break;
      }

      const gameIds = games.map((g: any) => g.id);
      const { popularityMap } = await fetchPopularityScores(gameIds, {
        batchSize: 10,
        delayBetweenBatches: 500,
      });

      await insertAllEntities(games);
      await insertGames(games, popularityMap);
      await insertAllRelationships(games);

      totalFetched += games.length;
      offset += currentLimit;

      console.log(
        `Batch ${batch} complete. Total processed: ${totalFetched}/${totalLimit}`
      );

      if (batch < batches) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }

    console.log(`Population complete. Total games added: ${totalFetched}`);
    return { success: true, total: totalFetched };
  } catch (error) {
    console.error("Error during population:", error);
    throw error;
  }
}

populateGames(5000)
  .then((result) => {
    console.log(`Complete. Added ${result?.total} games to database`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

export { populateGames };
