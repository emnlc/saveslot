// components/FollowButton.tsx
import { UserAuth } from "@/context/AuthContext";
import { useFollowUser, useUnfollowUser } from "@/hooks/follows";
import type { Profile } from "@/types/profiles";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

interface FollowButtonProps {
  userId: string;
  onFollowChange?: () => void; // Optional callback for legacy support
}

const FollowButton = ({ userId, onFollowChange }: FollowButtonProps) => {
  const { profile } = UserAuth();
  const queryClient = useQueryClient();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Get username from URL params to access cached profile data
  const { username } = useParams({ strict: false });

  // Don't show button if not authenticated or if it's the user's own profile
  if (!profile?.id || profile.id === userId) {
    return null;
  }

  // Get the viewed profile from cache to check is_following status
  const viewedProfile = queryClient.getQueryData<Profile>([
    "profile",
    username,
    profile.id,
  ]);

  const isFollowing = viewedProfile?.is_following ?? false;
  const checkingStatus = !viewedProfile;

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync({
          follower_id: profile.id,
          following_id: userId,
        });
      } else {
        await followMutation.mutateAsync({
          follower_id: profile.id,
          following_id: userId,
        });
      }

      // Call optional callback
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error);
    }
  };

  const loading = followMutation.isPending || unfollowMutation.isPending;

  if (checkingStatus) {
    return (
      <button
        className="btn btn-sm bg-secondary text-secondary-content"
        disabled
      >
        <span className="loading loading-spinner loading-xs"></span>
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`btn btn-sm ${
        isFollowing
          ? "bg-base-300 text-base-content hover:bg-error hover:text-error-content"
          : "bg-secondary text-secondary-content hover:bg-secondary/80"
      }`}
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : isFollowing ? (
        "Unfollow"
      ) : (
        "Follow"
      )}
    </button>
  );
};

export default FollowButton;
