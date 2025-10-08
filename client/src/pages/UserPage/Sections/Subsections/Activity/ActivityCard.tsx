import { Activity } from "@/hooks/UserActivityHooks/useUserActivity";
import { ReviewActivityCard } from "./ReviewActivityCard";
import { StatusActivityCard } from "./StatusActivityCard";
import { ListActivityCard } from "./ListActivityCard";
import { LikeActivityCard } from "./LikeActivityCard";

interface ActivityCardProps {
  activity: Activity;
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  switch (activity.type) {
    case "review":
      return <ReviewActivityCard activity={activity} />;
    case "status":
      return <StatusActivityCard activity={activity} />;
    case "list":
      return <ListActivityCard activity={activity} />;
    case "like":
      return <LikeActivityCard activity={activity} />;
    default:
      return null;
  }
};
