import { supabase } from "../../lib/supabase";
import { fetchIGDB } from ".././igdb";
import { ensureCompaniesExist } from "./gameCompanies";

import { fetchPopularityScores } from "../../helpers/popularityScores";
import { formatGameForDatabase } from "../../helpers/formatGameData";

import { IGDB_BODY } from "../../constant";

export async function addNewGames() {
  console.log("Adding newly released games");
  try {
    const THIRTY_DAYS_AGO = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const tomorrow = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    const gamesBody = `
      fields 
        updated_at,
        ${IGDB_BODY}
      where
        first_release_date > ${THIRTY_DAYS_AGO} &
        first_release_date < ${tomorrow} &
        game_type != (13, 14);
      sort first_release_date desc;
      limit 150;
    `;

    const games = await fetchIGDB("games", gamesBody);

    if (!games || games.length === 0) {
      console.log("No newly released games found from IGDB");
    } else {
      const gameIds = games.map((g: any) => g.id);
      const { data: existingGames } = await supabase
        .from("games")
        .select("id")
        .in("id", gameIds);

      const existingIds = new Set(existingGames?.map((g) => g.id) || []);
      const newGames = games.filter((game: any) => !existingIds.has(game.id));

      console.log(
        `${existingIds.size} games already exist, ${newGames.length} are new`
      );

      if (newGames.length > 0) {
        const newGameIds = newGames.map((g: any) => g.id);
        const { popularityMap } = await fetchPopularityScores(newGameIds);

        const formattedGames = await Promise.all(
          newGames.map((game: any) =>
            formatGameForDatabase(game, popularityMap.get(game.id) || null)
          )
        );

        const allCompanyIds = new Set<number>();
        formattedGames.forEach((game: any) => {
          game.developer_ids.forEach((id: number) => allCompanyIds.add(id));
          game.publisher_ids.forEach((id: number) => allCompanyIds.add(id));
        });

        await ensureCompaniesExist(Array.from(allCompanyIds));

        const { error, data } = await supabase
          .from("games")
          .upsert(formattedGames, {
            onConflict: "id",
            ignoreDuplicates: false,
          })
          .select("id, name");

        if (error) {
          console.error("Supabase insert error (games):", error);
        } else {
          console.log(`Successfully inserted ${data?.length || 0} new games`);
        }
      } else {
        console.log("All games already exist in database");
      }
    }

    console.log("Checking for unreleased games past their release date...");
    const { data: updatedGames, error: releaseUpdateError } = await supabase
      .from("games")
      .update({ released: true })
      .eq("released", false)
      .not("official_release_date", "is", null)
      .lte("official_release_date", new Date().toISOString())
      .select("id, name");

    if (releaseUpdateError) {
      console.error("Error updating release status:", releaseUpdateError);
    } else if (updatedGames && updatedGames.length > 0) {
      console.log(
        `Updated ${updatedGames.length} games to released status:`,
        updatedGames.map((g) => g.name).join(", ")
      );
    } else {
      console.log("No unreleased games needed status update");
    }
  } catch (err) {
    console.error("Error adding newly released games:", err);
  }
}
