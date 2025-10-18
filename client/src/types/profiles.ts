export interface WidgetConfig {
  id: string;
  order: number;
  enabled: boolean;
}

export type ProfileLayout = {
  [key: string]: boolean;
};

export interface UpdateProfileParams {
  userId: string;
  display_name?: string;
  bio?: string | null;
  avatar_url?: string;
  banner_url?: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
  followers: number;
  following: number;
  is_following: boolean;
}
