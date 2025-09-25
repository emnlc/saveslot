import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  reviewText: string;
  containsSpoilers: boolean;
};

const LogItemReview = ({ reviewText, containsSpoilers }: Props) => {
  const [showFullReview, setShowFullReview] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);

  if (!reviewText) return null;

  const shouldTruncateReview = reviewText.length > 300;
  const displayText =
    shouldTruncateReview && !showFullReview
      ? reviewText.slice(0, 300) + "..."
      : reviewText;

  return (
    <div className="mb-4">
      {/* Review Text */}
      <div className={containsSpoilers && !showSpoilers ? "relative" : ""}>
        <p
          className={`text-base-content text-xs md:text-sm whitespace-pre-wrap leading-relaxed ${
            containsSpoilers && !showSpoilers ? "blur-sm select-none" : ""
          }`}
        >
          {displayText}
        </p>

        {/* Overlay for spoiler protection */}
        {containsSpoilers && !showSpoilers && (
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

      {/* Action buttons (only show when spoilers are visible or no spoilers) */}
      {(!containsSpoilers || showSpoilers) && (
        <div className="flex items-center space-x-3 mt-2">
          {/* Read more/less button */}
          {shouldTruncateReview && (
            <button
              onClick={() => setShowFullReview(!showFullReview)}
              className="btn btn-sm text-primary hover:text-primary-focus font-medium"
            >
              {showFullReview ? "Show less" : "Read more"}
            </button>
          )}

          {/* Hide spoilers button */}
          {containsSpoilers && showSpoilers && (
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
  );
};

export default LogItemReview;
