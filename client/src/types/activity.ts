export interface Game {
  id: string;
  name: string;
  cover_id: string | null;
  slug: string;
}

export interface ReviewActivity {
  id: string;
  type: "review";
  timestamp: string;
  data: {
    reviewId: string;
    rating: number;
    reviewText: string;
    containsSpoilers: boolean;
    game: Game;
  };
}

export interface StatusActivity {
  id: string;
  type: "status";
  timestamp: string;
  data: {
    status: string;
    game: Game;
  };
}

export interface ListActivity {
  id: string;
  type: "list";
  timestamp: string;
  data: {
    listId: string;
    name: string;
    slug: string;
    gameCount: number;
  };
}

export interface LikeActivity {
  id: string;
  type: "like";
  timestamp: string;
  data: {
    targetType: "game" | "review" | "list";
    game?: Game;
    review?: {
      id: string;
      game_id: string;
      games: Game;
    };
    list?: {
      id: string;
      name: string;
      slug: string;
      user_id?: string;
      users?: {
        id: string;
        username: string;
        display_name: string;
        avatar_url: string | null;
      };
    };
  };
}

export type Activity =
  | ReviewActivity
  | StatusActivity
  | ListActivity
  | LikeActivity;

export interface UserActivityResponse {
  activities: Activity[];
}
