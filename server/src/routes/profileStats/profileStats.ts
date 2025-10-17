import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const profileStatsRoutes = new Hono();

profileStatsRoutes.get("/:user_id/stats", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { count: totalGames } = await supabase
      .from("user_games")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { count: completedGames } = await supabase
      .from("user_games")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");

    const { count: backlogGames } = await supabase
      .from("user_games")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "backlog");

    const { data: playTimeData } = await supabase
      .from("game_logs")
      .select("hours_played, minutes_played")
      .eq("user_id", userId);

    const totalMinutes = playTimeData
      ? playTimeData.reduce(
          (sum, log) =>
            sum + (log.hours_played || 0) * 60 + (log.minutes_played || 0),
          0
        )
      : 0;

    const totalHours = Math.floor(totalMinutes / 60);

    return c.json({
      total_games: totalGames || 0,
      completed_games: completedGames || 0,
      backlog_games: backlogGames || 0,
      total_hours_played: totalHours,
      completion_percentage:
        totalGames && totalGames > 0
          ? Math.round(((completedGames || 0) / totalGames) * 100)
          : 0,
    });
  } catch (err) {
    console.error("Error fetching profile stats:", err);
    return c.json({ error: "Failed to fetch profile stats" }, 500);
  }
});

profileStatsRoutes.get("/:user_id/rating-distribution", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data, error } = await supabase
      .from("game_logs")
      .select("rating")
      .eq("user_id", userId)
      .not("rating", "is", null);

    if (error) throw error;

    const distribution: { [key: string]: number } = {
      "5": 0,
      "4.5": 0,
      "4": 0,
      "3.5": 0,
      "3": 0,
      "2.5": 0,
      "2": 0,
      "1.5": 0,
      "1": 0,
      "0.5": 0,
    };

    data?.forEach((log) => {
      if (log.rating !== null && log.rating !== undefined) {
        const ratingStr = log.rating.toString();
        if (distribution.hasOwnProperty(ratingStr)) {
          distribution[ratingStr]++;
        }
      }
    });

    return c.json(distribution);
  } catch (err) {
    console.error("Error fetching rating distribution:", err);
    return c.json({ error: "Failed to fetch rating distribution" }, 500);
  }
});

profileStatsRoutes.get("/:user_id/top-genres", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data: userGames, error: userGamesError } = await supabase
      .from("user_games")
      .select("game_id")
      .eq("user_id", userId);

    if (userGamesError) throw userGamesError;
    if (!userGames || userGames.length === 0) return c.json([]);

    const gameIds = userGames.map((ug) => ug.game_id);

    const { data: gameGenres, error: genresError } = await supabase
      .from("game_genres")
      .select(
        `
        genre_id,
        genres:genre_id (
          id,
          name
        )
      `
      )
      .in("game_id", gameIds);

    if (genresError) throw genresError;

    const genreCounts: { [key: string]: number } = {};

    gameGenres?.forEach((item: any) => {
      const genreName = item.genres?.name || "Unknown";
      genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
    });

    const topGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return c.json(topGenres);
  } catch (err) {
    console.error("Error fetching top genres:", err);
    return c.json({ error: "Failed to fetch top genres" }, 500);
  }
});

profileStatsRoutes.get("/:user_id/top-platforms", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data: gameLogs, error: logsError } = await supabase
      .from("game_logs")
      .select("platform")
      .eq("user_id", userId)
      .not("platform", "is", null);

    if (logsError) throw logsError;
    if (!gameLogs || gameLogs.length === 0) return c.json([]);

    const platformCounts: { [key: string]: number } = {};

    gameLogs.forEach((log) => {
      if (log.platform) {
        platformCounts[log.platform] = (platformCounts[log.platform] || 0) + 1;
      }
    });

    const topPlatforms = Object.entries(platformCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return c.json(topPlatforms);
  } catch (err) {
    console.error("Error fetching top platforms:", err);
    return c.json({ error: "Failed to fetch top platforms" }, 500);
  }
});

profileStatsRoutes.get("/:user_id/activity-heatmap", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: logs, error: logsError } = await supabase
      .from("game_logs")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", sixMonthsAgo.toISOString());

    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("liked_at")
      .eq("user_id", userId)
      .gte("liked_at", sixMonthsAgo.toISOString());

    const { data: gameUpdates, error: gameUpdatesError } = await supabase
      .from("user_games")
      .select("created_at, last_updated")
      .eq("user_id", userId)
      .gte("created_at", sixMonthsAgo.toISOString());

    if (logsError || likesError || gameUpdatesError) {
      throw logsError || likesError || gameUpdatesError;
    }

    const allActivities = [
      ...(logs || []).map((l) => l.created_at),
      ...(likes || []).map((l) => l.liked_at),
      ...(gameUpdates || []).flatMap((g) => [g.created_at, g.last_updated]),
    ];

    const activityByDay: { [key: string]: number } = {};

    allActivities.forEach((dateStr) => {
      if (dateStr) {
        const date = new Date(dateStr);
        const dayKey = date.toISOString().split("T")[0];
        activityByDay[dayKey] = (activityByDay[dayKey] || 0) + 1;
      }
    });

    return c.json(activityByDay);
  } catch (err) {
    console.error("Error fetching activity heatmap:", err);
    return c.json({ error: "Failed to fetch activity heatmap" }, 500);
  }
});
