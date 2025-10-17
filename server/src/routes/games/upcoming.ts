import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const upcomingRoutes = new Hono();

// Upcoming games
upcomingRoutes.get("/", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "30");
    const now = new Date();
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

    // Fetch by popularity to get most anticipated upcoming games
    const { data: upcoming, error } = await supabase
      .from("games")
      .select(
        "id, name, slug, cover_id, game_type, igdb_total_rating, igdb_total_rating_count, popularity, first_release_date, official_release_date, release_date_human, is_released"
      )
      .eq("is_released", false)
      .eq("is_nsfw", false)
      .not("cover_id", "is", null)
      .not("official_release_date", "is", null)
      .gte("official_release_date", now.toISOString())
      .lte("official_release_date", fourteenDaysFromNow.toISOString())
      .not("game_type", "in", "(9, 11, 14)")
      .order("popularity", { ascending: false }) // Fetch popular games
      .limit(limit);

    if (error) throw error;

    // Sort by release date chronologically (soonest first)
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

    const allowedSorts = [
      "popularity",
      "name",
      "first_release_date",
      "official_release_date",
    ];
    const sort1 = c.req.query("sort1") || "popularity";
    const sort1Order = c.req.query("order1") === "asc" ? "asc" : "desc";
    const sortKey = allowedSorts.includes(sort1) ? sort1 : "popularity";

    // Get total count
    const { count } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true })
      .eq("is_released", false)
      .eq("is_nsfw", false)
      .gt("first_release_date", now);

    // Get paginated results
    const { data: games, error } = await supabase
      .from("games")
      .select(
        "id, name, slug, cover_id, igdb_total_rating, igdb_total_rating_count, popularity, first_release_date, official_release_date, release_date_human, is_released"
      )
      .eq("is_released", false)
      .eq("is_nsfw", false)
      .gt("first_release_date", now)
      .order(sortKey, { ascending: sort1Order === "asc" })
      .range(offset, offset + pageSize - 1);

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
