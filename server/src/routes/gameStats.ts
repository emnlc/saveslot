import { Hono } from "hono";
import { supabase } from "../lib/supabase";

export const gameStatsRoutes = new Hono();

// Get stats for a game
gameStatsRoutes.get("/:game_id/stats", async (c) => {
  try {
    const gameId = parseInt(c.req.param("game_id"));

    // number of times game has been played
    const { count: playCount, error: playError } = await supabase
      .from("user_games")
      .select("*", { count: "exact", head: true })
      .eq("game_id", gameId)
      .not("status", "in", "(wishlist,backlog)"); // no wishlist/backlog

    if (playError) throw playError;

    // number of lists with this game
    const { count: listCount, error: listError } = await supabase
      .from("game_list_items")
      .select("*", { count: "exact", head: true })
      .eq("game_id", gameId);

    if (listError) throw listError;

    // like count
    const { count: likeCount, error: likeError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("game_id", gameId)
      .eq("target_type", "game");

    if (likeError) throw likeError;

    return c.json({
      play_count: playCount ?? 0,
      list_count: listCount ?? 0,
      like_count: likeCount ?? 0,
    });
  } catch (err) {
    console.error("Error fetching game stats:", err);
    return c.json({ error: "Failed to fetch game stats" }, 500);
  }
});
