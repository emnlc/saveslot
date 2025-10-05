import { supabase } from "../../lib/supabase";
import { fetchIGDB } from ".././igdb";
import { ensureCompaniesExist } from "./gameCompanies";

import { fetchPopularityScores } from "../../helpers/popularityScores";
import { formatGameForDatabase } from "../../helpers/formatGameData";

import { IGDB_BODY } from "../../constant";

export async function addUpcomingGames() {
  console.log("Adding upcoming games");
  try {
    const now = Math.floor(Date.now() / 1000);

    const gamesBody = `
      fields 
        updated_at,
        ${IGDB_BODY}
      where
        first_release_date > ${now} &
        first_release_date != null &
        game_type != (13, 14);
      sort first_release_date asc;
      limit 150;
    `;

    const upcomingGames = await fetchIGDB("games", gamesBody);

    if (!upcomingGames || upcomingGames.length === 0) {
      console.log("No upcoming games found to add");
      return;
    }

    const newGameIds = upcomingGames.map((g: any) => g.id);
    const { popularityMap } = await fetchPopularityScores(newGameIds);

    const formattedGames = await Promise.all(
      upcomingGames.map((game: any) =>
        formatGameForDatabase(game, popularityMap.get(game.id) || null)
      )
    );

    const allCompanyIds = new Set<number>();
    formattedGames.forEach((game: any) => {
      game.developer_ids.forEach((id: number) => allCompanyIds.add(id));
      game.publisher_ids.forEach((id: number) => allCompanyIds.add(id));
    });

    await ensureCompaniesExist(Array.from(allCompanyIds));

    const { error } = await supabase
      .from("games")
      .upsert(formattedGames, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("Supabase insert error (upcoming games):", error);
    } else {
      console.log(
        `Successfully upserted ${formattedGames.length} upcoming games`
      );
    }
  } catch (err) {
    console.error("Error adding upcoming games:", err);
  }
}
