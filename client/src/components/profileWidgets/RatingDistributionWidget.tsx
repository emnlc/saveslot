import { useRatingDistribution } from "@/hooks/profileStats";
import { Star } from "lucide-react";

interface Props {
  userId: string;
}

const RatingDistributionWidget = ({ userId }: Props) => {
  const { data: distribution, isLoading } = useRatingDistribution(userId);

  if (isLoading) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Ratings</h2>
        </div>
        <div className="h-32 bg-base-300 animate-pulse" />
      </div>
    );
  }

  if (!distribution) {
    return null;
  }

  const total = Object.values(distribution).reduce(
    (sum, count) => sum + count,
    0
  );

  if (total === 0) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Ratings</h2>
        </div>
        <div className="text-center py-8">
          <Star className="w-10 h-10 mx-auto mb-2 text-base-content/40" />
          <p className="text-sm text-base-content/60">No ratings yet</p>
        </div>
      </div>
    );
  }

  const ratings = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <div className="bg-base-100 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-base-300 mb-3">
        <h2 className="text-lg font-semibold">Ratings</h2>
        <span className="text-xs text-base-content/60">{total}</span>
      </div>

      <div className="relative h-40 mb-8">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full border-t border-base-300/30" />
          ))}
        </div>

        <div className="relative h-full flex items-end justify-between gap-1 px-1">
          {ratings.map((rating) => {
            const count =
              distribution[rating as keyof typeof distribution] || 0;
            const heightPercentage =
              maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div
                key={rating}
                className="flex-1 group relative"
                style={{ height: "100%" }}
              >
                <div className="h-full flex flex-col justify-end">
                  {count > 0 && (
                    <div
                      className="w-full bg-success hover:bg-success/80 transition-all cursor-pointer relative"
                      style={{ height: `${heightPercentage}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 bg-base-100 border border-base-300 px-2 py-1 text-xs whitespace-nowrap z-10 shadow-lg">
                        {rating}★: {count}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute -bottom-6 left-0 right-0 flex justify-between items-center text-xs text-base-content/60 px-1">
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-success text-success" />
            <span className="text-[10px]">0.5</span>
          </span>
          <span className="flex items-center gap-0.5">
            <span className="text-[10px]">5.0</span>
            <Star className="w-3 h-3 fill-success text-success" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default RatingDistributionWidget;
