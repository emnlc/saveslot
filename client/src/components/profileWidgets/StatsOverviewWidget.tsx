// components/ProfileWidgets/StatsOverviewWidget.tsx
import { useProfileStats } from "@/hooks/profileStats";
import { Gamepad2, Trophy, Clock, BookMarked } from "lucide-react";

interface Props {
  userId: string;
}

const StatsOverviewWidget = ({ userId }: Props) => {
  const { data: stats, isLoading } = useProfileStats(userId);

  if (isLoading) {
    return (
      <div className="bg-base-100 p-3">
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-base-300" />
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    {
      icon: Gamepad2,
      label: "Games",
      value: stats?.total_games || 0,
      color: "text-primary",
    },
    {
      icon: Trophy,
      label: "Completed",
      value: stats?.completed_games || 0,
      color: "text-success",
    },
    {
      icon: BookMarked,
      label: "Backlog",
      value: stats?.backlog_games || 0,
      color: "text-secondary",
    },
    {
      icon: Clock,
      label: "Hours",
      value: stats?.total_hours_played || 0,
      color: "text-info",
    },
  ];

  return (
    <div className="bg-base-100 p-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center text-center p-2 border border-base-300"
          >
            <div className="flex items-center gap-1 mb-1">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <p className="text-[10px] text-base-content/60 uppercase tracking-wide">
                {item.label}
              </p>
            </div>
            <p className="text-lg font-bold leading-none">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsOverviewWidget;
