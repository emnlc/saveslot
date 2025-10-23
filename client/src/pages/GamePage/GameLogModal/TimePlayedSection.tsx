import { Clock } from "lucide-react";

type Props = {
  hoursPlayed: number | null;
  minutesPlayed: number | null;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
};

const TimePlayedSection = ({
  hoursPlayed,
  minutesPlayed,
  onHoursChange,
  onMinutesChange,
}: Props) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <div>
        <label className="block text-sm font-medium text-base-content mb-3">
          <Clock className="w-4 h-4 inline mr-1" />
          Time Played
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              value={hoursPlayed ?? ""}
              onChange={(e) => onHoursChange(e.target.value)}
              className="input input-sm focus:outline-none focus:ring-0 focus:input-primary w-20 rounded transition-all"
              placeholder="0"
            />
            <span className="ml-2 text-sm text-base-content/60">hours</span>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              max="59"
              value={minutesPlayed ?? ""}
              onChange={(e) => onMinutesChange(e.target.value)}
              className="input input-sm focus:outline-none focus:ring-0 focus:input-primary w-20 rounded transition-all"
              placeholder="0"
            />
            <span className="ml-2 text-sm text-base-content/60">minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePlayedSection;
