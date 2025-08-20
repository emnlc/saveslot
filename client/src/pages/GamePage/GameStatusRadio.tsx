import { UserAuth } from "@/context/AuthContext";
import {
  useRemoveGameStatus,
  useUpdateGameStatus,
} from "@/hooks/GameStatusHooks/useGameStatusMutation";
import {
  GameStatus,
  useGameStatus,
} from "@/hooks/GameStatusHooks/useGameStatusQuery";

import { Gamepad2, Library, Trash, Gift, Play } from "lucide-react";

type Props = {
  gameId: number;
};

const GameStatusRadio = ({ gameId }: Props) => {
  const { profile } = UserAuth();
  const userId = profile?.id;

  const { data: gameStatus, isLoading: statusLoading } = useGameStatus(
    userId || "",
    gameId
  );
  const updateStatusMutation = useUpdateGameStatus();
  const removeStatusMutation = useRemoveGameStatus();

  const handleStatusClick = async (status: GameStatus) => {
    if (!userId) {
      alert("Please log in to track games");
      return;
    }

    if (gameStatus?.status === status) {
      try {
        await removeStatusMutation.mutateAsync({
          userId,
          gameId: gameId,
        });
      } catch (error) {
        console.error("Failed to remove game:", error);
        alert("Failed to remove game. Please try again.");
      }
    } else {
      try {
        await updateStatusMutation.mutateAsync({
          userId,
          gameId: gameId,
          status,
        });
      } catch (error) {
        console.error("Failed to update game status:", error);
      }
    }
  };

  const isUpdating =
    updateStatusMutation.isPending || removeStatusMutation.isPending;

  const statuses = [
    { key: "played", label: "Played", icon: Gamepad2 },
    { key: "playing", label: "Playing", icon: Play },
    { key: "backlog", label: "Backlog", icon: Library },
    { key: "wishlist", label: "Wishlist", icon: Gift },
    { key: "dropped", label: "Dropped", icon: Trash },
  ] as const;

  return (
    <div
      className="flex flex-row justify-center md:justify-start gap-6"
      role="radiogroup"
      aria-label="Game status"
    >
      {statuses.map((status) => {
        const Icon = status.icon;
        const selected = gameStatus?.status === status.key;

        return (
          <button
            key={status.key}
            role="radio"
            aria-checked={selected}
            onClick={() => handleStatusClick(status.key)}
            disabled={isUpdating || statusLoading}
            className={`cursor-pointer flex flex-col items-center transition-all ${
              selected ? "text-primary" : "text-base-content/60"
            } ${isUpdating ? "opacity-50 cursor-not-allowed" : "hover:text-primary"}`}
          >
            <Icon
              strokeWidth={2}
              size={32}
              className={`${selected ? "fill-primary/20" : ""}`}
            />
            <span className="text-xs">{status.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default GameStatusRadio;
