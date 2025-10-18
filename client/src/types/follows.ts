export interface FollowStats {
  followers: number;
  following: number;
}

export interface FollowProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  followed_at: string;
}

export interface FollowParams {
  follower_id: string;
  following_id: string;
}
