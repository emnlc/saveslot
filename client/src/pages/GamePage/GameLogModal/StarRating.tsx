import { Star } from "lucide-react";

type Props = {
  rating: number | null;
  hoveredRating: number;
  onRatingChange: (rating: number | null) => void;
  onHover: (rating: number) => void;
  onHoverEnd: () => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
};

const StarRating = ({
  rating,
  hoveredRating,
  onRatingChange,
  onHover,
  onHoverEnd,
  maxRating = 5,
  size = "md",
  readonly = false,
}: Props) => {
  const displayRating = hoveredRating || rating;
  const stars = [];

  const sizeMap = {
    sm: 16,
    md: 32,
    lg: 48,
  };

  const iconSize = sizeMap[size];

  for (let i = 1; i <= maxRating; i++) {
    const isFull = displayRating && displayRating >= i;
    const isHalf =
      displayRating && displayRating >= i - 0.5 && displayRating < i;

    stars.push(
      <div
        key={i}
        className={`relative inline-block ${!readonly ? "cursor-pointer" : ""}`}
      >
        {/* Base star - empty */}
        <Star size={iconSize} className="text-base-300 fill-current" />

        {/* Half star overlay */}
        {isHalf && (
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
          >
            <Star size={iconSize} stroke="#FFD700" fill="#FFD700" />
          </div>
        )}

        {/* Full star overlay */}
        {isFull && (
          <div className="absolute top-0 left-0">
            <Star size={iconSize} stroke="#FFD700" fill="#FFD700" />
          </div>
        )}

        {/* Click areas for half and full - only if not readonly */}
        {!readonly && (
          <div className="absolute inset-0 flex">
            <div
              className="w-1/2 h-full"
              onMouseEnter={() => onHover(i - 0.5)}
              onMouseLeave={onHoverEnd}
              onClick={() => onRatingChange(i - 0.5)}
            />
            <div
              className="w-1/2 h-full"
              onMouseEnter={() => onHover(i)}
              onMouseLeave={onHoverEnd}
              onClick={() => onRatingChange(i)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">{stars}</div>
        <span className="text-sm text-base-content/60">
          {displayRating ? `${displayRating}/${maxRating}` : "No rating"}
        </span>
        {!readonly && rating && (
          <button
            type="button"
            onClick={() => onRatingChange(null)}
            className="text-xs text-base-content/60 hover:text-red-500 underline transition-all cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default StarRating;
