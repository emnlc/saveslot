export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
};

export const getCoverUrl = (coverId: string | null): string => {
  if (!coverId) return "/placeholder-game.png";
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverId}.jpg`;
};

export const getStatusText = (
  status: string,
  isOwnProfile: boolean
): { prefix: string; statusLabel: string } => {
  switch (status.toLowerCase()) {
    case "completed":
      return {
        prefix: isOwnProfile ? "You have" : "has",
        statusLabel: "completed",
      };
    case "playing":
      return {
        prefix: isOwnProfile ? "You have started" : "has started",
        statusLabel: "playing",
      };
    case "plan_to_play":
    case "plan to play":
      return {
        prefix: isOwnProfile ? "You" : "",
        statusLabel: isOwnProfile ? "plan to play" : "plans to play",
      };
    case "dropped":
      return {
        prefix: isOwnProfile ? "You have" : "has",
        statusLabel: "dropped",
      };
    case "on_hold":
    case "on hold":
      return {
        prefix: isOwnProfile ? "You have put on" : "has put on",
        statusLabel: "hold",
      };
    default:
      return {
        prefix: isOwnProfile
          ? "You have updated status for"
          : "has updated status for",
        statusLabel: "",
      };
  }
};
