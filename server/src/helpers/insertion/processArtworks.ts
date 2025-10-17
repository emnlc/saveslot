// src/helpers/insertion/processArtworks.ts

const ARTWORK_TYPE_ORDER: Record<number, number> = {
  1: 1, // Concept art
  2: 2, // Artwork
  3: 3, // Screenshot
};

const ALLOWED_ARTWORK_TYPES = [1, 2, 3];

interface Artwork {
  image_id: string;
  artwork_type: number;
  width: number;
  height: number;
}

/**
 * Process and sort artworks for a game
 * - Filters out small images (< 500px height)
 * - Only includes concept art, artwork, and screenshots
 * - Prioritizes landscape orientation
 * - Sorts by type preference, then orientation, then size
 */
export function processArtworks(artworks?: Artwork[]): string[] {
  if (!artworks || artworks.length === 0) {
    return [];
  }

  // Filter: only large images and allowed types
  const filteredArtworks = artworks.filter(
    (artwork) =>
      artwork.height >= 500 &&
      ALLOWED_ARTWORK_TYPES.includes(artwork.artwork_type)
  );

  if (filteredArtworks.length === 0) {
    return [];
  }

  // Group by artwork type
  const groupedByType = filteredArtworks.reduce((groups, artwork) => {
    const type = artwork.artwork_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(artwork);
    return groups;
  }, {} as Record<number, Artwork[]>);

  // Sort types by priority (prefer types with landscape images)
  const sortedTypes = Object.keys(groupedByType)
    .map(Number)
    .sort((typeA, typeB) => {
      const groupA = groupedByType[typeA];
      const groupB = groupedByType[typeB];

      // Check if groups have landscape images
      const hasLandscapeA = groupA.some((a) => a.width > a.height);
      const hasLandscapeB = groupB.some((b) => b.width > b.height);

      // Prioritize types with landscape images
      if (hasLandscapeA && !hasLandscapeB) return -1;
      if (!hasLandscapeA && hasLandscapeB) return 1;

      // If both have or don't have landscape, sort by type priority
      const orderA = ARTWORK_TYPE_ORDER[typeA] ?? 999;
      const orderB = ARTWORK_TYPE_ORDER[typeB] ?? 999;
      return orderA - orderB;
    });

  // Sort artworks within each type
  const sortedArtworks = sortedTypes.flatMap((type) => {
    return groupedByType[type].sort((a, b) => {
      // Prioritize landscape orientation
      const isLandscapeA = a.width > a.height;
      const isLandscapeB = b.width > b.height;

      if (isLandscapeA && !isLandscapeB) return -1;
      if (!isLandscapeA && isLandscapeB) return 1;

      // If same orientation, prefer larger images
      return b.width - a.width;
    });
  });

  // Return only image IDs
  return sortedArtworks.map((artwork) => artwork.image_id);
}
