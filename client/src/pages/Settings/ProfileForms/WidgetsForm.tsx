import { useProfileLayout, useUpdateProfileLayout } from "@/hooks/profiles";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import type { AuthProfile } from "@/context/AuthContext";

type Props = {
  profile: AuthProfile;
};

const WIDGETS = [
  { id: "stats", name: "Stats Overview" },
  { id: "favorites", name: "Favorite Games" },
  { id: "currently_playing", name: "Currently Playing" },
  { id: "recent_reviews", name: "Recent Reviews" },
  { id: "heatmap", name: "Activity Heatmap" },
  { id: "rating_distribution", name: "Rating Distribution" },
  { id: "popular_lists", name: "Popular Lists" },
  { id: "top_platforms", name: "Top Platforms" },
  { id: "top_genres", name: "Top Genres" },
];

const WidgetsForm = ({ profile }: Props) => {
  const { data: layout, isLoading } = useProfileLayout(profile.id);
  const updateLayoutMutation = useUpdateProfileLayout();

  const [widgetStates, setWidgetStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (layout) {
      setWidgetStates(layout);
    }
  }, [layout]);

  const handleToggle = (widgetId: string) => {
    setWidgetStates((prev) => ({
      ...prev,
      [widgetId]: !prev[widgetId],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateLayoutMutation.mutateAsync({
        userId: profile.id,
        layout: widgetStates,
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving widget settings:", error);
    }
  };

  const canSave = hasChanges && !updateLayoutMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm">Profile Widgets</label>
        <div className="space-y-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-12 bg-base-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-between w-full items-center">
        <label className="text-sm">Profile Widgets</label>
      </div>
      <p className="text-xs text-base-content/60">
        Choose which widgets to display on your profile
      </p>

      <div className="flex flex-col gap-1 mt-2">
        {WIDGETS.map((widget) => (
          <label
            key={widget.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
          >
            <span className="text-sm font-medium">{widget.name}</span>
            <input
              type="checkbox"
              checked={widgetStates[widget.id] ?? true}
              onChange={() => handleToggle(widget.id)}
              className="toggle toggle-primary"
            />
          </label>
        ))}
      </div>

      {canSave && (
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="btn btn-primary btn-sm"
        >
          <Save className="w-4 h-4" />
          {updateLayoutMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      )}
    </div>
  );
};

export default WidgetsForm;
