import { IGDB_BODY } from "../constant";
import { fetchIGDB } from "../services/igdb";
import { fetchPopularityScores } from "../helpers/popularityScores";
import { insertAllEntities } from "../helpers/insertion/insertEntities";
import { insertGames } from "../helpers/insertion/insertGames";
import { insertAllRelationships } from "../helpers/insertion/insertRelationships";

async function updateRecentReleases() {
  console.log("Starting recent releases update...");

  try {
    const now = Math.floor(Date.now() / 1000);
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60;

    const newestBody = `
      fields 
        ${IGDB_BODY}
      where
        first_release_date >= ${ninetyDaysAgo} &
        first_release_date <= ${now} &
        game_type != (13, 14);
      sort first_release_date desc;
      limit 300;
    `;

    const newestGames = await fetchIGDB("games", newestBody);
    console.log(`Fetched ${newestGames.length} newest releases`);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const hypedBody = `
      fields 
        ${IGDB_BODY}
      where
        first_release_date >= ${ninetyDaysAgo} &
        first_release_date <= ${now} &
        hypes > 1 &
        game_type != (13, 14);
      sort hypes desc;
      limit 300;
    `;

    const hypedGames = await fetchIGDB("games", hypedBody);
    console.log(`Fetched ${hypedGames.length} hyped releases`);

    const allGames = [...newestGames, ...hypedGames];
    const uniqueGames = Array.from(
      new Map(allGames.map((game: any) => [game.id, game])).values()
    );

    console.log(`Total unique games: ${uniqueGames.length}`);

    if (uniqueGames.length === 0) {
      return { updated: 0, message: "No recent releases found" };
    }

    const gameIds = uniqueGames.map((g: any) => g.id);
    const { popularityMap } = await fetchPopularityScores(gameIds, {
      batchSize: 10,
      delayBetweenBatches: 500,
    });

    await insertAllEntities(uniqueGames);
    await insertGames(uniqueGames, popularityMap);
    await insertAllRelationships(uniqueGames);

    console.log("Recent releases update complete");

    return {
      updated: uniqueGames.length,
      message: `Successfully updated ${uniqueGames.length} recent releases (${newestGames.length} newest + ${hypedGames.length} hyped)`,
    };
  } catch (error) {
    console.error("Error during recent releases update:", error);
    throw error;
  }
}

if (require.main === module) {
  updateRecentReleases()
    .then((result) => {
      console.log(result.message);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { updateRecentReleases };
