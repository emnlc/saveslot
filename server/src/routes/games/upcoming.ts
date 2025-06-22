import { Hono } from "hono";
import { fetchIGDB } from "../../services/igdb";
import { supabase } from "../../lib/supabase";

export const upcomingRoutes = new Hono();

// upcoming games
upcomingRoutes.get("/", async (c) => {
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
      hypes > 30 &
      first_release_date > ${Math.floor(Date.now() / 1000)};
    sort first_release_date asc;
    limit 500;
    `;

    const upcoming = await fetchIGDB("games", body);
    return c.json(upcoming);
  } catch (err) {
    console.error("Error fetching popular games:", err);
    return c.json({ error: "Failed to fetch popular games" }, 500);
  }
});

upcomingRoutes.get("/all", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1", 10);
    const pageSize = parseInt(c.req.query("limit") || "60", 10);
    const offset = (page - 1) * pageSize;

    const allowedSorts = ["popularity", "name", "first_release_date"];
    const sort1 = c.req.query("sort1") || "popularity";
    const sort1Order = c.req.query("order1") === "asc" ? "asc" : "desc";

    // fallback to safe sort if invalid
    const sortKey = allowedSorts.includes(sort1) ? sort1 : "popularity";

    const { count } = await supabase
      .from("upcoming")
      .select("*", { count: "exact", head: true });

    const query = supabase
      .from("upcoming")
      .select("*")
      .order(sortKey, { ascending: sort1Order === "asc" })
      .range(offset, offset + pageSize - 1);

    const { data: games, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      return c.json({ error: "Failed to fetch games from database" }, 500);
    }

    const totalPages = Math.ceil((count ?? 0) / pageSize);

    return c.json({
      page,
      totalCount: count || 0,
      totalPages,
      pageSize,
      sort: sortKey,
      order: sort1Order,
      games,
    });
  } catch (err) {
    console.error("Error querying games:", err);
    return c.json({ error: "Unexpected error" }, 500);
  }
});

// TODO: schedule this endpoint every x hours
upcomingRoutes.get("/get", async (c) => {
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
      status: "upcoming",
    }));

    const { error } = await supabase
      .from("upcoming")
      .upsert(formattedGames, { onConflict: "id" });

    if (error) {
      console.error("Supabase insert error (upcoming):", error);
      return c.json({ error: "Failed to save upcoming games" }, 500);
    }

    return c.json(upcomingGames);
  } catch (err) {
    console.error("Error fetching upcoming games:", err);
    return c.json({ error: "Failed to fetch upcoming games" }, 500);
  }
});
