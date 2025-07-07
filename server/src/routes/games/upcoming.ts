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

    const now = new Date().toISOString();

    const allowedSorts = ["popularity", "name", "first_release_date"];
    const sort1 = c.req.query("sort1") || "popularity";
    const sort1Order = c.req.query("order1") === "asc" ? "asc" : "desc";

    // fallback to safe sort if invalid
    const sortKey = allowedSorts.includes(sort1) ? sort1 : "popularity";

    const { count } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true })
      .eq("released", false);

    const query = supabase
      .from("games")
      .select("*")
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
