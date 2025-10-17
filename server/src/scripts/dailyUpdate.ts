import { updateUpcomingGames } from "./updateUpcomingGames";
import { updateRecentReleases } from "./updateRecentReleases";

async function runDailyUpdates() {
  console.log("Starting daily game updates...");

  try {
    const recentResult = await updateRecentReleases();
    console.log(recentResult.message);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const upcomingResult = await updateUpcomingGames();
    console.log(upcomingResult.message);

    const totalUpdated = recentResult.updated + upcomingResult.updated;
    console.log(`Daily update complete. Total games updated: ${totalUpdated}`);

    return {
      success: true,
      recent: recentResult.updated,
      upcoming: upcomingResult.updated,
      total: totalUpdated,
    };
  } catch (error) {
    console.error("Daily update failed:", error);
    throw error;
  }
}

if (require.main === module) {
  runDailyUpdates()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runDailyUpdates };
