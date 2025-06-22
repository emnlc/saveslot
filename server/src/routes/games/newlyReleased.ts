import { Hono } from "hono";
import { fetchIGDB } from "../../services/igdb";
import { supabase } from "../../lib/supabase";

export const newlyReleasedRoutes = new Hono();
const NINETY_DAYS = Math.floor(Date.now() / 1000) - 7889238;

// recently released games
newlyReleasedRoutes.get("/", async (c) => {
  try {
    const body = `
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
      total_rating_count > 3 &
      first_release_date > ${NINETY_DAYS} &
      first_release_date < ${Math.floor(Date.now() / 1000)};
    sort hypes desc;
    limit 30;
    `;

    const releases = await fetchIGDB("games", body);
    return c.json(releases);
  } catch (err) {
    console.error("Error fetching popular games:", err);
    return c.json({ error: "Failed to fetch popular games" }, 500);
  }
});

newlyReleasedRoutes.get("/all", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1", 10);
    const pageSize = parseInt(c.req.query("limit") || "60", 10);
    const offset = (page - 1) * pageSize;

    const sort1 = c.req.query("sort1") || "first_release_date";
    const sort1Order = c.req.query("order1") === "asc" ? "asc" : "desc";

    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - 90)).toISOString();

    const { count } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true })
      .gte("first_release_date", cutoffDate);

    const query = supabase
      .from("games")
      .select("*")
      .gte("first_release_date", cutoffDate)
      .order(sort1, { ascending: sort1Order === "asc" })
      .range(offset, offset + pageSize - 1);

    const { data: games, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      return c.json({ error: "Failed to fetch newly released games" }, 500);
    }

    const totalPages = Math.ceil((count ?? 0) / pageSize);

    return c.json({
      page,
      totalCount: count || 0,
      totalPages: totalPages,
      pageSize,
      sort: sort1,
      order: sort1Order,
      games,
    });
  } catch (err) {
    console.error("Error querying newly released games:", err);
    return c.json({ error: "Unexpected error" }, 500);
  }
});

// TODO: schedule this to run on its own
newlyReleasedRoutes.get("/get", async (c) => {
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
      };
    });

    const { error } = await supabase
      .from("games")
      .upsert(formattedGames, { onConflict: "id" });

    if (error) {
      console.error("Supabase insert error (games):", error);
      return c.json({ error: "Failed to save upcoming games" }, 500);
    }

    return c.json(newlyReleasedGames);
  } catch (err) {
    console.error("Error fetching upcoming games:", err);
    return c.json({ error: "Failed to fetch upcoming games" }, 500);
  }
});
