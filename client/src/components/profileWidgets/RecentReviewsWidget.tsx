// components/ProfileWidgets/RecentReviewsWidget.tsx
import { useRecentReviews } from "@/hooks/profileStats";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquare } from "lucide-react";
import StarDisplay from "@/components/content/StarDisplay";

interface Props {
  userId: string;
  username?: string;
}

const RecentReviewsWidget = ({ userId, username }: Props) => {
  const { data: reviews, isLoading } = useRecentReviews(userId, 3);

  if (isLoading) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Recent Reviews</h2>
        </div>
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-base-300" />
          ))}
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Recent Reviews</h2>
        </div>
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 text-base-content/40" />
          <p className="text-sm text-base-content/60">No reviews yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-base-300 mb-3">
        <h2 className="text-lg font-semibold">Recent Reviews</h2>
        {username && (
          <Link
            to="/u/$username/reviews"
            params={{ username }}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            See all
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div>
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className={`py-3 ${index !== reviews.length - 1 ? "border-b border-base-300" : ""}`}
          >
            <div className="flex items-start gap-3 mb-2">
              {review.game?.cover_id && (
                <Link
                  to="/games/$gamesSlug"
                  params={{ gamesSlug: review.game.slug }}
                >
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${review.game.cover_id}.jpg`}
                    alt={review.game.name}
                    className="w-12 h-16 object-cover rounded"
                  />
                </Link>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <Link
                  to="/games/$gamesSlug"
                  params={{ gamesSlug: review.game?.slug || "" }}
                  className="font-semibold hover:text-primary transition-colors line-clamp-1 self-start"
                >
                  {review.game?.name}
                </Link>
                {/* Rating and Date inline */}
                <div className="flex items-center gap-2 mt-1">
                  <StarDisplay rating={review.rating!} size="sm" />
                  <span className="text-xs text-base-content/60">
                    {review.rating}/5
                  </span>
                  <span className="text-xs text-base-content/60">•</span>
                  <span className="text-xs text-base-content/60">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {/* Review text with line clamp */}
            <p className="text-sm text-base-content/80 line-clamp-2">
              {review.review_text}
            </p>

            <Link
              to="/u/$username/reviews"
              params={{ username: review.profile?.username || "" }}
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-2 w-fit"
            >
              See full review <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReviewsWidget;
