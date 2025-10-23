import DatePicker from "@/components/controls/DatePicker";

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
          Started Playing
        </label>
        <DatePicker
          value={playStartDate}
          onChange={onPlayStartDateChange}
          placeholder="Select start date"
          allowClear={true}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-base-content mb-2">
          Finished Playing
        </label>
        <DatePicker
          value={playEndDate}
          onChange={onPlayEndDateChange}
          placeholder="Select end date"
          allowClear={true}
        />
      </div>
    </div>
  );
};

export default PlayDatesSection;
