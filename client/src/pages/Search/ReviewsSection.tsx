import { Link } from "@tanstack/react-router";
import { FileText, ChevronDown } from "lucide-react";
import { GameLogWithProfile } from "@/Interface";
import { useState } from "react";

interface ReviewsSectionProps {
  reviews: GameLogWithProfile[];
  displayedReviews: GameLogWithProfile[];
  showAll: boolean;
  onLoadMore: () => void;
}

export const ReviewsSection = ({
  reviews,
  displayedReviews,
  showAll,
  onLoadMore,
}: ReviewsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (reviews.length === 0) return null;

  return (
    <section>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left mb-4 hover:text-primary transition-colors group"
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Reviews
          <ChevronDown
            className={`w-5 h-5 ml-auto transition-transform duration-200 group-hover:scale-110 ${isExpanded ? "rotate-180" : ""}`}
          />
        </h2>
      </button>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedReviews.map((review: GameLogWithProfile) => (
              <Link
                key={review.id}
                to="/games/$gamesSlug"
                params={{ gamesSlug: review.game.slug }}
                className="flex gap-4 p-4 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors"
              >
                {review.game.cover_id && (
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${review.game.cover_id}.jpg`}
                    alt={review.game.name}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 truncate">
                    {review.game.name}
                  </h3>
                  <p className="text-sm text-base-content/70 line-clamp-3">
                    {review.review_text}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={
                        review.profile.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.profile.username}`
                      }
                      alt={review.profile.username}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-xs text-base-content/60">
                      @{review.profile.username}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {reviews.length > 6 && (
            <button
              onClick={onLoadMore}
              className="btn btn-neutral btn-sm mt-4"
            >
              {showAll ? "Show Less" : `Load More (${reviews.length - 6} more)`}
            </button>
          )}
        </>
      )}

      <hr className="mt-4 text-base-300" />
    </section>
  );
};
