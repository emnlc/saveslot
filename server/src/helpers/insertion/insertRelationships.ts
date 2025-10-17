import { supabase } from "../../lib/supabase";

interface IGDBGame {
  id: number;
  genres?: Array<{ id: number }>;
  themes?: Array<{ id: number }>;
  platforms?: Array<{ id: number }>;
  involved_companies?: Array<{
    company: { id: number };
    developer: boolean;
    publisher: boolean;
  }>;
  collections?: Array<{ id: number }>;
  franchises?: Array<{ id: number }>;
  release_dates?: Array<{
    date: number;
    human: string;
    status?: { name: string };
  }>;
  age_ratings?: Array<{
    rating_category: { organization: { id: number }; rating: string };
  }>;
}

export async function insertGameCompanies(games: IGDBGame[]) {
  const relationsMap = new Map<string, any>();

  games.forEach((game) => {
    game.involved_companies?.forEach((ic) => {
      const key = `${game.id}-${ic.company.id}`;
      if (relationsMap.has(key)) {
        const existing = relationsMap.get(key);
        relationsMap.set(key, {
          ...existing,
          is_developer: existing.is_developer || ic.developer || false,
          is_publisher: existing.is_publisher || ic.publisher || false,
        });
      } else {
        relationsMap.set(key, {
          game_id: game.id,
          company_id: ic.company.id,
          is_developer: ic.developer || false,
          is_publisher: ic.publisher || false,
        });
      }
    });
  });

  const relations = Array.from(relationsMap.values());
  if (relations.length === 0) return;

  const { error } = await supabase.from("game_companies").upsert(relations, {
    onConflict: "game_id,company_id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting game_companies:", error);
    throw error;
  }
}

export async function insertGamePlatforms(games: IGDBGame[]) {
  const relationsMap = new Map<string, any>();

  games.forEach((game) => {
    game.platforms?.forEach((platform) => {
      const key = `${game.id}-${platform.id}`;
      if (!relationsMap.has(key)) {
        const platformRelease = game.release_dates?.find(
          (rd) => rd.date && rd.date > 0
        );
        relationsMap.set(key, {
          game_id: game.id,
          platform_id: platform.id,
          release_date: platformRelease?.date
            ? new Date(platformRelease.date * 1000).toISOString()
            : null,
          release_date_human: platformRelease?.human || null,
          release_status: platformRelease?.status?.name || null,
        });
      }
    });
  });

  const relations = Array.from(relationsMap.values());
  if (relations.length === 0) return;

  const { error } = await supabase.from("game_platforms").upsert(relations, {
    onConflict: "game_id,platform_id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting game_platforms:", error);
    throw error;
  }
}

export async function insertGameGenres(games: IGDBGame[]) {
  const relationsMap = new Map<string, any>();

  games.forEach((game) => {
    game.genres?.forEach((genre) => {
      const key = `${game.id}-${genre.id}`;
      if (!relationsMap.has(key)) {
        relationsMap.set(key, {
          game_id: game.id,
          genre_id: genre.id,
        });
      }
    });
  });

  const relations = Array.from(relationsMap.values());
  if (relations.length === 0) return;

  const { error } = await supabase.from("game_genres").upsert(relations, {
    onConflict: "game_id,genre_id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting game_genres:", error);
    throw error;
  }
}

export async function insertGameThemes(games: IGDBGame[]) {
  const relationsMap = new Map<string, any>();

  games.forEach((game) => {
    game.themes?.forEach((theme) => {
      const key = `${game.id}-${theme.id}`;
      if (!relationsMap.has(key)) {
        relationsMap.set(key, {
          game_id: game.id,
          theme_id: theme.id,
        });
      }
    });
  });

  const relations = Array.from(relationsMap.values());
  if (relations.length === 0) return;

  const { error } = await supabase.from("game_themes").upsert(relations, {
    onConflict: "game_id,theme_id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting game_themes:", error);
    throw error;
  }
}

export async function insertGameCollections(games: IGDBGame[]) {
  const relationsMap = new Map<string, any>();

  games.forEach((game) => {
    game.collections?.forEach((collection) => {
      const key = `${game.id}-${collection.id}`;
      if (!relationsMap.has(key)) {
        relationsMap.set(key, {
          game_id: game.id,
          collection_id: collection.id,
        });
      }
    });
  });

  const relations = Array.from(relationsMap.values());
  if (relations.length === 0) return;

  const { error } = await supabase.from("game_collections").upsert(relations, {
    onConflict: "game_id,collection_id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting game_collections:", error);
    throw error;
  }
}

export async function insertGameFranchises(games: IGDBGame[]) {
  const relationsMap = new Map<string, any>();

  games.forEach((game) => {
    game.franchises?.forEach((franchise) => {
      const key = `${game.id}-${franchise.id}`;
      if (!relationsMap.has(key)) {
        relationsMap.set(key, {
          game_id: game.id,
          franchise_id: franchise.id,
        });
      }
    });
  });

  const relations = Array.from(relationsMap.values());
  if (relations.length === 0) return;

  const { error } = await supabase.from("game_franchises").upsert(relations, {
    onConflict: "game_id,franchise_id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting game_franchises:", error);
    throw error;
  }
}

export async function insertAgeRatings(games: IGDBGame[]) {
  const relationsMap = new Map<string, any>();

  games.forEach((game) => {
    game.age_ratings?.forEach((ar) => {
      const key = `${game.id}-${ar.rating_category.organization.id}`;
      if (!relationsMap.has(key)) {
        relationsMap.set(key, {
          game_id: game.id,
          organization_id: ar.rating_category.organization.id,
          rating: ar.rating_category.rating,
        });
      }
    });
  });

  const relations = Array.from(relationsMap.values());
  if (relations.length === 0) return;

  const { error } = await supabase.from("age_ratings").upsert(relations, {
    onConflict: "game_id,organization_id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error inserting age_ratings:", error);
    throw error;
  }
}

export async function insertAllRelationships(games: IGDBGame[]) {
  await insertGameCompanies(games);
  await insertGamePlatforms(games);
  await insertGameGenres(games);
  await insertGameThemes(games);
  await insertGameCollections(games);
  await insertGameFranchises(games);
  await insertAgeRatings(games);
}
