import { UserAuth } from "@/context/AuthContext";
import { useUserLikes } from "@/hooks/UserLikeHooks/useUserLikesQuery";
import { useLikeMutation } from "@/hooks/UserLikeHooks/useLikeMutation";
import { useUnlikeMutation } from "@/hooks/UserLikeHooks/useUnlikeMutation";
import { Heart, Loader2 } from "lucide-react";

type Props = {
  targetId: string;
  targetType: "game" | "list" | "review";
};

const LikeButton = ({ targetId, targetType }: Props) => {
  const { profile } = UserAuth();
  const userId = profile?.id;

  const { data: likes } = useUserLikes(userId || "");
  const likeMutation = useLikeMutation(userId || "");
  const unlikeMutation = useUnlikeMutation(userId || "");

  const isLiked = likes?.some(
    (l) => l.target_id === targetId && l.target_type === targetType
  );

  const isLoading = likeMutation.isPending || unlikeMutation.isPending;

  const toggleLike = () => {
    if (isLoading) return;

    if (isLiked) {
      unlikeMutation.mutate({ target_type: targetType, target_id: targetId });
    } else {
      likeMutation.mutate({
        user_id: userId || "",
        target_type: targetType,
        target_id: targetId,
      });
    }
  };

  return (
    <>
      <button
        onClick={toggleLike}
        disabled={isLoading}
        className={`btn btn-primary btn-square btn-sm md:btn-md ${
          isLoading ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-5 md:h-auto animate-spin" />
        ) : (
          <Heart
            fill={isLiked ? "#FFFFFF" : "none"}
            stroke="white"
            className="h-5 md:h-auto"
          />
        )}
      </button>
    </>
  );
};

export default LikeButton;
