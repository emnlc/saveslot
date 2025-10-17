import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const userGamesRoutes = new Hono();

type GameStatus =
  | "completed"
  | "dropped"
  | "playing"
  | "backlog"
  | "played"
  | "wishlist"
  | "abandoned";

const VALID_STATUSES: GameStatus[] = [
  "completed",
  "dropped",
  "playing",
  "backlog",
  "played",
  "wishlist",
  "abandoned",
];

userGamesRoutes.get("/user/:user_id", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data: userGames, error: ugError } = await supabase
      .from("user_games")
      .select("id, user_id, game_id, status, created_at, last_updated")
      .eq("user_id", userId)
      .order("last_updated", { ascending: false });

    if (ugError) throw ugError;
    if (!userGames || userGames.length === 0) return c.json([]);

    const gameIds = userGames.map((ug) => ug.game_id);

    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, name, cover_id, slug, is_nsfw")
      .in("id", gameIds);

    if (gamesError) throw gamesError;

    const gameMap = new Map(games?.map((game) => [game.id, game]) || []);

    const result = userGames
      .map((ug) => {
        const game = gameMap.get(ug.game_id);
        if (!game) return null;
        return {
          ...ug,
          game,
        };
      })
      .filter(Boolean);

    return c.json(result);
  } catch (err) {
    console.error("Error fetching user games:", err);
    return c.json({ error: "Failed to fetch user games" }, 500);
  }
});

userGamesRoutes.get("/user/:user_id/game/:game_id", async (c) => {
  try {
    const userId = c.req.param("user_id");
    const gameId = parseInt(c.req.param("game_id"));

    const { data, error } = await supabase
      .from("user_games")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    return c.json(data || null);
  } catch (err) {
    console.error("Error fetching game status:", err);
    return c.json({ error: "Failed to fetch game status" }, 500);
  }
});

userGamesRoutes.get("/user/:user_id/by-status/:status", async (c) => {
  try {
    const userId = c.req.param("user_id");
    const status = c.req.param("status") as GameStatus;
    const limit = c.req.query("limit")
      ? parseInt(c.req.query("limit")!)
      : undefined;

    if (!VALID_STATUSES.includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    let query = supabase
      .from("user_games")
      .select("id, user_id, game_id, status, created_at, last_updated")
      .eq("user_id", userId)
      .eq("status", status)
      .order("last_updated", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data: userGames, error: ugError } = await query;

    if (ugError) throw ugError;
    if (!userGames || userGames.length === 0) return c.json([]);

    const gameIds = userGames.map((ug) => ug.game_id);

    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, name, cover_id, slug, is_nsfw")
      .in("id", gameIds);

    if (gamesError) throw gamesError;

    const gameMap = new Map(games?.map((game) => [game.id, game]) || []);

    const result = userGames
      .map((ug) => {
        const game = gameMap.get(ug.game_id);
        if (!game) return null;
        return {
          ...ug,
          game,
        };
      })
      .filter(Boolean);

    return c.json(result);
  } catch (err) {
    console.error("Error fetching games by status:", err);
    return c.json({ error: "Failed to fetch games by status" }, 500);
  }
});

userGamesRoutes.put("/", async (c) => {
  try {
    const { user_id, game_id, status } = await c.req.json();

    if (!user_id || !game_id || !status) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (!VALID_STATUSES.includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const { data, error } = await supabase
      .from("user_games")
      .upsert(
        {
          user_id,
          game_id: parseInt(game_id),
          status,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: "user_id,game_id",
        }
      )
      .select()
      .single();

    if (error) throw error;

    return c.json(data, 200);
  } catch (err) {
    console.error("Error updating game status:", err);
    return c.json({ error: "Failed to update game status" }, 500);
  }
});

userGamesRoutes.delete("/user/:user_id/game/:game_id", async (c) => {
  try {
    const userId = c.req.param("user_id");
    const gameId = parseInt(c.req.param("game_id"));

    const { error } = await supabase
      .from("user_games")
      .delete()
      .eq("user_id", userId)
      .eq("game_id", gameId);

    if (error) throw error;

    return c.json({ success: true });
  } catch (err) {
    console.error("Error removing game:", err);
    return c.json({ error: "Failed to remove game" }, 500);
  }
});
