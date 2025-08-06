import { useEffect, useState } from "react";
import { UserProfile } from "@/context/ProfileContext";
import { UserAuth } from "@/context/AuthContext";

interface FollowButtonProps {
  userId: string;
  onFollowChange?: () => void;
}

const FollowButton = ({ userId, onFollowChange }: FollowButtonProps) => {
  const { followUser, unfollowUser, checkIfFollowing } = UserProfile();
  const { profile } = UserAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!profile?.id || profile.id === userId) {
        setCheckingStatus(false);
        return;
      }

      const result = await checkIfFollowing(userId);
      setIsFollowing(result.isFollowing);
      setCheckingStatus(false);
    };

    checkStatus();
  }, [userId, profile?.id, checkIfFollowing]);

  const handleFollowToggle = async () => {
    setLoading(true);

    try {
      let result;
      if (isFollowing) {
        result = await unfollowUser(userId);
      } else {
        result = await followUser(userId);
      }

      if (result.success) {
        setIsFollowing(!isFollowing);
        // Call the callback to refresh the viewed profile's stats
        if (onFollowChange) {
          onFollowChange();
        }
      } else {
        console.error("Follow/unfollow error:", result.error);
        // You might want to show a toast or error message here
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if not authenticated or if it's the user's own profile
  if (!profile?.id || profile.id === userId) {
    return null;
  }

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
