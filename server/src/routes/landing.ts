import { Hono } from "hono";
import { supabase } from "../lib/supabase";

export const landingRoutes = new Hono();

// Get top reviews (most liked)
landingRoutes.get("/top-reviews", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "6");

    // Get all non-draft reviews with text
    const { data: reviews, error: reviewsError } = await supabase
      .from("game_logs")
      .select(
        `
        *,
        profile:profiles(id, username, display_name, avatar_url),
        game:games(id, name, cover_id, slug)
      `
      )
      .eq("is_draft", false)
      .not("review_text", "is", null)
      .neq("review_text", "")
      .order("created_at", { ascending: false })
      .limit(100); // Get more to sort by likes

    if (reviewsError) throw reviewsError;

    if (!reviews || reviews.length === 0) {
      return c.json([]);
    }

    // Get like counts for these reviews
    const reviewIds = reviews.map((r) => r.id);
    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("review_id")
      .eq("target_type", "review")
      .in("review_id", reviewIds);

    if (likesError) throw likesError;

    // Count likes per review
    const likeCountMap: { [key: string]: number } = {};
    likes?.forEach((like) => {
      likeCountMap[like.review_id] = (likeCountMap[like.review_id] || 0) + 1;
    });

    // Sort by like count and limit
    const topReviews = reviews
      .map((review) => ({
        ...review,
        like_count: likeCountMap[review.id] || 0,
      }))
      .sort((a, b) => b.like_count - a.like_count)
      .slice(0, limit);

    return c.json(topReviews);
  } catch (err) {
    console.error("Error fetching top reviews:", err);
    return c.json({ error: "Failed to fetch top reviews" }, 500);
  }
});

// Get recently released games
landingRoutes.get("/recently-released", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "6");

    const { data: games, error } = await supabase
      .from("games")
      .select("*")
      .eq("released", true)
      .not("first_release_date", "is", null)
      .not("cover_id", "is", null)
      .order("first_release_date", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return c.json(games || []);
  } catch (err) {
    console.error("Error fetching recently released games:", err);
    return c.json({ error: "Failed to fetch recently released games" }, 500);
  }
});

// Get upcoming games
landingRoutes.get("/upcoming", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "6");
    const now = new Date().toISOString();

    const { data: games, error } = await supabase
      .from("games")
      .select("*")
      .eq("released", false)
      .not("first_release_date", "is", null)
      .not("cover_id", "is", null)
      .gt("first_release_date", now)
      .order("first_release_date", { ascending: true })
      .limit(limit);

    if (error) throw error;

    return c.json(games || []);
  } catch (err) {
    console.error("Error fetching upcoming games:", err);
    return c.json({ error: "Failed to fetch upcoming games" }, 500);
  }
});

// Get most rated games
landingRoutes.get("/most-rated", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "6");

    // Count reviews per game
    const { data: logCounts, error: countError } = await supabase
      .from("game_logs")
      .select("game_id")
      .eq("is_draft", false);

    if (countError) throw countError;

    // Count occurrences
    const gameCountMap: { [key: number]: number } = {};
    logCounts?.forEach((log) => {
      gameCountMap[log.game_id] = (gameCountMap[log.game_id] || 0) + 1;
    });

    // Sort by count
    const topGameIds = Object.entries(gameCountMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => parseInt(id));

    if (topGameIds.length === 0) {
      return c.json([]);
    }

    // Get game details
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .in("id", topGameIds);

    if (gamesError) throw gamesError;

    // Maintain order and add review count
    const orderedGames = topGameIds
      .map((id) => {
        const game = games?.find((g) => g.id === id);
        return game
          ? {
              ...game,
              review_count: gameCountMap[id],
            }
          : null;
      })
      .filter((g) => g !== null);

    return c.json(orderedGames);
  } catch (err) {
    console.error("Error fetching most rated games:", err);
    return c.json({ error: "Failed to fetch most rated games" }, 500);
  }
});

landingRoutes.get("/featured-game", async (c) => {
  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: game, error } = await supabase
      .from("games")
      .select("*")
      .eq("released", true)
      .not("first_release_date", "is", null)
      .not("cover_id", "is", null)
      .not("popularity", "is", null)
      .gte("first_release_date", thirtyDaysAgo.toISOString())
      .order("popularity", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return c.json(game);
  } catch (err) {
    console.error("Error fetching featured game:", err);
    return c.json({ error: "Failed to fetch featured game" }, 500);
  }
});

landingRoutes.get("/popular-lists", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "6");

    // Get public lists with item counts
    const { data: lists, error: listsError } = await supabase
      .from("game_lists")
      .select(
        `
        *,
        profile:profiles(id, username, display_name, avatar_url)
      `
      )
      .eq("is_public", true)
      .order("last_updated", { ascending: false })
      .limit(100); // Get more to count items

    if (listsError) throw listsError;

    if (!lists || lists.length === 0) {
      return c.json([]);
    }

    const listIds = lists.map((list) => list.id);

    // Get item counts for these lists
    const { data: items, error: itemsError } = await supabase
      .from("game_list_items")
      .select("list_id, game_id, rank")
      .in("list_id", listIds)
      .order("rank", { ascending: true });

    if (itemsError) throw itemsError;

    // Get like counts for these lists
    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("list_id")
      .eq("target_type", "list")
      .in("list_id", listIds);

    if (likesError) throw likesError;

    // Count items and likes per list
    const listData: {
      [key: string]: { count: number; gameIds: number[]; likeCount: number };
    } = {};

    items?.forEach((item) => {
      if (!listData[item.list_id]) {
        listData[item.list_id] = { count: 0, gameIds: [], likeCount: 0 };
      }
      listData[item.list_id].count++;
      if (listData[item.list_id].gameIds.length < 5) {
        listData[item.list_id].gameIds.push(item.game_id);
      }
    });

    likes?.forEach((like) => {
      if (listData[like.list_id]) {
        listData[like.list_id].likeCount++;
      }
    });

    // Get game details for all games we need
    const allGameIds = Object.values(listData).flatMap((data) => data.gameIds);
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, name, cover_id, slug")
      .in("id", allGameIds);

    if (gamesError) throw gamesError;

    // Create game lookup map
    const gameMap: { [key: number]: any } = {};
    games?.forEach((game) => {
      gameMap[game.id] = game;
    });

    // Combine everything
    const popularLists = lists
      .filter((list) => listData[list.id] && listData[list.id].count > 0)
      .map((list) => ({
        ...list,
        item_count: listData[list.id].count,
        like_count: listData[list.id].likeCount,
        top_games: listData[list.id].gameIds
          .map((gameId) => gameMap[gameId])
          .filter((game) => game !== undefined),
      }))
      .sort((a, b) => b.item_count - a.item_count)
      .slice(0, limit);

    return c.json(popularLists);
  } catch (err) {
    console.error("Error fetching popular lists:", err);
    return c.json({ error: "Failed to fetch popular lists" }, 500);
  }
});
