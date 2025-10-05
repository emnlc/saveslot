import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const upcomingRoutes = new Hono();

// upcoming games
upcomingRoutes.get("/", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "30");
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 14);

    const { data: upcoming, error } = await supabase
      .from("games")
      .select(
        "id, name, slug, cover_id, game_type, igdb_total_rating, igdb_total_rating_count, popularity, first_release_date, official_release_date, release_date_human"
      )
      .eq("released", false)
      .not("themes", "cs", "{42}")
      .not("cover_id", "is", null)
      .not("official_release_date", "is", null)
      .gte("official_release_date", now.toISOString())
      .lte("official_release_date", thirtyDaysFromNow.toISOString())
      .not("game_type", "in", "(9, 11,14)")
      .order("popularity", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const sortedUpcoming = (upcoming || []).sort(
      (a, b) =>
        new Date(a.official_release_date).getTime() -
        new Date(b.official_release_date).getTime()
    );

    return c.json(sortedUpcoming);
  } catch (err) {
    console.error("Error fetching upcoming games:", err);
    return c.json({ error: "Failed to fetch upcoming games" }, 500);
  }
});

upcomingRoutes.get("/all", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1", 10);
    const pageSize = parseInt(c.req.query("limit") || "60", 10);
    const offset = (page - 1) * pageSize;

    const now = new Date().toISOString();

    const allowedSorts = ["popularity", "name", "first_release_date"];
    const sort1 = c.req.query("sort1") || "popularity";
    const sort1Order = c.req.query("order1") === "asc" ? "asc" : "desc";

    const sortKey = allowedSorts.includes(sort1) ? sort1 : "popularity";

    const { count } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true })
      .eq("released", false);

    const query = supabase
      .from("games")
      .select(
        "id, name, slug, cover_id, igdb_total_rating, igdb_total_rating_count, popularity, first_release_date, official_release_date, release_date_human, released"
      )
      .not("themes", "cs", "{42}")
      .eq("released", false)
      .gt("first_release_date", now)
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
