import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const likesRoutes = new Hono();

likesRoutes.get("/user/:user_id", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data, error } = await supabase
      .from("likes")
      .select("id, user_id, target_type, game_id, list_id, review_id, liked_at")
      .eq("user_id", userId)
      .order("liked_at", { ascending: false });

    if (error) throw error;

    return c.json(data || []);
  } catch (err) {
    console.error("Error fetching user likes:", err);
    return c.json({ error: "Failed to fetch likes" }, 500);
  }
});

likesRoutes.get("/user/:user_id/games", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("id, liked_at, game_id")
      .eq("user_id", userId)
      .not("game_id", "is", null)
      .order("liked_at", { ascending: false });

    if (likesError) throw likesError;
    if (!likes || likes.length === 0) return c.json([]);

    const gameIds = likes.map((like) => like.game_id);

    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, name, cover_id, slug, is_nsfw")
      .in("id", gameIds)
      .eq("is_nsfw", false);

    if (gamesError) throw gamesError;

    const gameMap = new Map(games?.map((game) => [game.id, game]) || []);

    const result = likes
      .map((like) => {
        const game = gameMap.get(like.game_id!);
        if (!game) return null;
        return {
          ...game,
          liked_at: like.liked_at,
          like_id: like.id,
        };
      })
      .filter(Boolean);

    return c.json(result);
  } catch (err) {
    console.error("Error fetching liked games:", err);
    return c.json({ error: "Failed to fetch liked games" }, 500);
  }
});

likesRoutes.get("/user/:user_id/lists", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("id, liked_at, list_id")
      .eq("user_id", userId)
      .not("list_id", "is", null)
      .order("liked_at", { ascending: false });

    if (likesError) throw likesError;
    if (!likes || likes.length === 0) return c.json([]);

    const listIds = likes.map((like) => like.list_id);

    const { data: lists, error: listsError } = await supabase
      .from("game_lists")
      .select("id, user_id, name, slug, created_at, is_public")
      .in("id", listIds);

    if (listsError) throw listsError;

    const authorIds = Array.from(
      new Set(lists?.map((list) => list.user_id) || [])
    );

    const { data: authors } = await supabase
      .from("profiles")
      .select("id, username, display_name, bio, avatar_url")
      .in("id", authorIds);

    const { data: allItems } = await supabase
      .from("game_list_items")
      .select("list_id, game_id, rank")
      .in("list_id", listIds)
      .order("rank", { ascending: true });

    const itemsByList: Record<string, any[]> = {};
    allItems?.forEach((item) => {
      if (!itemsByList[item.list_id]) {
        itemsByList[item.list_id] = [];
      }
      if (itemsByList[item.list_id].length < 10) {
        itemsByList[item.list_id].push(item);
      }
    });

    const allGameIds = Object.values(itemsByList)
      .flat()
      .map((item) => item.game_id);

    const { data: games } = await supabase
      .from("games")
      .select("id, name, cover_id, slug, is_nsfw")
      .in("id", allGameIds);

    const gameMap = new Map(games?.map((game) => [game.id, game]) || []);

    const enrichedLists = likes
      .map((like) => {
        const list = lists?.find((l) => l.id === like.list_id);
        if (!list) return null;

        const items = itemsByList[list.id] || [];
        const previewGames = items
          .map((item) => gameMap.get(item.game_id))
          .filter((game) => game && !game.is_nsfw);

        const author = authors?.find((a) => a.id === list.user_id);

        return {
          ...list,
          liked_at: like.liked_at,
          like_id: like.id,
          game_count: items.length,
          preview_games: previewGames,
          author,
        };
      })
      .filter(Boolean);

    return c.json(enrichedLists);
  } catch (err) {
    console.error("Error fetching liked lists:", err);
    return c.json({ error: "Failed to fetch liked lists" }, 500);
  }
});

likesRoutes.get("/user/:user_id/reviews", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("id, liked_at, review_id")
      .eq("user_id", userId)
      .not("review_id", "is", null)
      .order("liked_at", { ascending: false });

    if (likesError) throw likesError;
    if (!likes || likes.length === 0) return c.json([]);

    const reviewIds = likes.map((like) => like.review_id);

    const { data: reviews, error: reviewsError } = await supabase
      .from("game_logs")
      .select("*")
      .in("id", reviewIds)
      .eq("is_draft", false);

    if (reviewsError) throw reviewsError;

    const gameIds = Array.from(new Set(reviews?.map((r) => r.game_id) || []));
    const userIds = Array.from(new Set(reviews?.map((r) => r.user_id) || []));

    const [gamesRes, profilesRes] = await Promise.all([
      supabase
        .from("games")
        .select("id, name, cover_id, slug")
        .in("id", gameIds),
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", userIds),
    ]);

    const gameMap = new Map(gamesRes.data?.map((g) => [g.id, g]) || []);
    const profileMap = new Map(profilesRes.data?.map((p) => [p.id, p]) || []);

    const result = likes
      .map((like) => {
        const review = reviews?.find((r) => r.id === like.review_id);
        if (!review) return null;

        return {
          ...review,
          liked_at: like.liked_at,
          like_id: like.id,
          game: gameMap.get(review.game_id),
          profile: profileMap.get(review.user_id),
        };
      })
      .filter(Boolean);

    return c.json(result);
  } catch (err) {
    console.error("Error fetching liked reviews:", err);
    return c.json({ error: "Failed to fetch liked reviews" }, 500);
  }
});

likesRoutes.get("/count/:target_type/:target_id", async (c) => {
  try {
    const targetType = c.req.param("target_type") as "game" | "list" | "review";
    const targetId = c.req.param("target_id");

    let query = supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("target_type", targetType);

    if (targetType === "game") {
      query = query.eq("game_id", parseInt(targetId));
    } else if (targetType === "list") {
      query = query.eq("list_id", targetId);
    } else if (targetType === "review") {
      query = query.eq("review_id", targetId);
    }

    const { count, error } = await query;

    if (error) throw error;

    return c.json({ count: count || 0 });
  } catch (err) {
    console.error("Error fetching like count:", err);
    return c.json({ error: "Failed to fetch like count" }, 500);
  }
});

likesRoutes.post("/", async (c) => {
  try {
    const { user_id, target_type, target_id } = await c.req.json();

    if (!user_id || !target_type || !target_id) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const insertData: any = {
      user_id,
      target_type,
    };

    if (target_type === "game") {
      insertData.game_id = parseInt(target_id);
    } else if (target_type === "list") {
      insertData.list_id = target_id;
    } else if (target_type === "review") {
      insertData.review_id = target_id;
    }

    const { data, error } = await supabase
      .from("likes")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return c.json(data, 201);
  } catch (err) {
    console.error("Error creating like:", err);
    return c.json({ error: "Failed to create like" }, 500);
  }
});

likesRoutes.delete("/:user_id/:target_type/:target_id", async (c) => {
  try {
    const userId = c.req.param("user_id");
    const targetType = c.req.param("target_type") as "game" | "list" | "review";
    const targetId = c.req.param("target_id");

    let query = supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("target_type", targetType);

    if (targetType === "game") {
      query = query.eq("game_id", parseInt(targetId));
    } else if (targetType === "list") {
      query = query.eq("list_id", targetId);
    } else if (targetType === "review") {
      query = query.eq("review_id", targetId);
    }

    const { error } = await query;

    if (error) throw error;

    return c.json({ success: true });
  } catch (err) {
    console.error("Error deleting like:", err);
    return c.json({ error: "Failed to delete like" }, 500);
  }
});
