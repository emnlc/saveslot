import { supabase } from "../lib/supabase";
import { fetchIGDB } from "./igdb";
const NINETY_DAYS = Math.floor(Date.now() / 1000) - 7889238;

export async function addNewGames() {
  console.log("Adding newly released games");
  try {
    const gamesBody = `
      fields 
        name,
        cover.image_id,
        total_rating,
        total_rating_count,
        rating,
        rating_count,
        aggregated_rating,
        aggregated_rating_count,
        hypes,
        slug,
        first_release_date;
      where 
        total_rating_count > 1 &
        first_release_date > ${NINETY_DAYS} &
        first_release_date < ${Math.floor(Date.now() / 1000)};
      sort hypes desc;
      limit 500;
      `;

    const newlyReleasedGames = await fetchIGDB("games", gamesBody);

    const formattedGames = newlyReleasedGames.map((game: any) => {
      const rating = game.total_rating || 0;
      const count = game.total_rating_count || 0;

      return {
        id: game.id,
        name: game.name,
        slug: game.slug,
        cover_id: game.cover?.image_id ? game.cover.image_id : null,
        igdb_total_rating: game.total_rating,
        igdb_total_rating_count: game.total_rating_count,
        updated_at: game.updated_at,
        popularity: count * (rating / 100),
        first_release_date: new Date(
          game.first_release_date * 1000
        ).toISOString(),
        released: true,
      };
    });

    const { error } = await supabase.from("games").upsert(formattedGames, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error("Supabase insert error (games):", error);
    }
  } catch (err) {
    console.error("Error adding newly released games:", err);
  }
}

export async function addUpcomingGames() {
  try {
    const now = Math.floor(Date.now() / 1000);

    const gamesBody = `
        fields 
          name,
          cover.image_id,
          first_release_date,
          updated_at,
          slug,
          hypes;
        where
          hypes != null &
          first_release_date > ${now} & 
          first_release_date != null;
        sort hypes desc;
        limit 500;
      `;

    const upcomingGames = await fetchIGDB("games", gamesBody);

    const formattedGames = upcomingGames.map((game: any) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      cover_id: game.cover?.image_id || null,
      igdb_total_rating: game.total_rating || null,
      igdb_total_rating_count: game.total_rating_count || null,
      updated_at: game.updated_at,
      popularity: game.hypes,
      first_release_date: new Date(
        game.first_release_date * 1000
      ).toISOString(),
      released: false,
    }));

    const { error } = await supabase
      .from("games")
      .upsert(formattedGames, { onConflict: "id" });

    if (error) {
      console.error("Supabase insert error (upcoming):", error);
    }
  } catch (err) {
    console.error("Error fetching upcoming games:", err);
  }
}
