import { Calendar } from "lucide-react";

type Props = {
  playStartDate: string;
  playEndDate: string;
  onPlayStartDateChange: (date: string) => void;
  onPlayEndDateChange: (date: string) => void;
};

const PlayDatesSection = ({
  playStartDate,
  playEndDate,
  onPlayStartDateChange,
  onPlayEndDateChange,
}: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-base-content mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Started Playing
        </label>
        <input
          type="date"
          value={playStartDate}
          onChange={(e) => onPlayStartDateChange(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-base-content mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Finished Playing
        </label>
        <input
          type="date"
          value={playEndDate}
          onChange={(e) => onPlayEndDateChange(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
};

export default PlayDatesSection;
