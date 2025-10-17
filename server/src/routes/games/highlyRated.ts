import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const highlyRatedRoutes = new Hono();

// Highly rated games
highlyRatedRoutes.get("/", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "30");
    const minRatingCount = parseInt(c.req.query("min_rating_count") || "10");
    const minRating = parseFloat(c.req.query("min_rating") || "75");

    const { data: highlyRated, error } = await supabase
      .from("games")
      .select(
        "id, name, slug, cover_id, igdb_total_rating, igdb_total_rating_count, popularity, first_release_date, official_release_date, release_date_human, is_released"
      )
      .eq("is_released", true)
      .eq("is_nsfw", false) // Replaces erotic game filtering
      .not("cover_id", "is", null)
      .not("igdb_total_rating", "is", null)
      .not("igdb_total_rating_count", "is", null)
      .gte("igdb_total_rating", minRating)
      .gte("igdb_total_rating_count", minRatingCount)
      .not("game_type", "in", "(11, 14)")
      .order("igdb_total_rating_count", { ascending: false })
      .order("igdb_total_rating", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return c.json(highlyRated || []);
  } catch (err) {
    console.error("Error fetching highly rated games:", err);
    return c.json({ error: "Failed to fetch highly rated games" }, 500);
  }
});
