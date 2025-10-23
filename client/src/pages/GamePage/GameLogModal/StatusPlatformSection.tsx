import { Game, GameStatus } from "@/Interface";
import Select from "@/components/controls/Select";

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
    <div className="flex justify-between flex-col md:flex-row gap-4">
      {/* Game Status */}
      <div className="w-full">
        <Select
          label="Status"
          options={GAME_STATUSES}
          value={gameStatus || ""}
          onChange={(value) =>
            onGameStatusChange((value as GameStatus) || null)
          }
          placeholder="Select status"
        />
      </div>

      {/* Platform */}
      <div className="w-full">
        <Select
          label="Platform"
          options={[
            { value: "", label: "Select platform" },
            ...(game.platforms?.map((gamePlatform) => ({
              value: gamePlatform.name,
              label: gamePlatform.name,
            })) || []),
          ]}
          value={platform}
          onChange={(value) => onPlatformChange(value as string)}
          placeholder="Select platform"
        />
      </div>
    </div>
  );
};

export default StatusPlatformSection;
