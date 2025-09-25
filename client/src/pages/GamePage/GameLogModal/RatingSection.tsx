import StarRating from "./StarRating";

type Props = {
  rating: number | null;
  hoveredRating: number;
  onRatingChange: (rating: number | null) => void;
  onHover: (rating: number) => void;
  onHoverEnd: () => void;
};

const RatingSection = ({
  rating,
  hoveredRating,
  onRatingChange,
  onHover,
  onHoverEnd,
}: Props) => {
  return (
    <div>
      <label className="block text-sm font-medium text-base-content mb-3">
        Rating
      </label>
      <StarRating
        rating={rating}
        hoveredRating={hoveredRating}
        onRatingChange={onRatingChange}
        onHover={onHover}
        onHoverEnd={onHoverEnd}
        maxRating={5}
        size="md"
      />
    </div>
  );
};

export default RatingSection;
