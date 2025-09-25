import { Star } from "lucide-react";

const EmptyReviewsState = () => {
  return (
    <div className="text-center py-12 bg-base-100 rounded-lg border border-base-300">
      <Star className="w-12 h-12 text-base-content/40 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-base-content mb-2">
        No reviews yet
      </h3>
      <p className="text-base-content/60">Be the first to review this game!</p>
    </div>
  );
};

export default EmptyReviewsState;
