export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;

  display_name: string | null;
  bio: string | null;

  followers: number;
  following: number;
}

export type GameList = {
  id: string;
  user_id: string;
  name: string;
  is_private: boolean;
  created_at: string;
};

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
  summary: string;
  storyline: string;
  rating: number;
  rating_count: number;
  aggregated_rating: number;
  url: string;
  videos: Video[];
  game_type: number;
  genres: [
    {
      id: number;
      name: string;
    },
  ];
  screenshots: [
    {
      id: number;
      image_id: string;
    },
  ];
  tags: number[];
  age_ratings: [
    {
      id: number;
      rating_category: {
        id: number;
        organization: {
          id: number;
          name: string;
        };
        rating: string;
        rating_cover_url: string;
      };
    },
  ];
  websites: [
    {
      id: number;
      url: string;
      type: {
        id: number;
        type: string;
      };
    },
  ];
  collections: [{ games: [Game] }];
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
  abbreviation: string;
  platform_logo: {
    id: number;
    image_id: string;
  };
}
