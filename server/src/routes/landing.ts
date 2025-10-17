import { Hono } from "hono";
import { supabase } from "../lib/supabase";

export const landingRoutes = new Hono();

const gameData =
  "id, name, slug, cover_id, game_type, igdb_total_rating, igdb_total_rating_count, popularity, first_release_date, official_release_date, release_date_human";

landingRoutes.get("/top-reviews", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "6");

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
      .limit(100);

    if (reviewsError) throw reviewsError;
    if (!reviews || reviews.length === 0) return c.json([]);

    const reviewIds = reviews.map((r) => r.id);
    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("review_id")
      .eq("target_type", "review")
      .in("review_id", reviewIds);

    if (likesError) throw likesError;

    const likeCountMap: { [key: string]: number } = {};
    likes?.forEach((like) => {
      likeCountMap[like.review_id] = (likeCountMap[like.review_id] || 0) + 1;
    });

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

landingRoutes.get("/recently-released", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "6");
    const days = parseInt(c.req.query("days") || "7");

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const { data: games, error } = await supabase
      .from("games")
      .select(gameData)
      .eq("is_released", true)
      .eq("is_nsfw", false)
      .not("official_release_date", "is", null)
      .not("game_type", "in", "(3, 1)")
      .not("cover_id", "is", null)
      .lte("official_release_date", new Date().toISOString())
      .gte("official_release_date", daysAgo.toISOString())
      .order("popularity", { ascending: false })
      .order("official_release_date", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const sortedGames =
      games?.sort((a, b) => {
        const dateA = new Date(a.official_release_date).getTime();
        const dateB = new Date(b.official_release_date).getTime();
        return dateB - dateA;
      }) || [];

    return c.json(sortedGames);
  } catch (err) {
    console.error("Error fetching recently released games:", err);
    return c.json({ error: "Failed to fetch recently released games" }, 500);
  }
});

landingRoutes.get("/upcoming", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "6");

    const now = new Date();
    const dateRange = new Date();
    dateRange.setDate(dateRange.getDate() + 14);

    const { data: games, error } = await supabase
      .from("games")
      .select(gameData)
      .eq("is_released", false)
      .eq("is_nsfw", false)
      .not("official_release_date", "is", null)
      .not("cover_id", "is", null)
      .gte("official_release_date", now.toISOString())
      .lte("official_release_date", dateRange.toISOString())
      .order("popularity", { ascending: false })
      .order("official_release_date", { ascending: true })
      .limit(limit);

    if (error) throw error;

    const upcomingGames = (games || []).sort(
      (a, b) =>
        new Date(a.official_release_date).getTime() -
        new Date(b.official_release_date).getTime()
    );

    return c.json(upcomingGames || []);
  } catch (err) {
    console.error("Error fetching upcoming games:", err);
    return c.json({ error: "Failed to fetch upcoming games" }, 500);
  }
});

landingRoutes.get("/most-rated", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "6");

    const { data: logCounts, error: countError } = await supabase
      .from("game_logs")
      .select("game_id")
      .eq("is_draft", false);

    if (countError) throw countError;

    const gameCountMap: { [key: number]: number } = {};
    logCounts?.forEach((log) => {
      gameCountMap[log.game_id] = (gameCountMap[log.game_id] || 0) + 1;
    });

    const topGameIds = Object.entries(gameCountMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => parseInt(id));

    if (topGameIds.length === 0) return c.json([]);

    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .eq("is_nsfw", false)
      .in("id", topGameIds);

    if (gamesError) throw gamesError;

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
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data: game, error } = await supabase
      .from("games")
      .select("id, name, slug, cover_id, release_date_human")
      .eq("is_released", true)
      .eq("is_nsfw", false)
      .not("first_release_date", "is", null)
      .not("cover_id", "is", null)
      .not("popularity", "is", null)
      .gte("first_release_date", twoWeeksAgo.toISOString())
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
      .limit(100);

    if (listsError) throw listsError;
    if (!lists || lists.length === 0) return c.json([]);

    const listIds = lists.map((list) => list.id);

    const { data: items, error: itemsError } = await supabase
      .from("game_list_items")
      .select("list_id, game_id, rank")
      .in("list_id", listIds)
      .order("rank", { ascending: true });

    if (itemsError) throw itemsError;

    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("list_id")
      .eq("target_type", "list")
      .in("list_id", listIds);

    if (likesError) throw likesError;

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

    const allGameIds = Object.values(listData).flatMap((data) => data.gameIds);
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, name, cover_id, slug")
      .in("id", allGameIds);

    if (gamesError) throw gamesError;

    const gameMap: { [key: number]: any } = {};
    games?.forEach((game) => {
      gameMap[game.id] = game;
    });

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
