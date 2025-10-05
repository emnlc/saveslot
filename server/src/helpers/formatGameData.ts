import { ensureCollectionsExist } from "./collections";
import { ensureFranchisesExist } from "./franchises";
import { getOfficialReleaseDate } from "./releaseDate";

const ARTWORK_TYPE_ORDER: Record<number, number> = {
  1: 1, // Concept art
  2: 2, // Artwork
  3: 3, // Screenshot
};

const STORE_IDS = new Set<number>([10, 11, 12, 13, 16, 17, 22, 23, 24]);

interface FormattedGame {
  id: number;
  name: string;
  slug: string;
  summary: string | null;
  storyline: string | null;
  cover_id: string | null;
  esrb_rating: string | null;
  artwork_ids: string[];
  videos: { video_id: string; name: string };
  official_website: string | null;
  store_links: Record<string, string> | null;
  igdb_total_rating: number | null;
  igdb_total_rating_count: number | null;
  updated_at: number | null;
  popularity: number;
  first_release_date: string | null;
  official_release_date: string | null;
  release_date_human: string | null;
  release_date_status: string | null;
  released: boolean;
  game_type: number | null;
  themes: number[];
  screenshots: string[];
  developer_ids: number[];
  publisher_ids: number[];
  platform_ids: number[];
  genres: number[];
  franchise_ids: number[];
  collection_ids: number[];
}

export async function formatGameForDatabase(
  game: any,
  popularityScore: number | null
): Promise<FormattedGame> {
  const rating = game.total_rating || 0;
  const ratingCount = game.total_rating_count || 0;
  const genres = game.genres;
  // Use popularity score
  const popularity = popularityScore ?? ratingCount * (rating / 100);

  // Process screenshots
  const screenshots =
    game.screenshots?.map((s: any) => s.image_id).filter(Boolean) || [];

  // Process ESRB rating
  const esrbRating = game.age_ratings?.find(
    (rating: any) => rating.rating_category?.organization?.id === 1
  );

  // Process artworks
  let artworkIds: string[] = [];
  if (game.artworks) {
    const filteredArtworks = game.artworks.filter((a: any) => a.height >= 500);

    const groupedByType: Record<number, any[]> = {};
    filteredArtworks.forEach((a: any) => {
      const type = a.artwork_type;
      if (!groupedByType[type]) groupedByType[type] = [];
      groupedByType[type].push(a);
    });

    const sortedTypes = Object.keys(groupedByType)
      .map(Number)
      .filter((type) => !isNaN(type) && groupedByType[type])
      .sort((typeA, typeB) => {
        const groupA = groupedByType[typeA];
        const groupB = groupedByType[typeB];
        const hasLandscapeA = groupA.some((a) => a.width > a.height);
        const hasLandscapeB = groupB.some((b) => b.width > b.height);
        if (hasLandscapeA && !hasLandscapeB) return -1;
        if (!hasLandscapeA && hasLandscapeB) return 1;
        const orderA = ARTWORK_TYPE_ORDER[typeA] ?? 999;
        const orderB = ARTWORK_TYPE_ORDER[typeB] ?? 999;
        return orderA - orderB;
      });

    const sortedArtworks = sortedTypes.flatMap((type) =>
      groupedByType[type].sort((a: any, b: any) => {
        const orientationA = a.width > a.height ? 0 : 1;
        const orientationB = b.width > b.height ? 0 : 1;
        if (orientationA !== orientationB) return orientationA - orientationB;
        return b.width - a.width;
      })
    );

    artworkIds = sortedArtworks.map((a: any) => a.image_id);
  }

  // Process videos
  const videos =
    game.videos?.map((v: any) => ({
      video_id: v.video_id,
      name: v.name || null,
    })) || [];

  // Process websites
  let officialWebsite: string | null = null;
  const storeLinks: Record<string, string> = {};

  if (game.websites) {
    game.websites.forEach((website: any) => {
      const typeId = website.type?.id;
      if (typeId === 1 && !officialWebsite) {
        officialWebsite = website.url;
      } else if (typeId && STORE_IDS.has(typeId)) {
        storeLinks[typeId.toString()] = website.url;
      }
    });
  }

  // Process companies
  const developers =
    game.involved_companies
      ?.filter((ic: any) => ic.developer && ic.company?.id)
      .map((ic: any) => ic.company.id) || [];
  const publishers =
    game.involved_companies
      ?.filter((ic: any) => ic.publisher && ic.company?.id)
      .map((ic: any) => ic.company.id) || [];

  // Process platforms
  const platforms = game.platforms?.map((p: any) => p.id).filter(Boolean) || [];

  // Process themes
  const themes = Array.isArray(game.themes)
    ? game.themes.map((t: any) => t.id || t).filter(Boolean)
    : [];

  // Get release date info
  const releaseInfo = getOfficialReleaseDate(
    game.release_dates,
    game.first_release_date
  );

  // Process franchises
  const franchises =
    game.franchises?.map((f: any) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
    })) || [];

  const franchiseIds = franchises.map((f: any) => f.id);
  if (franchiseIds.length > 0) {
    await ensureFranchisesExist(franchises);
  }

  // Process collections
  const collections =
    game.collections?.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })) || [];

  const collectionIds = collections.map((c: any) => c.id);
  if (collectionIds.length > 0) {
    await ensureCollectionsExist(collections);
  }

  // if game is released
  const now = new Date();
  let isReleased = false;

  if (releaseInfo.official_release_date) {
    isReleased = new Date(releaseInfo.official_release_date) <= now;
  } else if (game.first_release_date) {
    const releaseDate = new Date(game.first_release_date * 1000);
    isReleased = releaseDate <= now;
  }

  return {
    id: game.id,
    name: game.name,
    slug: game.slug,
    summary: game.summary || null,
    storyline: game.storyline || null,
    cover_id: game.cover?.image_id || null,
    esrb_rating: esrbRating?.rating_category?.rating || null,
    artwork_ids: artworkIds,
    videos: videos.length > 0 ? videos : null,
    official_website: officialWebsite,
    store_links: Object.keys(storeLinks).length > 0 ? storeLinks : null,
    igdb_total_rating: rating > 0 ? rating : null,
    igdb_total_rating_count: ratingCount > 0 ? ratingCount : null,
    updated_at: game.updated_at || null,
    popularity: popularity,
    first_release_date: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString()
      : null,
    official_release_date: releaseInfo.official_release_date,
    release_date_human: releaseInfo.release_date_human,
    release_date_status: releaseInfo.release_date_status,
    released: isReleased,
    game_type: game.game_type ?? null,
    themes: themes,
    genres,
    screenshots: screenshots,
    developer_ids: developers,
    publisher_ids: publishers,
    platform_ids: platforms,
    franchise_ids: franchiseIds,
    collection_ids: collectionIds,
  };
}
