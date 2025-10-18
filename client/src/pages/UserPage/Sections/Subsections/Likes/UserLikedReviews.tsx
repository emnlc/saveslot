import { useState } from "react";
import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import { useUserLikedReviews, useReviewLikeCount } from "@/hooks/likes";
import type { LikedReview } from "@/types/likes";
import { Link, useParams } from "@tanstack/react-router";
import { Heart, User, Calendar, Eye, EyeOff } from "lucide-react";
import StarDisplay from "@/components/content/StarDisplay";

const ReviewItem = ({ review }: { review: LikedReview }) => {
  const [showFullReview, setShowFullReview] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const { data: likeCount } = useReviewLikeCount(review.id);

  const shouldTruncateReview =
    review.review_text && review.review_text.length > 200;
  const displayText =
    shouldTruncateReview && !showFullReview
      ? review.review_text!.slice(0, 200) + "..."
      : review.review_text;

  return (
    <div className="group bg-base-100 rounded-xl border border-base-300 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-shrink-0">
            <Link
              to="/games/$gamesSlug"
              params={{ gamesSlug: review.game?.slug || "" }}
              className="block overflow-hidden"
            >
              {review.game?.cover_id ? (
                <img
                  src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${review.game.cover_id}.jpg`}
                  alt={`${review.game.name} cover`}
                  className="w-12 h-16 rounded object-cover"
                />
              ) : (
                <div className="w-16 h-20 sm:w-20 sm:h-24 bg-base-300 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-base-content/50">No Cover</span>
                </div>
              )}
            </Link>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
              <div className="flex-1 min-w-0">
                <Link
                  to="/games/$gamesSlug"
                  params={{ gamesSlug: review.game?.slug || "" }}
                  className="text-lg font-semibold text-base-content hover:text-primary transition-colors block w-fit"
                >
                  {review.game?.name}
                </Link>
                {review.rating && (
                  <div className="flex items-center gap-2 mt-1">
                    <StarDisplay rating={review.rating} size="sm" />
                    <span className="text-sm text-base-content/60">
                      {review.rating}/5
                    </span>
                  </div>
                )}
              </div>
              {review.game_status && (
                <span className="px-2 py-1 bg-base-200 text-base-content/70 rounded-full text-xs font-medium capitalize self-start sm:self-auto">
                  {review.game_status.replace("_", " ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {review.review_text && (
          <div className="mb-4">
            <div
              className={
                review.contains_spoilers && !showSpoilers ? "relative" : ""
              }
            >
              <p
                className={`text-xs md:text-sm text-base-content whitespace-pre-wrap leading-relaxed ${
                  review.contains_spoilers && !showSpoilers
                    ? "blur-sm select-none"
                    : ""
                }`}
              >
                {displayText}
              </p>
              {review.contains_spoilers && !showSpoilers && (
                <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                  <button
                    onClick={() => setShowSpoilers(true)}
                    className="btn btn-outline btn-sm text-warning border-warning hover:bg-warning hover:text-warning-content"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Click to reveal spoilers
                  </button>
                </div>
              )}
            </div>
            {(!review.contains_spoilers || showSpoilers) && (
              <div className="flex flex-wrap items-center gap-2 sm:space-x-3 sm:gap-0 mt-3">
                {shouldTruncateReview && (
                  <button
                    onClick={() => setShowFullReview(!showFullReview)}
                    className="btn btn-sm text-primary hover:text-primary-focus font-medium"
                  >
                    {showFullReview ? "Show less" : "Read more"}
                  </button>
                )}
                {review.contains_spoilers && showSpoilers && (
                  <button
                    onClick={() => setShowSpoilers(false)}
                    className="btn btn-ghost btn-sm text-warning hover:bg-warning/10"
                  >
                    <EyeOff className="w-3 h-3 mr-1" />
                    Hide spoilers
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-3 border-t border-base-300">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-base-content/60">
            <div className="flex items-center gap-2">
              {review.profile?.avatar_url ? (
                <img
                  src={review.profile.avatar_url}
                  alt={review.profile.username}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 bg-base-300 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
              )}
              <Link
                to="/u/$username"
                params={{ username: review.profile?.username || "" }}
                className="hover:text-base-content transition-colors font-medium"
              >
                {review.profile?.display_name || review.profile?.username}
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 fill-red-500 text-red-500" />
              <span>{likeCount || 0} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs sm:text-sm">
                Liked {new Date(review.liked_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserLikedReviews = () => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const isOwnProfile = currentUser?.id === viewedProfile?.id;

  const { data, isLoading, isError, error } = useUserLikedReviews(
    viewedProfile?.id || ""
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-base-content/60">Loading liked reviews...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <div className="text-error mb-4"></div>
        <h3 className="text-lg font-semibold mb-2 text-error">
          Failed to load
        </h3>
        <p className="text-base-content/60">
          {error instanceof Error
            ? error.message
            : "Unable to load liked reviews. Please try again."}
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12 bg-base-100 rounded-lg border border-base-300">
          <h3 className="text-lg font-semibold mb-2">No liked reviews yet</h3>
          <p className="text-base-content/60">
            {isOwnProfile
              ? "Reviews you like will appear here!"
              : `${viewedProfile?.display_name} hasn't liked any reviews yet.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((review) => (
        <ReviewItem key={review.like_id} review={review} />
      ))}
    </div>
  );
};

export default UserLikedReviews;
