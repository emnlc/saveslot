import { Hono } from "hono";
import { fetchIGDB } from "../services/igdb";
import { supabase } from "../lib/supabase";
import { IGDB_BODY } from "../constant";
import { newlyReleasedRoutes } from "./games/newlyReleased";
import { upcomingRoutes } from "./games/upcoming";
import { highlyRatedRoutes } from "./games/highlyRated";
import { fetchPopularityScores } from "../helpers/popularityScores";
import { insertAllEntities } from "../helpers/insertion/insertEntities";
import { insertGames } from "../helpers/insertion/insertGames";
import { insertAllRelationships } from "../helpers/insertion/insertRelationships";

export const gamesRoutes = new Hono();

gamesRoutes.route("/newly-released", newlyReleasedRoutes);
gamesRoutes.route("/upcoming", upcomingRoutes);
gamesRoutes.route("/highly-rated", highlyRatedRoutes);

gamesRoutes.get("/games", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1", 10);
    const pageSize = parseInt(c.req.query("limit") || "60", 10);
    const offset = (page - 1) * pageSize;

    const allowedSorts = [
      "popularity",
      "name",
      "igdb_total_rating",
      "first_release_date",
      "official_release_date",
    ];
    const sort1 = c.req.query("sort1") || "popularity";
    const sort1Order = c.req.query("order1") === "asc" ? "asc" : "desc";
    const sortKey = allowedSorts.includes(sort1) ? sort1 : "popularity";

    const { count } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true })
      .eq("is_nsfw", false);

    const { data: games, error } = await supabase
      .from("games")
      .select(
        "id, name, slug, cover_id, game_type, igdb_total_rating, igdb_total_rating_count, popularity, first_release_date, official_release_date, release_date_human, is_released, is_nsfw"
      )
      .eq("is_nsfw", false)
      .order(sortKey, { ascending: sort1Order === "asc" })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Error fetching games:", error);
      return c.json({ error: "Failed to fetch games from database" }, 500);
    }

    const totalPages = Math.ceil((count ?? 0) / pageSize);

    return c.json({
      page,
      totalCount: count || 0,
      totalPages,
      pageSize,
      sort: sortKey,
      order: sort1Order,
      games,
    });
  } catch (err) {
    console.error("Error querying games:", err);
    return c.json({ error: "Unexpected error" }, 500);
  }
});

gamesRoutes.get("/:game_slug", async (c) => {
  const gameSlug = c.req.param("game_slug");

  try {
    const { data: gameData, error: dbError } = await supabase
      .from("games")
      .select(
        `
        *,
        game_companies(
          company:companies(*),
          is_developer,
          is_publisher
        ),
        game_platforms(
          platform:platforms(*),
          release_date,
          release_date_human,
          release_status
        ),
        game_genres(genre:genres(*)),
        game_themes(theme:themes(*)),
        game_collections(collection:collections(*)),
        game_franchises(franchise:franchises(*)),
        age_ratings(*)
      `
      )
      .eq("slug", gameSlug)
      .single();

    let finalGameData = gameData;
    let wasCached = true;

    if (dbError || !gameData) {
      wasCached = false;

      const igdbGames = await fetchIGDB(
        "games",
        `
        fields ${IGDB_BODY}
        where slug = "${gameSlug}";
      `
      );

      if (!igdbGames || igdbGames.length === 0) {
        return c.json({ error: "Game not found" }, 404);
      }

      const igdbGame = igdbGames[0];

      const { popularityMap } = await fetchPopularityScores([igdbGame.id], {
        batchSize: 1,
        delayBetweenBatches: 0,
      });

      await insertAllEntities([igdbGame]);
      await insertGames([igdbGame], popularityMap);
      await insertAllRelationships([igdbGame]);

      const { data: newGameData, error: newError } = await supabase
        .from("games")
        .select(
          `
          *,
          game_companies(
            company:companies(*),
            is_developer,
            is_publisher
          ),
          game_platforms(
            platform:platforms(*),
            release_date,
            release_date_human,
            release_status
          ),
          game_genres(genre:genres(*)),
          game_themes(theme:themes(*)),
          game_collections(collection:collections(*)),
          game_franchises(franchise:franchises(*)),
          age_ratings(*)
        `
        )
        .eq("slug", gameSlug)
        .single();

      if (newError || !newGameData) {
        console.error("Error fetching newly inserted game:", newError);
        return c.json(
          { error: "Failed to retrieve game after insertion" },
          500
        );
      }

      finalGameData = newGameData;
    } else {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const lastUpdated = new Date(gameData.updated_at).getTime();
      const isStale = Date.now() - lastUpdated > sevenDays;

      if (isStale) {
        refreshGameData(gameSlug).catch((err) =>
          console.error("Background refresh failed:", err)
        );
      }
    }

    const formattedGame = formatGameResponse(finalGameData);
    const relatedGamesData = await fetchRelatedGames(
      finalGameData.id,
      finalGameData.game_collections
    );

    return c.json({
      ...formattedGame,
      related_games: relatedGamesData.games,
      has_more_related_games: relatedGamesData.hasMore,
      was_cached: wasCached,
    });
  } catch (err) {
    console.error("Error fetching game:", err);
    return c.json({ error: `Failed to fetch ${gameSlug} information.` }, 500);
  }
});

function formatGameResponse(gameData: any) {
  const developers =
    gameData.game_companies
      ?.filter((gc: any) => gc.is_developer)
      .map((gc: any) => gc.company) || [];
  const publishers =
    gameData.game_companies
      ?.filter((gc: any) => gc.is_publisher)
      .map((gc: any) => gc.company) || [];

  return {
    ...gameData,
    developers,
    publishers,
    platforms:
      gameData.game_platforms?.map((gp: any) => ({
        ...gp.platform,
        release_date: gp.release_date,
        release_date_human: gp.release_date_human,
        release_status: gp.release_status,
      })) || [],
    genres: gameData.game_genres?.map((gg: any) => gg.genre) || [],
    themes: gameData.game_themes?.map((gt: any) => gt.theme) || [],
    collections:
      gameData.game_collections?.map((gc: any) => gc.collection) || [],
    franchises: gameData.game_franchises?.map((gf: any) => gf.franchise) || [],
    age_ratings: gameData.age_ratings || [],
    game_companies: undefined,
    game_platforms: undefined,
    game_genres: undefined,
    game_themes: undefined,
    game_collections: undefined,
    game_franchises: undefined,
  };
}

async function fetchRelatedGames(gameId: number, gameCollections: any[]) {
  if (!gameCollections || gameCollections.length === 0) {
    return { games: [], hasMore: false };
  }

  const collectionIds = gameCollections.map((gc: any) => gc.collection.id);
  const excludedGameTypes = [1, 3, 5, 13, 14];

  const { data: related, error } = await supabase
    .from("game_collections")
    .select(
      `
      game_id,
      games!inner(
        id,
        name,
        slug,
        cover_id,
        game_type,
        official_release_date,
        is_nsfw
      )
    `
    )
    .neq("game_id", gameId)
    .in("collection_id", collectionIds)
    .eq("games.is_nsfw", false)
    .not("games.game_type", "in", `(${excludedGameTypes.join(",")})`)
    .order("official_release_date", {
      ascending: true,
      foreignTable: "games",
      nullsFirst: false,
    })
    .limit(5);

  if (error) {
    console.error("Error fetching related games:", error);
    return { games: [], hasMore: false };
  }

  const games = related?.map((r: any) => r.games).filter(Boolean) || [];
  const hasMore = games.length > 4;

  return {
    games: games.slice(0, 4),
    hasMore,
  };
}

async function refreshGameData(gameSlug: string) {
  try {
    const igdbGames = await fetchIGDB(
      "games",
      `
      fields ${IGDB_BODY}
      where slug = "${gameSlug}";
    `
    );

    if (!igdbGames || igdbGames.length === 0) {
      return;
    }

    const igdbGame = igdbGames[0];

    const { popularityMap } = await fetchPopularityScores([igdbGame.id], {
      batchSize: 1,
      delayBetweenBatches: 0,
    });

    await insertAllEntities([igdbGame]);
    await insertGames([igdbGame], popularityMap);
    await insertAllRelationships([igdbGame]);
  } catch (error) {
    console.error("Background refresh failed:", error);
    throw error;
  }
}
