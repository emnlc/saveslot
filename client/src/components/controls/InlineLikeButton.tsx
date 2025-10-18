import { UserAuth } from "@/context/AuthContext";
import {
  useUserLikes,
  useLikeMutation,
  useUnlikeMutation,
  useGameLikeCount,
  useListLikeCount,
  useReviewLikeCount,
} from "@/hooks/likes";
import { Heart, Loader2 } from "lucide-react";

type Props = {
  targetId: string | number;
  targetType: "game" | "list" | "review";
};

const InlineLikeButton = ({ targetId, targetType }: Props) => {
  const { profile } = UserAuth();
  const userId = profile?.id;

  const { data: likes } = useUserLikes(userId || "");
  const likeMutation = useLikeMutation();
  const unlikeMutation = useUnlikeMutation();

  // Get like count based on target type
  const { data: gameLikeCount } = useGameLikeCount(
    targetType === "game" ? targetId : ""
  );
  const { data: listLikeCount } = useListLikeCount(
    targetType === "list" ? targetId.toString() : ""
  );
  const { data: reviewLikeCount } = useReviewLikeCount(
    targetType === "review" ? targetId.toString() : ""
  );

  const likeCount =
    targetType === "game"
      ? gameLikeCount
      : targetType === "list"
        ? listLikeCount
        : reviewLikeCount;

  const isLiked = likes?.some((l) => {
    if (targetType === "game") {
      return l.target_type === "game" && l.game_id === Number(targetId);
    } else if (targetType === "list") {
      return l.target_type === "list" && l.list_id === targetId.toString();
    } else if (targetType === "review") {
      return l.target_type === "review" && l.review_id === targetId.toString();
    }
    return false;
  });

  const isLoading = likeMutation.isPending || unlikeMutation.isPending;

  const toggleLike = () => {
    if (isLoading || !userId) return;

    if (isLiked) {
      unlikeMutation.mutate({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
      });
    } else {
      likeMutation.mutate({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
      });
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center space-x-1 text-base-content/60">
        <Heart className="w-4 h-4" />
        <span className="text-sm">
          {likeCount || 0} {likeCount === 1 ? "like" : "likes"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={toggleLike}
        disabled={isLoading}
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-base-content/60" />
        ) : (
          <Heart
            className={`w-4 h-4 transition-all duration-200 cursor-pointer ${
              isLiked
                ? "fill-primary stroke-primary"
                : "stroke-base-content/60 hover:fill-primary hover:stroke-primary"
            }`}
          />
        )}
      </button>
      <span className="text-sm text-base-content/60">
        {likeCount || 0} {likeCount === 1 ? "like" : "likes"}
      </span>
    </div>
  );
};

export default InlineLikeButton;
