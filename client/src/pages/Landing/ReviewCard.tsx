import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { GameLogWithProfile } from "@/Interface";

interface ReviewCardProps {
  review: GameLogWithProfile & { like_count?: number };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <Link
      to={`/u/$username/reviews`}
      params={{ username: review.profile.username }}
      className="group duration-200 flex flex-col border border-base-300 rounded p-2 md:p-4 hover:border-primary transition-all cursor-pointer h-full"
    >
      <div className="flex gap-3">
        {/* Game Cover - Smaller */}
        {review.game.cover_id && (
          <div className="flex-shrink-0">
            <img
              src={`https://images.igdb.com/igdb/image/upload/t_cover_med/${review.game.cover_id}.jpg`}
              alt={review.game.name}
              className="w-20 object-cover rounded"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* User Info - Compact */}
          <div className="flex items-center gap-2 mb-2">
            <img
              src={
                review.profile.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.profile.username}`
              }
              alt={review.profile.display_name || review.profile.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium truncate">
              {review.profile.display_name || review.profile.username}
            </span>
          </div>

          {/* Game Name & Rating + Likes */}
          <div className="mb-2">
            <h3 className="group-hover:text-primary transition-colors font-semibold text-sm truncate mb-1">
              {review.game.name}
            </h3>

            <div className="flex flex-row gap-1">
              {/* Rating */}
              {review.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="text-xs font-medium">{review.rating}/5</span>
                </div>
              )}
              <span className="text-base-content/60">•</span>
              {/* Likes */}
              <div className="flex items-center gap-1 text-xs text-base-content/80">
                <Heart className="w-3 fill-base-content/60" stroke="0" />
                <span>{review.like_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Review Text - Truncated */}
          {review.review_text && (
            <p className="text-xs text-base-content/70 line-clamp-2 mb-2">
              {review.review_text}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ReviewCard;
