import { supabase } from "../../lib/supabase";
import { getOfficialReleaseDate } from "../releaseDate";
import { processArtworks } from "./processArtworks";

interface IGDBGame {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  cover?: { image_id: string };
  first_release_date?: number;
  game_type?: number;
  total_rating?: number;
  total_rating_count?: number;
  screenshots?: Array<{ image_id: string }>;
  artworks?: Array<{
    image_id: string;
    artwork_type: number;
    width: number;
    height: number;
  }>;
  videos?: Array<{ name: string; video_id: string }>;
  websites?: Array<{ type: { id: number }; url: string }>;
  themes?: Array<{ id: number; name: string; slug: string }>;
  release_dates?: Array<{
    date: number;
    human: string;
    status?: { name: string };
    date_format?: number;
  }>;
}

export async function insertGames(
  games: IGDBGame[],
  popularityMap: Map<number, number>
) {
  const gamesData = games.map((game) => {
    const { official_release_date, release_date_human, release_date_status } =
      getOfficialReleaseDate(game.release_dates, game.first_release_date);

    const isNsfw = game.themes?.some((theme) => theme.id === 42) || false;
    const popularity = popularityMap.get(game.id) || 0;
    const isReleased = official_release_date
      ? new Date(official_release_date) <= new Date()
      : false;

    const artworkIds = processArtworks(game.artworks);

    return {
      id: game.id,
      name: game.name,
      slug: game.slug,
      summary: game.summary || null,
      storyline: game.storyline || null,
      cover_id: game.cover?.image_id || null,
      first_release_date: game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString()
        : null,
      official_release_date,
      release_date_human,
      release_date_status,
      game_type: game.game_type !== undefined ? game.game_type : null,
      igdb_total_rating: game.total_rating || null,
      igdb_total_rating_count: game.total_rating_count || null,
      popularity,
      is_nsfw: isNsfw,
      is_released: isReleased,
      screenshot_ids: game.screenshots?.map((s) => s.image_id) || [],
      artwork_ids: artworkIds,
      videos: game.videos || null,
      websites: game.websites || null,
    };
  });

  const { error } = await supabase.from("games").upsert(gamesData, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting games:", error);
    throw error;
  }
}
