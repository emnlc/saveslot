import { Hono } from "hono";
import { supabase } from "../lib/supabase";

export const activityRoutes = new Hono();

activityRoutes.get("/user/:userId", async (c) => {
  const userId = c.req.param("userId");
  const days = parseInt(c.req.query("days") || "14");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  try {
    const { data: reviews, error: reviewsError } = await supabase
      .from("game_logs")
      .select(
        `
        id,
        created_at,
        review_text,
        rating,
        contains_spoilers,
        game_id,
        games (
          id,
          name,
          cover_id,
          slug
        )
      `
      )
      .eq("user_id", userId)
      .not("review_text", "is", null)
      .eq("is_draft", false)
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false });

    if (reviewsError) throw reviewsError;

    const { data: logStatuses, error: logStatusesError } = await supabase
      .from("game_logs")
      .select(
        `
        id,
        created_at,
        game_status,
        game_id,
        games (
          id,
          name,
          cover_id,
          slug
        )
      `
      )
      .eq("user_id", userId)
      .not("game_status", "is", null)
      .is("review_text", null)
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false });

    if (logStatusesError) throw logStatusesError;

    const { data: userGameStatuses, error: userGameStatusesError } =
      await supabase
        .from("user_games")
        .select(
          `
        id,
        created_at,
        status,
        game_id,
        games (
          id,
          name,
          cover_id,
          slug
        )
      `
        )
        .eq("user_id", userId)
        .gte("created_at", cutoffDate.toISOString())
        .order("created_at", { ascending: false });

    if (userGameStatusesError) throw userGameStatusesError;

    const { data: lists, error: listsError } = await supabase
      .from("game_lists")
      .select(
        `
        id,
        created_at,
        name,
        slug,
        is_public,
        game_list_items (count)
      `
      )
      .eq("user_id", userId)
      .eq("is_public", true)
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false });

    if (listsError) throw listsError;

    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select(
        `
        id,
        liked_at,
        target_type,
        game_id,
        list_id,
        review_id,
        games (
          id,
          name,
          cover_id,
          slug
        )
      `
      )
      .eq("user_id", userId)
      .gte("liked_at", cutoffDate.toISOString())
      .order("liked_at", { ascending: false });

    if (likesError) throw likesError;

    const reviewIds =
      likes
        ?.filter((l) => l.target_type === "review")
        .map((l) => l.review_id) || [];
    const listIds =
      likes?.filter((l) => l.target_type === "list").map((l) => l.list_id) ||
      [];

    let likedReviews: any[] = [];
    let likedLists: any[] = [];

    if (reviewIds.length > 0) {
      const { data } = await supabase
        .from("game_logs")
        .select(
          `
          id,
          game_id,
          games (
            id,
            name,
            cover_id,
            slug
          )
        `
        )
        .in("id", reviewIds);
      likedReviews = data || [];
    }

    if (listIds.length > 0) {
      const { data, error } = await supabase
        .from("game_lists")
        .select(
          `
      id, 
      name, 
      slug,
      user_id,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `
        )
        .in("id", listIds);

      if (error) {
        console.error("Error fetching liked lists:", error);
      }

      likedLists = (data || []).map((list) => ({
        ...list,
        users: list.profiles,
      }));
    }

    const activities = [
      ...(reviews || []).map((r) => ({
        id: `review-${r.id}`,
        type: "review",
        timestamp: r.created_at,
        data: {
          reviewId: r.id,
          rating: r.rating,
          reviewText: r.review_text,
          containsSpoilers: r.contains_spoilers,
          game: r.games,
        },
      })),

      ...(logStatuses || []).map((s) => ({
        id: `log-status-${s.id}`,
        type: "status",
        timestamp: s.created_at,
        data: {
          status: s.game_status,
          game: s.games,
        },
      })),

      ...(userGameStatuses || []).map((s) => ({
        id: `user-game-status-${s.id}`,
        type: "status",
        timestamp: s.created_at,
        data: {
          status: s.status,
          game: s.games,
        },
      })),

      ...(lists || []).map((l) => ({
        id: `list-${l.id}`,
        type: "list",
        timestamp: l.created_at,
        data: {
          listId: l.id,
          name: l.name,
          slug: l.slug,
          gameCount: l.game_list_items[0]?.count || 0,
        },
      })),

      ...(likes || []).map((l) => {
        const likeData: any = {
          targetType: l.target_type,
        };

        if (l.target_type === "game") {
          likeData.game = l.games;
        } else if (l.target_type === "review") {
          const review = likedReviews.find((r) => r.id === l.review_id);
          likeData.review = review;
          likeData.game = review?.games;
        } else if (l.target_type === "list") {
          const list = likedLists.find((lst) => lst.id === l.list_id);
          likeData.list = list;
        }

        return {
          id: `like-${l.id}`,
          type: "like",
          timestamp: l.liked_at,
          data: likeData,
        };
      }),
    ];

    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json({ activities });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return c.json({ error: "Failed to fetch activity" }, 500);
  }
});
