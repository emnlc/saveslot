import { supabase } from "../../lib/supabase";
import { fetchIGDB } from "../igdb";
import { fetchPopularityScores } from "../../helpers/popularityScores";
import { formatGameForDatabase } from "../../helpers/formatGameData";
import { IGDB_BODY } from "../../constant";

export async function populateGames(totalGames: number = 5000) {
  console.log(`Starting to populate ${totalGames} games...`);

  try {
    const batchSize = 500;
    let allGames: any[] = [];
    const numBatches = Math.ceil(totalGames / batchSize);

    // Fetch games from IGDB in batches
    for (let i = 0; i < numBatches; i++) {
      const offset = i * batchSize;
      const limit = Math.min(batchSize, totalGames - offset);

      const gamesBody = `
        fields 
          updated_at,
          ${IGDB_BODY}
        where 
          total_rating_count > 5 &
          game_type != 14;
        sort hypes desc;
        limit ${limit};
        offset ${offset};
      `;

      const games = await fetchIGDB("games", gamesBody);

      if (!games || games.length === 0) {
        console.log(`No more games found at offset ${offset}`);
        break;
      }

      allGames = allGames.concat(games);
      console.log(
        `Fetched batch ${i + 1}/${numBatches} (Total: ${allGames.length} games)`
      );

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (allGames.length === 0) {
      console.log("No games found to store");
      return;
    }

    // Fetch popularity scores using helper
    const newGameIds = allGames.map((g: any) => g.id);
    const { popularityMap } = await fetchPopularityScores(newGameIds);

    const formattedGames = await Promise.all(
      allGames.map((game: any) =>
        formatGameForDatabase(game, popularityMap.get(game.id) || null)
      )
    );

    const allCompanyIds = new Set<number>();
    formattedGames.forEach((game: any) => {
      game.developer_ids.forEach((id: number) => allCompanyIds.add(id));
      game.publisher_ids.forEach((id: number) => allCompanyIds.add(id));
    });

    // Insert in batches to avoid payload size limits
    const insertBatchSize = 100;
    let successCount = 0;

    for (let i = 0; i < formattedGames.length; i += insertBatchSize) {
      const batch = formattedGames.slice(i, i + insertBatchSize);

      const { data, error } = await supabase
        .from("games")
        .upsert(batch, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        .select("id");

      if (error) {
        console.error(`Error inserting batch at index ${i}:`, error);
      } else {
        successCount += data?.length || 0;
      }
    }

    console.log(`Successfully populated ${successCount} games`);
  } catch (err) {
    console.error("Error in populator:", err);
  }
}

// Run the populator
export async function initializeDatabase() {
  console.log("Initializing game database...");
  await populateGames(1000);
  console.log("Database initialization complete");
}
