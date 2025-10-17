import { IGDB_BODY } from "../constant";
import { fetchIGDB } from "../services/igdb";
import { fetchPopularityScores } from "../helpers/popularityScores";
import { insertAllEntities } from "../helpers/insertion/insertEntities";
import { insertGames } from "../helpers/insertion/insertGames";
import { insertAllRelationships } from "../helpers/insertion/insertRelationships";

async function updateUpcomingGames() {
  console.log("Starting upcoming games update...");

  try {
    const now = Math.floor(Date.now() / 1000);
    const oneYear = 365 * 24 * 60 * 60;
    const futureDate = now + oneYear;

    const gamesBody = `
      fields 
        ${IGDB_BODY}
      where
        first_release_date >= ${now} &
        first_release_date < ${futureDate} &
        game_type != (13, 14);
      sort first_release_date asc;
      limit 250;
    `;

    const games = await fetchIGDB("games", gamesBody);
    console.log(`Fetched ${games.length} upcoming games from IGDB`);

    if (games.length === 0) {
      return { updated: 0, message: "No upcoming games found" };
    }

    const gameIds = games.map((g: any) => g.id);
    const { popularityMap } = await fetchPopularityScores(gameIds, {
      batchSize: 10,
      delayBetweenBatches: 500,
    });

    await insertAllEntities(games);
    await insertGames(games, popularityMap);
    await insertAllRelationships(games);

    console.log("Upcoming games update complete");

    return {
      updated: games.length,
      message: `Successfully updated ${games.length} upcoming games`,
    };
  } catch (error) {
    console.error("Error during upcoming games update:", error);
    throw error;
  }
}

if (require.main === module) {
  updateUpcomingGames()
    .then((result) => {
      console.log(result.message);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { updateUpcomingGames };
