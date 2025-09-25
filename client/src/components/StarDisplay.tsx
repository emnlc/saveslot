import { Star } from "lucide-react";

type StarDisplayProps = {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const StarDisplay = ({
  rating,
  maxRating = 5,
  size = "md",
  className = "",
}: StarDisplayProps) => {
  const sizeMap = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  const iconSize = sizeMap[size];

  return (
    <div className={`flex items-center space-x-0.5 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFull = rating >= starValue;
        const isHalf = !isFull && rating >= starValue - 0.5;

        return (
          <div key={i} className="relative">
            {/* Background (empty) star */}
            <Star size={iconSize} className="text-base-300 fill-current" />
            {/* Foreground (filled) star */}
            {(isFull || isHalf) && (
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: isFull ? "100%" : "50%" }}
              >
                <Star
                  size={iconSize}
                  className="text-yellow-400 fill-current"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StarDisplay;
