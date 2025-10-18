import { UserAuth } from "@/context/AuthContext";
import {
  useRemoveGameStatus,
  useUpdateGameStatus,
  useGameStatus,
} from "@/hooks/userGames";
import type { GameStatus } from "@/types/userGames";
import {
  Gamepad2,
  Library,
  Trash,
  Gift,
  Play,
  Check,
  Ban,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

type Props = {
  gameId: number;
  released: boolean;
};

const GameStatusRadio = ({ gameId, released }: Props) => {
  const { profile } = UserAuth();
  const userId = profile?.id;
  const [showSpecial, setShowSpecial] = useState(false);

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
        setShowSpecial(false);
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
        setShowSpecial(false);
      } catch (error) {
        console.error("Failed to update game status:", error);
      }
    }
  };

  const isUpdating =
    updateStatusMutation.isPending || removeStatusMutation.isPending;

  const normalStatuses = [
    { key: "played" as const, label: "Played", icon: Gamepad2 },
    { key: "playing" as const, label: "Playing", icon: Play },
    { key: "backlog" as const, label: "Backlog", icon: Library },
    { key: "wishlist" as const, label: "Wishlist", icon: Gift },
    { key: "dropped" as const, label: "Dropped", icon: Trash },
  ];

  const specialStatuses = [
    {
      key: "completed" as const,
      label: "Completed",
      icon: Check,
      color: "success",
    },
    {
      key: "abandoned" as const,
      label: "Abandoned",
      icon: Ban,
      color: "error",
    },
  ];

  const isDisabled = !userId || isUpdating || statusLoading;

  const currentSpecialStatus = specialStatuses.find(
    (s) => s.key === gameStatus?.status
  );

  // If game has special status, show only that status
  if (currentSpecialStatus) {
    const Icon = currentSpecialStatus.icon;
    const isCompletedStatus = currentSpecialStatus.key === "completed";

    return (
      <div
        className="flex flex-row justify-center md:justify-start gap-6 "
        role="radiogroup"
        aria-label="Game status"
      >
        <button
          role="radio"
          aria-checked={true}
          onClick={() => handleStatusClick(currentSpecialStatus.key)}
          disabled={isDisabled}
          className={`flex flex-col items-center transition-all ${
            isDisabled ? "opacity-50" : "cursor-pointer"
          } ${isCompletedStatus ? "text-success" : "text-error"}`}
        >
          <Icon
            strokeWidth={2}
            size={32}
            className={isCompletedStatus ? "fill-success/20" : "fill-error/20"}
          />
          <span className="text-xs">{currentSpecialStatus.label}</span>
        </button>
      </div>
    );
  }

  const statuses = released
    ? normalStatuses
    : normalStatuses.filter(
        (status) => status.key === "wishlist" || status.key === "backlog"
      );

  const renderStatusButton = (
    status: (typeof normalStatuses)[0] | (typeof specialStatuses)[0],
    isSpecial = false
  ) => {
    const Icon = status.icon;
    const selected = gameStatus?.status === status.key;
    const isSuccess = "color" in status && status.color === "success";
    const isError = "color" in status && status.color === "error";

    return (
      <button
        key={status.key}
        role="radio"
        aria-checked={selected}
        onClick={() => handleStatusClick(status.key)}
        disabled={isDisabled}
        className={`flex flex-col items-center transition-all ${
          selected && isSpecial
            ? isSuccess
              ? "text-success"
              : isError
                ? "text-error"
                : "text-accent"
            : selected
              ? "text-accent"
              : "text-base-content/60"
        } ${isDisabled ? "opacity-50" : "cursor-pointer hover:text-accent"}`}
      >
        <Icon
          strokeWidth={2}
          size={32}
          className={
            selected && isSpecial
              ? isSuccess
                ? "fill-success/20"
                : isError
                  ? "fill-error/20"
                  : "fill-accent/20"
              : selected
                ? "fill-accent/20"
                : ""
          }
        />
        <span className="text-xs">{status.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Desktop: Horizontal with hover slide-in */}
      <div
        className="hidden md:flex flex-row justify-start items-center gap-6"
        role="radiogroup"
        aria-label="Game status"
      >
        {statuses.map((status) => renderStatusButton(status))}

        {/* Only show chevron and special statuses if game is released */}
        {released && (
          <div className="relative flex items-center gap-6">
            {/* Expand Indicator - Only this triggers the hover */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowSpecial(true)}
              onMouseLeave={() => setShowSpecial(false)}
            >
              <div
                className={`flex items-center transition-all duration-200 ${
                  showSpecial ? "opacity-100" : "opacity-40"
                }`}
              >
                <ChevronRight
                  className={`w-4 h-4 text-base-content/60 transition-transform duration-200 ${
                    showSpecial ? "translate-x-1" : ""
                  }`}
                />
              </div>

              {/* Special Statuses - Slide in from right */}
              <div
                className={`absolute left-6 flex gap-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  showSpecial
                    ? "max-w-[200px] opacity-100"
                    : "max-w-0 opacity-0"
                }`}
              >
                {specialStatuses.map((status) =>
                  renderStatusButton(status, true)
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Vertical with dropdown */}
      <div className="md:hidden flex flex-col items-center gap-4">
        <div
          className="flex flex-row justify-center gap-6"
          role="radiogroup"
          aria-label="Game status"
        >
          {statuses.map((status) => renderStatusButton(status))}
        </div>

        {/* Only show "More options" button if game is released */}
        {released && (
          <>
            <button
              onClick={() => setShowSpecial(!showSpecial)}
              disabled={isDisabled}
              className="flex items-center gap-2 text-sm text-base-content/60 hover:text-base-content transition-colors"
            >
              <span>More options</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showSpecial ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`flex flex-row justify-center gap-6 overflow-hidden transition-all duration-300 ease-in-out ${
                showSpecial ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {specialStatuses.map((status) =>
                renderStatusButton(status, true)
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default GameStatusRadio;
