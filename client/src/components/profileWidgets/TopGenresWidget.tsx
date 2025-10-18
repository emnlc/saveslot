import { useTopGenres } from "@/hooks/profileStats";
import { Tag } from "lucide-react";

interface Props {
  userId: string;
}

const TopGenresWidget = ({ userId }: Props) => {
  const { data: genres, isLoading } = useTopGenres(userId);

  if (isLoading) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Top Genres</h2>
        </div>
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-base-300" />
          ))}
        </div>
      </div>
    );
  }

  if (!genres || genres.length === 0) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Top Genres</h2>
        </div>
        <div className="text-center py-8">
          <Tag className="w-10 h-10 mx-auto mb-2 text-base-content/40" />
          <p className="text-sm text-base-content/60">No genre data yet</p>
        </div>
      </div>
    );
  }

  const getOpacity = (index: number) => {
    return 1 - index * 0.2; // 1.0, 0.8, 0.6, 0.4, 0.2
  };

  return (
    <div className="bg-base-100 p-4">
      <div className="pb-3 border-b border-base-300 mb-3">
        <h2 className="text-lg font-semibold">Top Genres</h2>
      </div>
      <div className="space-y-2">
        {genres.map((genre, index) => (
          <div
            key={genre.name}
            className="flex items-center justify-between py-2 border-b border-base-300 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span
                className="text-lg font-bold text-secondary w-6 text-center"
                style={{ opacity: getOpacity(index) }}
              >
                {index + 1}
              </span>
              <span className="text-sm font-medium">{genre.name}</span>
            </div>
            <span className="text-sm text-base-content/60">{genre.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopGenresWidget;
