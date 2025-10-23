type Props = {
  stats: {
    total_logs: number;
    average_rating: number;
    completion_rate: number;
    recent_activity: number;
    average_completion_time: string | null;
    rating_distribution: Record<string, number>;
  };
};

const RatingStatsCard = ({ stats }: Props) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 3.5) return "text-green-500";
    if (rating >= 2) return "text-yellow-500";
    return "text-red-500";
  };

  const calculateRatingCounts = () => {
    const high = Object.entries(stats.rating_distribution)
      .filter(([rating]) => parseFloat(rating) >= 3.5)
      .reduce((sum, [, count]) => sum + count, 0);

    const mid = Object.entries(stats.rating_distribution)
      .filter(([rating]) => parseFloat(rating) >= 2 && parseFloat(rating) < 3.5)
      .reduce((sum, [, count]) => sum + count, 0);

    const low = Object.entries(stats.rating_distribution)
      .filter(([rating]) => parseFloat(rating) < 2)
      .reduce((sum, [, count]) => sum + count, 0);

    return { high, mid, low };
  };

  const ratingCounts = calculateRatingCounts();

  return (
    <div className="bg-base-100 rounded border border-base-300 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Community Rating</h3>
        <span className="text-sm text-base-content/60">
          {stats.total_logs} rating{stats.total_logs !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center space-x-4 md:space-x-8">
        {/* Circular Rating Display */}
        <div className="relative flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-base-300"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(stats.average_rating / 5) * 283} 283`}
              className={`transition-all duration-500 ${getRatingColor(stats.average_rating)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-base-content">
                {stats.average_rating.toFixed(1)}
              </div>
              <div className="text-xs text-base-content/60">out of 5</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 space-y-4">
          {/* Community Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-base-content/70">Completion Rate:</span>
              <span className="font-medium text-base-content">
                {stats.completion_rate}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-base-content/70">This Month:</span>
              <span className="font-medium text-base-content">
                {stats.recent_activity} rating
                {stats.recent_activity !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-base-content/70">
                Avg. Completion Time:
              </span>
              <span className="font-medium text-base-content">
                {stats.average_completion_time || "N/A"}
              </span>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="pt-2 border-t border-base-300">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-base-content/70">
                  High: {ratingCounts.high}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-base-content/70">
                  Mid: {ratingCounts.mid}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-base-content/70">
                  Low: {ratingCounts.low}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingStatsCard;
