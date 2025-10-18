import { UserAuth } from "@/context/AuthContext";
import {
  useUserLikes,
  useLikeMutation,
  useUnlikeMutation,
} from "@/hooks/likes";
import { Heart, Loader2 } from "lucide-react";

type Props = {
  targetId: string | number;
  targetType: "game" | "list" | "review";
};

const LikeButton = ({ targetId, targetType }: Props) => {
  const { profile } = UserAuth();
  const userId = profile?.id;

  const { data: likes } = useUserLikes(userId || "");
  const likeMutation = useLikeMutation();
  const unlikeMutation = useUnlikeMutation();

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

  return (
    <>
      <button
        onClick={toggleLike}
        disabled={!profile?.id || isLoading}
        className={`btn btn-primary btn-square btn-sm md:btn-md ${
          isLoading ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-5 md:h-auto animate-spin" />
        ) : (
          <Heart
            fill={isLiked ? "#FFFFFF" : "none"}
            className="h-5 md:h-auto"
          />
        )}
      </button>
    </>
  );
};

export default LikeButton;
