import { Hono } from "hono";
import { supabase } from "../lib/supabase";
import { fetchIGDB } from "../services/igdb";

export const searchRoutes = new Hono();

searchRoutes.get("/quick", async (c) => {
  try {
    const query = c.req.query("q") || "";

    if (!query || query.length < 2) {
      return c.json({ games: [] });
    }

    const searchPattern = `%${query}%`;

    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select(
        "id, name, slug, cover_id, is_released, first_release_date, official_release_date, release_date_human, popularity, igdb_total_rating, is_nsfw"
      )
      .ilike("name", searchPattern)
      .eq("is_nsfw", false)
      .limit(10);

    if (gamesError) throw gamesError;

    const sortedGames = games?.sort((a, b) => {
      const aExact = a.name.toLowerCase() === query.toLowerCase();
      const bExact = b.name.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return c.json({
      games: sortedGames || [],
    });
  } catch (err) {
    console.error("Error in quick search:", err);
    return c.json({ error: "Failed to perform search" }, 500);
  }
});

searchRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { query, user_id } = body;

    if (!query || query.length < 2) {
      return c.json({
        local_games: [],
        igdb_games: [],
        users: [],
        lists: [],
        reviews: [],
      });
    }

    const searchPattern = `%${query}%`;

    const [
      localGamesResult,
      usersResult,
      listsResult,
      reviewsResult,
      igdbResult,
    ] = await Promise.all([
      supabase
        .from("games")
        .select(
          "id, name, slug, cover_id, is_released, official_release_date, release_date_human, popularity, igdb_total_rating, is_nsfw"
        )
        .ilike("name", searchPattern)
        .eq("is_nsfw", false)
        .limit(5),

      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .or(
          `username.ilike.${searchPattern},display_name.ilike.${searchPattern}`
        )
        .limit(20),

      (async () => {
        let query = supabase
          .from("game_lists")
          .select("*, profile:profiles(id, username, display_name, avatar_url)")
          .ilike("name", searchPattern);

        if (user_id) {
          query = query.or(`is_public.eq.true,user_id.eq.${user_id}`);
        } else {
          query = query.eq("is_public", true);
        }

        return query.limit(20);
      })(),

      supabase
        .from("game_logs")
        .select(
          `
          id,
          review_text,
          rating,
          created_at,
          profile:profiles(id, username, display_name, avatar_url),
          game:games(id, name, slug, cover_id, is_nsfw)
        `
        )
        .ilike("review_text", searchPattern)
        .eq("is_draft", false)
        .not("review_text", "is", null)
        .neq("review_text", "")
        .limit(20),

      fetchIGDB(
        "games",
        `
          fields name, slug, cover.image_id, first_release_date, total_rating, themes.id;
          search "${query}";
          where cover.image_id != null & game_type != (13, 14);
          limit 30;
        `
      ).catch((err) => {
        console.error("IGDB search failed:", err);
        return [];
      }),
    ]);

    const sortedLocalGames = (localGamesResult.data || []).sort((a, b) => {
      const aExact = a.name.toLowerCase() === query.toLowerCase();
      const bExact = b.name.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return (b.popularity || 0) - (a.popularity || 0);
    });

    const localGameIds = new Set(sortedLocalGames.map((g) => g.id));
    const igdbGames = (Array.isArray(igdbResult) ? igdbResult : [])
      .filter((game: any) => {
        if (!game?.id || !game?.name || localGameIds.has(game.id)) {
          return false;
        }
        const hasEroticTheme = game.themes?.some(
          (theme: any) => theme.id === 42
        );
        return !hasEroticTheme;
      })
      .map((game: any) => ({
        id: game.id,
        name: game.name,
        slug: game.slug,
        cover_id: game.cover?.image_id || null,
        first_release_date: game.first_release_date,
        total_rating: game.total_rating || null,
      }));

    const filteredReviews = (reviewsResult.data || []).filter(
      (review: any) => !review.game?.is_nsfw
    );

    return c.json({
      local_games: sortedLocalGames,
      igdb_games: igdbGames,
      users: usersResult.data || [],
      lists: listsResult.data || [],
      reviews: filteredReviews,
    });
  } catch (err) {
    console.error("Error in full search:", err);
    return c.json({ error: "Failed to perform search" }, 500);
  }
});
