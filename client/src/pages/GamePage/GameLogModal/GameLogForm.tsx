import { Game, GameStatus } from "@/Interface";
import RatingSection from "./RatingSection";
import TimePlayedSection from "./TimePlayedSection";
import StatusPlatformSection from "./StatusPlatformSection";
import PlayDatesSection from "./PlayDatesSection";
import ReviewSection from "./ReviewSection";

type Props = {
  game: Game;
  formData: {
    rating: number | null;
    reviewText: string;
    gameStatus: GameStatus | null;
    playStartDate: string;
    playEndDate: string;
    hoursPlayed: number | null;
    minutesPlayed: number | null;
    hoveredRating: number;
    platform: string;
    containsSpoilers: boolean;
  };
  onFormDataChange: {
    setRating: (rating: number | null) => void;
    setReviewText: (text: string) => void;
    setGameStatus: (status: GameStatus | null) => void;
    setPlayStartDate: (date: string) => void;
    setPlayEndDate: (date: string) => void;
    setHoursPlayed: (hours: number | null) => void;
    setMinutesPlayed: (minutes: number | null) => void;
    setHoveredRating: (rating: number) => void;
    setPlatform: (platform: string) => void;
    setContainsSpoilers: (spoilers: boolean) => void;
  };
};

const GameLogForm = ({ game, formData, onFormDataChange }: Props) => {
  const handleHoursChange = (value: string) => {
    onFormDataChange.setHoursPlayed(value ? parseInt(value) : null);
  };

  const handleMinutesChange = (value: string) => {
    onFormDataChange.setMinutesPlayed(
      value ? Math.min(59, parseInt(value)) : null
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Rating and Time Played Row */}
      <div className="flex flex-row justify-between">
        <RatingSection
          rating={formData.rating}
          hoveredRating={formData.hoveredRating}
          onRatingChange={onFormDataChange.setRating}
          onHover={onFormDataChange.setHoveredRating}
          onHoverEnd={() => onFormDataChange.setHoveredRating(0)}
        />

        <TimePlayedSection
          hoursPlayed={formData.hoursPlayed}
          minutesPlayed={formData.minutesPlayed}
          onHoursChange={handleHoursChange}
          onMinutesChange={handleMinutesChange}
        />
      </div>

      {/* Status and Platform Row */}
      <StatusPlatformSection
        gameStatus={formData.gameStatus}
        platform={formData.platform}
        game={game}
        onGameStatusChange={onFormDataChange.setGameStatus}
        onPlatformChange={onFormDataChange.setPlatform}
      />

      {/* Play Dates */}
      <PlayDatesSection
        playStartDate={formData.playStartDate}
        playEndDate={formData.playEndDate}
        onPlayStartDateChange={onFormDataChange.setPlayStartDate}
        onPlayEndDateChange={onFormDataChange.setPlayEndDate}
      />

      {/* Review Section */}
      <ReviewSection
        reviewText={formData.reviewText}
        containsSpoilers={formData.containsSpoilers}
        onReviewTextChange={onFormDataChange.setReviewText}
        onContainsSpoilersChange={onFormDataChange.setContainsSpoilers}
      />
    </div>
  );
};

export default GameLogForm;
