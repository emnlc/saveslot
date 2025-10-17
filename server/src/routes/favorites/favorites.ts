import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const favoritesRoutes = new Hono();

favoritesRoutes.get("/user/:user_id", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data, error } = await supabase
      .from("favorite_games")
      .select(
        `
        id,
        game_id,
        rank,
        created_at,
        games:game_id (
          id,
          name,
          slug,
          cover_id,
          official_release_date
        )
      `
      )
      .eq("user_id", userId)
      .order("rank", { ascending: true });

    if (error) throw error;

    return c.json(data || []);
  } catch (err) {
    console.error("Error fetching favorite games:", err);
    return c.json({ error: "Failed to fetch favorite games" }, 500);
  }
});

favoritesRoutes.post("/", async (c) => {
  try {
    const { user_id, game_id, rank } = await c.req.json();

    if (!rank || rank < 1 || rank > 10) {
      return c.json({ error: "Rank must be between 1 and 10" }, 400);
    }

    const { data, error } = await supabase
      .from("favorite_games")
      .insert({
        user_id,
        game_id,
        rank,
      })
      .select()
      .single();

    if (error) throw error;

    return c.json(data);
  } catch (err) {
    console.error("Error adding favorite game:", err);
    return c.json({ error: "Failed to add favorite game" }, 500);
  }
});

favoritesRoutes.delete("/:user_id/:game_id", async (c) => {
  try {
    const userId = c.req.param("user_id");
    const gameId = parseInt(c.req.param("game_id"));

    const { error } = await supabase
      .from("favorite_games")
      .delete()
      .eq("user_id", userId)
      .eq("game_id", gameId);

    if (error) throw error;

    return c.json({ success: true });
  } catch (err) {
    console.error("Error removing favorite game:", err);
    return c.json({ error: "Failed to remove favorite game" }, 500);
  }
});

favoritesRoutes.patch("/reorder", async (c) => {
  try {
    const { user_id, favorites } = await c.req.json();

    if (!Array.isArray(favorites) || favorites.length === 0) {
      return c.json({ error: "Invalid favorites data" }, 400);
    }

    const { error } = await supabase.rpc("reorder_favorite_games", {
      p_user_id: user_id,
      p_favorites: favorites,
    });

    if (error) throw error;

    return c.json({ success: true });
  } catch (err) {
    console.error("Error reordering favorites:", err);
    return c.json({ error: "Failed to reorder favorites" }, 500);
  }
});
