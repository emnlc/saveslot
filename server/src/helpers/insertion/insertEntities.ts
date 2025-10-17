import { supabase } from "../../lib/supabase";

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
  artworks?: Array<{ image_id: string }>;
  videos?: Array<{ name: string; video_id: string }>;
  websites?: Array<{ type: { id: number }; url: string }>;
  genres?: Array<{ id: number; name: string; slug: string }>;
  themes?: Array<{ id: number; name: string; slug: string }>;
  platforms?: Array<{
    id: number;
    name: string;
    abbreviation?: string;
    slug: string;
    platform_logo?: { image_id: string };
  }>;
  involved_companies?: Array<{
    company: {
      id: number;
      name: string;
      slug: string;
      logo?: { image_id: string };
    };
    developer: boolean;
    publisher: boolean;
  }>;
  collections?: Array<{ id: number; name: string; slug: string }>;
  franchises?: Array<{ id: number; name: string; slug: string }>;
  release_dates?: Array<{
    date: number;
    human: string;
    status?: { name: string };
    date_format?: number;
  }>;
  age_ratings?: Array<{
    rating_category: { organization: { id: number }; rating: string };
  }>;
}

export async function insertCompanies(games: IGDBGame[]) {
  const companiesMap = new Map<number, any>();

  games.forEach((game) => {
    game.involved_companies?.forEach((ic) => {
      if (!companiesMap.has(ic.company.id)) {
        companiesMap.set(ic.company.id, {
          id: ic.company.id,
          name: ic.company.name,
          slug: ic.company.slug,
          logo_id: ic.company.logo?.image_id || null,
        });
      }
    });
  });

  const companies = Array.from(companiesMap.values());
  if (companies.length === 0) return;

  const { error } = await supabase.from("companies").upsert(companies, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting companies:", error);
    throw error;
  }
}

export async function insertPlatforms(games: IGDBGame[]) {
  const platformsMap = new Map<number, any>();

  games.forEach((game) => {
    game.platforms?.forEach((platform) => {
      if (!platformsMap.has(platform.id)) {
        platformsMap.set(platform.id, {
          id: platform.id,
          name: platform.name,
          abbreviation: platform.abbreviation || null,
          slug: platform.slug,
          logo_id: platform.platform_logo?.image_id || null,
        });
      }
    });
  });

  const platforms = Array.from(platformsMap.values());
  if (platforms.length === 0) return;

  const { error } = await supabase.from("platforms").upsert(platforms, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting platforms:", error);
    throw error;
  }
}

export async function insertGenres(games: IGDBGame[]) {
  const genresMap = new Map<number, any>();

  games.forEach((game) => {
    game.genres?.forEach((genre) => {
      if (!genresMap.has(genre.id)) {
        genresMap.set(genre.id, {
          id: genre.id,
          name: genre.name,
          slug: genre.slug,
        });
      }
    });
  });

  const genres = Array.from(genresMap.values());
  if (genres.length === 0) return;

  const { error } = await supabase.from("genres").upsert(genres, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting genres:", error);
    throw error;
  }
}

export async function insertThemes(games: IGDBGame[]) {
  const themesMap = new Map<number, any>();

  games.forEach((game) => {
    game.themes?.forEach((theme) => {
      if (!themesMap.has(theme.id)) {
        themesMap.set(theme.id, {
          id: theme.id,
          name: theme.name,
          slug: theme.slug,
        });
      }
    });
  });

  const themes = Array.from(themesMap.values());
  if (themes.length === 0) return;

  const { error } = await supabase.from("themes").upsert(themes, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting themes:", error);
    throw error;
  }
}

export async function insertCollections(games: IGDBGame[]) {
  const collectionsMap = new Map<number, any>();

  games.forEach((game) => {
    game.collections?.forEach((collection) => {
      if (!collectionsMap.has(collection.id)) {
        collectionsMap.set(collection.id, {
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
        });
      }
    });
  });

  const collections = Array.from(collectionsMap.values());
  if (collections.length === 0) return;

  const { error } = await supabase.from("collections").upsert(collections, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting collections:", error);
    throw error;
  }
}

export async function insertFranchises(games: IGDBGame[]) {
  const franchisesMap = new Map<number, any>();

  games.forEach((game) => {
    game.franchises?.forEach((franchise) => {
      if (!franchisesMap.has(franchise.id)) {
        franchisesMap.set(franchise.id, {
          id: franchise.id,
          name: franchise.name,
          slug: franchise.slug,
        });
      }
    });
  });

  const franchises = Array.from(franchisesMap.values());
  if (franchises.length === 0) return;

  const { error } = await supabase.from("franchises").upsert(franchises, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting franchises:", error);
    throw error;
  }
}

export async function insertAllEntities(games: IGDBGame[]) {
  await insertCompanies(games);
  await insertPlatforms(games);
  await insertGenres(games);
  await insertThemes(games);
  await insertCollections(games);
  await insertFranchises(games);
}
