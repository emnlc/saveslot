import { Hono } from "hono";
import { fetchIGDB } from "../services/igdb";
import { supabase } from "../lib/supabase";

export const gamesRoutes = new Hono();

const NINETY_DAYS = Math.floor(Date.now() / 1000) - 7889238;

// popular games
gamesRoutes.get("/popular", async (c) => {
  try {
    const body = `
    fields 
      name,
      total_rating,
      total_rating_count,
      rating,
      rating_count,
      aggregated_rating,
      aggregated_rating_count,
      hypes,
      first_release_date;
    where 
      first_release_date >= ${NINETY_DAYS} &
      first_release_date <= ${Math.floor(Date.now() / 1000)} &
      hypes > 5 &
      (aggregated_rating_count != null & hypes > 50 | total_rating_count > 5 & total_rating > 80);
    sort first_release_date desc;
    limit 25;
    `;

    const popularGames = await fetchIGDB("games", body);

    return c.json(popularGames);
  } catch (err) {
    console.error("Error fetching popular games:", err);
    return c.json({ error: "Failed to fetch popular games" }, 500);
  }
});

// upcoming games
gamesRoutes.get("/upcoming", async (c) => {
  try {
    const body = `
    fields 
      name,
      total_rating,
      total_rating_count,
      rating,
      rating_count,
      aggregated_rating,
      aggregated_rating_count,
      hypes,
      first_release_date;
    where
      first_release_date > ${Math.floor(Date.now() / 1000)};
    sort hypes desc;
    limit 25;
    `;

    const upcoming = await fetchIGDB("games", body);
    return c.json(upcoming);
  } catch (err) {
    console.error("Error fetching popular games:", err);
    return c.json({ error: "Failed to fetch popular games" }, 500);
  }
});

// recently released games
gamesRoutes.get("/releases", async (c) => {
  try {
    const body = `
    fields 
      name,
      total_rating,
      total_rating_count,
      rating,
      rating_count,
      aggregated_rating,
      aggregated_rating_count,
      hypes,
      first_release_date;
    where 
      first_release_date > ${NINETY_DAYS} &
      first_release_date < ${Math.floor(Date.now() / 1000)};
    sort hypes desc;
    limit 25;
    `;

    const releases = await fetchIGDB("games", body);
    return c.json(releases);
  } catch (err) {
    console.error("Error fetching popular games:", err);
    return c.json({ error: "Failed to fetch popular games" }, 500);
  }
});

// highly rated games
gamesRoutes.get("/highly-rated", async (c) => {
  try {
    const body = `
    fields 
      name,
      total_rating,
      total_rating_count,
      rating,
      rating_count,
      aggregated_rating,
      aggregated_rating_count,
      hypes,
      cover.image_id,
      slug,
      first_release_date;
    where
      hypes > 25 &
      total_rating > 90 &
      total_rating_count > 150;
    sort total_rating_count desc;
    limit 6;
    `;

    const releases = await fetchIGDB("games", body);
    return c.json(releases);
  } catch (err) {
    console.error("Error fetching popular games:", err);
    return c.json({ error: "Failed to fetch popular games" }, 500);
  }
});

gamesRoutes.get("/get-games", async (c) => {
  try {
    const popScoreBody = `      fields game_id, value;
      sort value desc;
      where popularity_type = (8);
      limit 500;`;
    const popPrimitives = await fetchIGDB(
      "popularity_primitives",
      popScoreBody
    );
    const gameIds = popPrimitives.map((entry: any) => entry.game_id);

    if (gameIds.length === 0) {
      return c.json([]);
    }

    const gamesBody = `
      fields 
        name,
        cover.image_id,
        total_rating,
        total_rating_count,
        rating,
        rating_count,
        aggregated_rating,
        aggregated_rating_count,
        first_release_date,
        updated_at,
        slug;
      where
        first_release_date != null &
        total_rating_count > 0 & 
        id = (${gameIds.join(",")});
      sort total_rating_count desc;
      limit 500;`;
    const games = await fetchIGDB("games", gamesBody);

    const formattedGames = games.map((game: any) => {
      const rating = game.total_rating || 0;
      const count = game.total_rating_count || 0;

      return {
        id: game.id,
        name: game.name,
        slug: game.slug,
        cover_id: game.cover?.image_id ? game.cover.image_id : null,
        igdb_total_rating: game.total_rating,
        igdb_total_rating_count: game.total_rating_count,
        updated_at: game.updated_at,
        popularity: count * (rating / 100),
        first_release_date: new Date(
          game.first_release_date * 1000
        ).toISOString(),
      };
    });

    const { error } = await supabase
      .from("games")
      .upsert(formattedGames, { onConflict: "id" }); // Prevents duplicates

    if (error) {
      console.error("Supabase insert error:", error);
      return c.json({ error: "Failed to save games to database" }, 500);
    }

    return c.json(games);
  } catch (err) {
    console.error("Error fetching PopScore popular games:", err);
    return c.json({ error: "Failed to fetch PopScore popular games" }, 500);
  }
});

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
    const body = `
    fields 
      name,
      total_rating,
      total_rating_count,
      rating,
      rating_count,
      aggregated_rating,
      aggregated_rating_count,
      hypes,
      age_ratings.rating_category.rating,
      age_ratings.rating_category.organization.name,
      age_ratings.rating_cover_url,
      game_engines,
      game_type,
      game_status,
      genres.name,
      involved_companies.company.name,
      involved_companies.developer,
      involved_companies.publisher,
      artworks.image_id,
      screenshots.image_id,
      storyline,
      summary,
      platforms.name,
      platforms.abbreviation,
      platforms.platform_logo.image_id,
      platforms.url,
      videos.video_id,
      videos.name,
      cover.image_id,
      collections.games.name,
      collections.games.game_type,
      collections.games.slug,
      collections.games.cover.image_id,
      slug,
      tags,
      url,
      websites.url,
      websites.type.type,
      first_release_date;
    where
      slug = "${gameSlug}";
    `;

    const gameContent = await fetchIGDB("games", body);
    const game = gameContent[0];
    return c.json(game);
  } catch (err) {
    console.error("Error fetching popular games:", err);
    return c.json({ error: `Failed to fetch ${gameSlug} information.` }, 500);
  }
});
