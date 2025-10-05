import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const newlyReleasedRoutes = new Hono();

// Recently released games
newlyReleasedRoutes.get("/", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "30");
    const now = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 14);

    const { data: releases, error } = await supabase
      .from("games")
      .select(
        "id, name, slug, cover_id, igdb_total_rating, igdb_total_rating_count, popularity, first_release_date, official_release_date, release_date_human"
      )
      .eq("released", true)
      .not("official_release_date", "is", null)
      .not("cover_id", "is", null)
      .not("themes", "cs", "{42}")
      .gte("official_release_date", ninetyDaysAgo.toISOString())
      .lte("official_release_date", now.toISOString())
      .not("game_type", "in", "(3, 11,14)")
      .order("popularity", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const sortedReleases = (releases || []).sort(
      (a, b) =>
        new Date(b.official_release_date).getTime() -
        new Date(a.official_release_date).getTime()
    );

    return c.json(sortedReleases);
  } catch (err) {
    console.error("Error fetching newly released games:", err);
    return c.json({ error: "Failed to fetch newly released games" }, 500);
  }
});

newlyReleasedRoutes.get("/all", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1", 10);
    const pageSize = parseInt(c.req.query("limit") || "60", 10);
    const offset = (page - 1) * pageSize;
    const sort1 = c.req.query("sort1") || "official_release_date";
    const sort1Order = c.req.query("order1") === "asc" ? "asc" : "desc";

    const now = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get total count
    const { count } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true })
      .eq("released", true)
      .not("official_release_date", "is", null)
      .gte("official_release_date", ninetyDaysAgo.toISOString())
      .lte("official_release_date", now.toISOString())
      .not("game_type", "in", "(11,14)");

    // Get paginated results
    const { data: games, error } = await supabase
      .from("games")
      .select(
        "id, name, slug, cover_id, igdb_total_rating, igdb_total_rating_count, popularity, first_release_date, official_release_date, release_date_human, released"
      )
      .eq("released", true)
      .not("themes", "cs", "{42}")
      .not("official_release_date", "is", null)
      .gte("official_release_date", ninetyDaysAgo.toISOString())
      .lte("official_release_date", now.toISOString())
      .not("game_type", "in", "(11,14)")
      .order(sort1, { ascending: sort1Order === "asc" })
      .range(offset, offset + pageSize - 1);

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
