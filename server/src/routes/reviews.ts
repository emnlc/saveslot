import { Hono } from "hono";
import { supabase } from "../lib/supabase";
import { Filter } from "bad-words";

export const reviewsRoutes = new Hono();

const filter = new Filter();

const isValidRating = (rating: number): boolean => {
  return rating >= 0.5 && rating <= 10 && (rating * 2) % 1 === 0;
};

// Get logs for a specific game with pagination and sorting
reviewsRoutes.get("/game/:gameId", async (c) => {
  try {
    const gameId = c.req.param("gameId");
    const sortBy = c.req.query("sort_by") || "newest";
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = parseInt(c.req.query("offset") || "0");

    let orderClause: { column: string; ascending: boolean };

    switch (sortBy) {
      case "oldest":
        orderClause = { column: "created_at", ascending: true };
        break;
      case "highest_rated":
        orderClause = { column: "rating", ascending: false };
        break;
      case "lowest_rated":
        orderClause = { column: "rating", ascending: true };
        break;
      default:
        orderClause = { column: "created_at", ascending: false };
    }

    const { data: logs, error } = await supabase
      .from("game_logs")
      .select(
        `
        *,
        profile:profiles(id, username, display_name, avatar_url)
      `
      )
      .eq("game_id", gameId)
      .eq("is_draft", false)
      .order(orderClause.column, { ascending: orderClause.ascending })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return c.json(logs || []);
  } catch (err) {
    console.error("Error fetching game logs:", err);
    return c.json({ error: "Failed to fetch game logs" }, 500);
  }
});

// Get rating statistics for a game
reviewsRoutes.get("/game/:gameId/stats", async (c) => {
  try {
    const gameId = c.req.param("gameId");

    // Get all logs with ratings for basic stats
    const { data: ratingLogs, error: ratingError } = await supabase
      .from("game_logs")
      .select("rating")
      .eq("game_id", gameId)
      .eq("is_draft", false)
      .not("rating", "is", null);

    if (ratingError) throw ratingError;

    const { data: allLogs, error: allLogsError } = await supabase
      .from("game_logs")
      .select(
        "game_status, created_at, hours_played, minutes_played, platform, contains_spoilers"
      )
      .eq("game_id", gameId)
      .eq("is_draft", false);

    if (allLogsError) throw allLogsError;

    if (!ratingLogs || ratingLogs.length === 0) {
      return c.json({
        average_rating: 0,
        total_logs: 0,
        rating_distribution: {},
        completion_rate: 0,
        recent_activity: 0,
        average_completion_time: null,
      });
    }

    // Calculate basic rating stats
    const totalRating = ratingLogs.reduce((sum, log) => sum + log.rating, 0);
    const averageRating = totalRating / ratingLogs.length;

    const distribution: { [key: string]: number } = {};
    ratingLogs.forEach((log) => {
      const rating = log.rating.toString();
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    // Calculate completion rate
    const completedLogs =
      allLogs?.filter((log) => log.game_status === "completed").length || 0;
    const completionRate =
      allLogs && allLogs.length > 0
        ? (completedLogs / allLogs.length) * 100
        : 0;

    // Calculate recent activity (this month)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const recentActivity =
      allLogs?.filter((log) => {
        const logDate = new Date(log.created_at);
        return (
          logDate.getMonth() === currentMonth &&
          logDate.getFullYear() === currentYear
        );
      }).length || 0;

    // Calculate average completion time
    const completedLogsWithTime =
      allLogs?.filter(
        (log) =>
          log.game_status === "completed" &&
          (log.hours_played > 0 || log.minutes_played > 0)
      ) || [];

    let averageCompletionTime = null;
    if (completedLogsWithTime.length > 0) {
      const totalMinutes = completedLogsWithTime.reduce((sum, log) => {
        return sum + log.hours_played * 60 + log.minutes_played;
      }, 0);
      const avgMinutes = totalMinutes / completedLogsWithTime.length;
      const avgHours = Math.floor(avgMinutes / 60);
      const remainingMinutes = Math.round(avgMinutes % 60);

      if (avgHours > 0) {
        averageCompletionTime =
          remainingMinutes > 0
            ? `${avgHours}h ${remainingMinutes}m`
            : `${avgHours}h`;
      } else {
        averageCompletionTime = `${remainingMinutes}m`;
      }
    }

    return c.json({
      average_rating: Math.round(averageRating * 2) / 2,
      total_logs: ratingLogs.length,
      rating_distribution: distribution,
      completion_rate: Math.round(completionRate),
      recent_activity: recentActivity,
      average_completion_time: averageCompletionTime,
    });
  } catch (err) {
    console.error("Error fetching rating stats:", err);
    return c.json({ error: "Failed to fetch rating stats" }, 500);
  }
});

// Get logs by user
reviewsRoutes.get("/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const sortBy = c.req.query("sort_by") || "newest";
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = parseInt(c.req.query("offset") || "0");

    let query = supabase
      .from("game_logs")
      .select(
        `
        *,
        game:games(id, name, cover_id, slug)
      `
      )
      .eq("user_id", userId)
      .eq("is_draft", false);

    // Handle sorting
    switch (sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "highest_rated": // Most liked
      case "lowest_rated": // Least liked
        const { data: logs, error: logsError } = await query;
        if (logsError) throw logsError;

        // Get like counts for all logs
        const logIds = logs.map((log) => log.id);
        const { data: likeCounts, error: likesError } = await supabase
          .from("likes")
          .select("target_id")
          .eq("target_type", "review")
          .in("target_id", logIds);

        if (likesError) throw likesError;

        const likeCountMap: { [key: string]: number } = {};
        likeCounts?.forEach((like) => {
          likeCountMap[like.target_id] =
            (likeCountMap[like.target_id] || 0) + 1;
        });

        const sortedLogs = logs
          .map((log) => ({
            ...log,
            like_count: likeCountMap[log.id] || 0,
          }))
          .sort((a, b) => {
            if (sortBy === "highest_rated") {
              return b.like_count - a.like_count; // Most liked first
            } else {
              return a.like_count - b.like_count; // Least liked first
            }
          })
          .slice(offset, offset + limit - 1);

        return c.json(sortedLogs);

      default: // newest
        query = query.order("created_at", { ascending: false });
    }

    const { data: logs, error } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    return c.json(logs || []);
  } catch (err) {
    console.error("Error fetching user logs:", err);
    return c.json({ error: "Failed to fetch user logs" }, 500);
  }
});

// Create a new log
reviewsRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const {
      game_id,
      rating,
      review_text,
      game_status,
      play_start_date,
      play_end_date,
      hours_played = 0,
      minutes_played = 0,
      user_id,
      platform,
      contains_spoilers = false,
    } = body;

    // Validation
    if (!game_id || !user_id) {
      return c.json({ error: "Game ID and User ID are required" }, 400);
    }

    // Must have either a rating OR review text (or both)
    if (!rating && !review_text) {
      return c.json(
        { error: "Either a rating or review text is required" },
        400
      );
    }

    // Validate rating if provided
    if (rating && !isValidRating(rating)) {
      return c.json(
        { error: "Valid rating (0.5-10 with 0.5 increments) is required" },
        400
      );
    }

    // Content filtering
    let filteredReviewText = review_text;
    if (review_text) {
      if (review_text.length > 3000) {
        return c.json(
          { error: "Review text cannot exceed 3000 characters" },
          400
        );
      }
      filteredReviewText = filter.clean(review_text);
    }

    // Check if user has a current game status
    let finalGameStatus = game_status;
    if (!finalGameStatus) {
      const { data: userGame } = await supabase
        .from("user_games")
        .select("status")
        .eq("user_id", user_id)
        .eq("game_id", game_id)
        .single();

      if (!userGame) {
        // Create user_game entry if it doesn't exist
        await supabase.from("user_games").insert({
          user_id,
          game_id,
          status: "completed", // Default status
        });
        finalGameStatus = "completed";
      }
    }

    const { data: newLog, error } = await supabase
      .from("game_logs")
      .insert({
        user_id,
        game_id,
        rating: rating || null,
        review_text: filteredReviewText || null,
        game_status: finalGameStatus,
        play_start_date,
        play_end_date,
        hours_played,
        minutes_played,
        is_draft: false,
        platform,
        contains_spoilers,
      })
      .select()
      .single();

    if (error) throw error;

    // Delete any existing draft for this user/game
    await supabase
      .from("log_drafts")
      .delete()
      .eq("user_id", user_id)
      .eq("game_id", game_id);

    return c.json(newLog, 201);
  } catch (err) {
    console.error("Error creating log:", err);
    return c.json({ error: "Failed to create log" }, 500);
  }
});

// Update an existing log
reviewsRoutes.put("/:id", async (c) => {
  try {
    const logId = c.req.param("id");
    const body = await c.req.json();
    const {
      rating,
      review_text,
      game_status,
      play_start_date,
      play_end_date,
      hours_played,
      minutes_played,
      user_id,
      platform,
      contains_spoilers,
    } = body;

    // Verify ownership
    const { data: existingLog, error: fetchError } = await supabase
      .from("game_logs")
      .select("user_id, rating, review_text")
      .eq("id", logId)
      .single();

    if (fetchError || !existingLog) {
      return c.json({ error: "Log not found" }, 404);
    }

    if (existingLog.user_id !== user_id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const willHaveRating = rating !== undefined ? rating : existingLog.rating;
    const willHaveReviewText =
      review_text !== undefined ? review_text : existingLog.review_text;

    if (!willHaveRating && !willHaveReviewText) {
      return c.json(
        {
          error:
            "Cannot remove both rating and review text. At least one is required.",
        },
        400
      );
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null && !isValidRating(rating)) {
      return c.json(
        { error: "Valid rating (0.5-10 with 0.5 increments) is required" },
        400
      );
    }

    // Content filtering
    let filteredReviewText = review_text;
    if (review_text !== undefined) {
      if (review_text && review_text.length > 3000) {
        return c.json(
          { error: "Review text cannot exceed 3000 characters" },
          400
        );
      }
      filteredReviewText = review_text ? filter.clean(review_text) : null;
    }

    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (filteredReviewText !== undefined)
      updateData.review_text = filteredReviewText;
    if (platform !== undefined) updateData.platform = platform;
    if (game_status !== undefined) updateData.game_status = game_status;
    if (play_start_date !== undefined)
      updateData.play_start_date = play_start_date;
    if (play_end_date !== undefined) updateData.play_end_date = play_end_date;
    if (hours_played !== undefined) updateData.hours_played = hours_played;
    if (minutes_played !== undefined)
      updateData.minutes_played = minutes_played;
    if (contains_spoilers !== undefined)
      updateData.contains_spoilers = contains_spoilers;

    const { data: updatedLog, error } = await supabase
      .from("game_logs")
      .update(updateData)
      .eq("id", logId)
      .select()
      .single();

    if (error) throw error;

    return c.json(updatedLog);
  } catch (err) {
    console.error("Error updating log:", err);
    return c.json({ error: "Failed to update log" }, 500);
  }
});

// Delete a log
reviewsRoutes.delete("/:id", async (c) => {
  try {
    const logId = c.req.param("id");
    const { user_id } = await c.req.json();

    // Verify ownership
    const { data: existingLog, error: fetchError } = await supabase
      .from("game_logs")
      .select("user_id")
      .eq("id", logId)
      .single();

    if (fetchError || !existingLog) {
      return c.json({ error: "Log not found" }, 404);
    }

    if (existingLog.user_id !== user_id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const { error } = await supabase.from("game_logs").delete().eq("id", logId);

    if (error) throw error;

    return c.json({ message: "Log deleted successfully" });
  } catch (err) {
    console.error("Error deleting log:", err);
    return c.json({ error: "Failed to delete log" }, 500);
  }
});

// Get comments for a log
reviewsRoutes.get("/:logId/comments", async (c) => {
  try {
    const logId = c.req.param("logId");

    const { data: comments, error } = await supabase
      .from("log_comments")
      .select(
        `
        *,
        profile:profiles(id, username, display_name, avatar_url)
      `
      )
      .eq("log_id", logId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return c.json(comments || []);
  } catch (err) {
    console.error("Error fetching comments:", err);
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
});

// Add a comment to a log
reviewsRoutes.post("/:logId/comments", async (c) => {
  try {
    const logId = c.req.param("logId");
    const body = await c.req.json();
    const { comment_text, user_id } = body;

    if (!comment_text || !user_id) {
      return c.json({ error: "Comment text and user ID are required" }, 400);
    }

    if (comment_text.length > 1000) {
      return c.json({ error: "Comment cannot exceed 1000 characters" }, 400);
    }

    // Content filtering
    const filteredComment = filter.clean(comment_text);

    const { data: newComment, error } = await supabase
      .from("log_comments")
      .insert({
        log_id: logId,
        user_id,
        comment_text: filteredComment,
      })
      .select(
        `
        *,
        profile:profiles(id, username, display_name, avatar_url)
      `
      )
      .single();

    if (error) throw error;

    return c.json(newComment, 201);
  } catch (err) {
    console.error("Error creating comment:", err);
    return c.json({ error: "Failed to create comment" }, 500);
  }
});

// Draft management routes
reviewsRoutes.get("/drafts/:userId/:gameId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const gameId = c.req.param("gameId");

    const { data: draft, error } = await supabase
      .from("log_drafts")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return c.json(draft || null);
  } catch (err) {
    console.error("Error fetching draft:", err);
    return c.json({ error: "Failed to fetch draft" }, 500);
  }
});

reviewsRoutes.post("/drafts", async (c) => {
  try {
    const body = await c.req.json();
    const {
      user_id,
      game_id,
      rating,
      review_text,
      game_status,
      play_start_date,
      play_end_date,
      hours_played = 0,
      minutes_played = 0,
      platform,
      contains_spoilers = false,
    } = body;

    if (!user_id || !game_id) {
      return c.json({ error: "User ID and Game ID are required" }, 400);
    }

    const draftData: any = {
      user_id,
      game_id,
      hours_played,
      minutes_played,
      contains_spoilers,
    };

    if (rating !== undefined) draftData.rating = rating;
    if (review_text !== undefined) draftData.review_text = review_text;
    if (game_status !== undefined) draftData.game_status = game_status;
    if (play_start_date !== undefined)
      draftData.play_start_date = play_start_date;
    if (play_end_date !== undefined) draftData.play_end_date = play_end_date;
    if (platform !== undefined) draftData.platform = platform;

    const { data: draft, error } = await supabase
      .from("log_drafts")
      .upsert(draftData, { onConflict: "user_id,game_id" })
      .select()
      .single();

    if (error) throw error;

    return c.json(draft);
  } catch (err) {
    console.error("Error saving draft:", err);
    return c.json({ error: "Failed to save draft" }, 500);
  }
});
