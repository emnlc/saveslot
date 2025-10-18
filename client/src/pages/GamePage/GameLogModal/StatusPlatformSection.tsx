import { Game, GameStatus } from "@/Interface";

type Props = {
  gameStatus: GameStatus | null;
  platform: string;
  game: Game;
  onGameStatusChange: (status: GameStatus | null) => void;
  onPlatformChange: (platform: string) => void;
};

const GAME_STATUSES: { value: GameStatus | ""; label: string }[] = [
  { value: "", label: "No status" },
  { value: "completed", label: "Completed" },
  { value: "playing", label: "Playing" },
  { value: "dropped", label: "Dropped" },
  { value: "abandoned", label: "Abandoned" },
];

const StatusPlatformSection = ({
  gameStatus,
  platform,
  game,
  onGameStatusChange,
  onPlatformChange,
}: Props) => {
  return (
    <div className="flex justify-between flex-row gap-4">
      {/* Game Status */}
      <div className="w-full">
        <label
          htmlFor="gameStatusSelect"
          className="block text-sm font-medium text-base-content mb-2"
        >
          Status
        </label>
        <select
          id="gameStatusSelect"
          value={gameStatus || ""}
          onChange={(e) =>
            onGameStatusChange((e.target.value as GameStatus) || null)
          }
          className="select w-full"
        >
          {GAME_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Platform */}
      <div className="w-full">
        <label className="block text-sm font-medium text-base-content mb-2">
          Platform
        </label>
        <select
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">Select platform</option>
          {game.platforms?.map((gamePlatform) => (
            <option key={gamePlatform.id} value={gamePlatform.name}>
              {gamePlatform.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StatusPlatformSection;
