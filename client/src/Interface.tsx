export interface Game {
  id: number;
  name: string;
  cover: {
    id: string;
    image_id: string;
  };
  first_release_date: number;
  slug: string;
  involved_companies: InvolvedCompanies[];
  platforms: Platforms[];
  artworks: Artwork[];

  rating: number;
  rating_count: number;
  aggregated_rating: number;
  url: string;
  videos: Video[];
}

interface Video {
  id: number;
  video_id: string;
  name: string;
  checksum: unknown;
}

interface Artwork {
  id: number;
  image_id: string;
}

interface InvolvedCompanies {
  company: {
    id: number;
    name: string;
  };
  developer: boolean;
  id: number;
  publisher: boolean;
}

interface Platforms {
  id: number;
  name: string;
}
