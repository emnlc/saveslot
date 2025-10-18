// components/ProfileWidgets/ActivityHeatmapWidget.tsx
import { useActivityHeatmap } from "@/hooks/profileStats";
import { Calendar } from "lucide-react";

interface Props {
  userId: string;
  compact?: boolean;
}

const ActivityHeatmapWidget = ({ userId, compact = false }: Props) => {
  const { data: heatmapData, isLoading } = useActivityHeatmap(userId);

  if (isLoading) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Activity</h2>
        </div>
        <div className="h-32 bg-base-300 animate-pulse" />
      </div>
    );
  }

  if (!heatmapData) {
    return null;
  }

  const monthsToShow = compact ? 4 : 6;
  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(today.getMonth() - monthsToShow);

  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const maxActivity = Math.max(...Object.values(heatmapData), 1);

  const getActivityLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= maxActivity * 0.33) return 2;
    if (count <= maxActivity * 0.66) return 3;
    return 4;
  };

  const getColorClass = (level: number): string => {
    const colors = [
      "bg-base-300",
      "bg-success/30",
      "bg-success/50",
      "bg-success/75",
      "bg-success",
    ];
    return colors[level];
  };

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  dates.forEach((date) => {
    if (date.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const totalActivity = Object.values(heatmapData).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="bg-base-100 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-base-300 mb-3">
        <h2 className="text-lg font-semibold">Activity</h2>
        <span className="text-xs text-base-content/60">{totalActivity}</span>
      </div>

      {totalActivity === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-base-content/40" />
          <p className="text-sm text-base-content/60">No recent activity</p>
        </div>
      ) : (
        <>
          {/* Centered heatmap container */}
          <div className="flex justify-center pb-2">
            <div className="inline-flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((date) => {
                    const dateKey = date.toISOString().split("T")[0];
                    const count = heatmapData[dateKey] || 0;
                    const level = getActivityLevel(count);

                    return (
                      <div
                        key={dateKey}
                        className={`w-2.5 h-2.5 ${getColorClass(level)} hover:ring-1 hover:ring-success transition-all cursor-pointer`}
                        title={`${dateKey}: ${count} ${count === 1 ? "activity" : "activities"}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-base-content/60">
            <span>Last {monthsToShow} months</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-2.5 h-2.5 ${getColorClass(level)}`}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityHeatmapWidget;
