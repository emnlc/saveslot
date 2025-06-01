import { Hono } from "hono";
import { fetchIGDB } from "../services/igdb";

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
    sort total_rating_count desc;
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
      first_release_date < ${NINETY_DAYS} &
      first_release_date > ${Math.floor(Date.now() / 1000)} &
      hypes > 5;
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
      first_release_date < ${Math.floor(Date.now() / 1000)} &
      hypes > 15;
    sort first_release_date desc;
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
      cover.url,
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
