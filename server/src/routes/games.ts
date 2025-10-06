import { Hono } from "hono";
import { fetchIGDB } from "../services/igdb";
import { supabase } from "../lib/supabase";

export const gamesRoutes = new Hono();

import { IGDB_BODY } from "../constant";

import { newlyReleasedRoutes } from "./games/newlyReleased";
import { upcomingRoutes } from "./games/upcoming";
import { highlyRatedRoutes } from "./games/highlyRated";

import { ensureCompaniesExist } from "../services/updaters/gameCompanies";
import { fetchPopularityScores } from "../helpers/popularityScores";
import { formatGameForDatabase } from "../helpers/formatGameData";

gamesRoutes.route("/newly-released", newlyReleasedRoutes);
gamesRoutes.route("/upcoming", upcomingRoutes);
gamesRoutes.route("/highly-rated", highlyRatedRoutes);

const artworkTypeOrder: Record<number, number> = {
  1: 0, // Artwork
  2: 1, // Key art without logo
  3: 2, // Key art with logo
  4: 3, // Concept art
  8: 4, // Infographic
  7: 5, // Game logo (color)
  5: 6, // Game logo (white)
  6: 7, // Game logo (black)
};

// FROM SUPABASE
gamesRoutes.get("/games", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1", 10);
    const pageSize = parseInt(c.req.query("limit") || "60", 10);
    const offset = (page - 1) * pageSize;

    const sort1 = c.req.query("sort1") || "popularity";
    const sort1Order = c.req.query("order1") === "asc" ? "asc" : "desc";

    const { count } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true });

    const query = supabase
      .from("games")
      .select("*")
      .order(sort1, { ascending: sort1Order === "asc" })
      .range(offset, offset + pageSize - 1);

    const { data: games, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      return c.json({ error: "Failed to fetch games from database" }, 500);
    }

    const totalPages = Math.ceil((count ?? 0) / pageSize);

    return c.json({
      page,
      totalCount: count || 0,
      totalPages: totalPages,
      pageSize,
      sort: sort1,
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
    // find the game in database
    const { data: dbGame, error: dbError } = await supabase
      .from("games")
      .select("*")
      .eq("slug", gameSlug)
      .single();

    let game = dbGame;

    // If not found or data is stale update
    if (!dbGame || dbError) {
      console.log(`Game ${gameSlug} not found in database, fetching from IGDB`);

      // Fetch from IGDB
      const body = `
      fields 
        updated_at,
        ${IGDB_BODY}
      where
        slug = "${gameSlug}";
      `;

      const gameContent = await fetchIGDB("games", body);

      if (!gameContent || gameContent.length === 0) {
        return c.json({ error: "Game not found" }, 404);
      }

      const igdbGame = gameContent[0];

      // Fetch popularity score
      const { popularityMap } = await fetchPopularityScores([igdbGame.id]);

      // Format game data
      const formattedGame = await formatGameForDatabase(
        igdbGame,
        popularityMap.get(igdbGame.id) || null
      );

      // Ensure companies exist
      const allCompanyIds = [
        ...(await formattedGame).developer_ids,
        ...(await formattedGame).publisher_ids,
      ];
      if (allCompanyIds.length > 0) {
        await ensureCompaniesExist(allCompanyIds);
      }

      // Insert into database
      const { error: insertError } = await supabase
        .from("games")
        .upsert([formattedGame], { onConflict: "id" });

      if (insertError) {
        console.error("Error inserting game:", insertError);
      } else {
        console.log(`Successfully added game ${gameSlug} to database`);
      }

      game = formattedGame;
    } else {
      const lastUpdated = dbGame.updated_at || 0;
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;

      if (now - lastUpdated > sevenDaysInSeconds) {
        console.log(
          `Game ${gameSlug} data is stale, will update on next full sync`
        );
      }
    }

    let relatedGames: {
      name: any;
      slug: any;
      cover_id: any;
      game_type: any;
      official_release_date: any;
    }[] = [];

    let hasMoreRelatedGames = false;
    if (game.collection_ids && game.collection_ids.length > 0) {
      const excludedGameTypes = [1, 3, 5, 13, 14];

      const { data: related, error: relatedError } = await supabase
        .from("games")
        .select("name, slug, cover_id, game_type, official_release_date")
        .neq("slug", gameSlug)
        .overlaps("collection_ids", game.collection_ids)
        .not("game_type", "in", `(${excludedGameTypes.join(",")})`)
        .limit(5);

      if (relatedError) {
        console.error("Error fetching related games:", relatedError);
      }

      // Sort by release date
      const sortedRelated = (related || []).sort((a: any, b: any) => {
        if (!a.official_release_date) return 1;
        if (!b.official_release_date) return -1;
        return (
          new Date(a.official_release_date).getTime() -
          new Date(b.official_release_date).getTime()
        );
      });

      hasMoreRelatedGames = sortedRelated.length > 4;

      relatedGames = sortedRelated.slice(0, 4);
    }

    return c.json({
      ...game,
      related_games: relatedGames,
      has_more_related_games: hasMoreRelatedGames,
    });
  } catch (err) {
    console.error("Error fetching game:", err);
    return c.json({ error: `Failed to fetch ${gameSlug} information.` }, 500);
  }
});
