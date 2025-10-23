type Props = {
  reviewText: string;
  containsSpoilers: boolean;
  onReviewTextChange: (text: string) => void;
  onContainsSpoilersChange: (spoilers: boolean) => void;
};

const ReviewSection = ({
  reviewText,
  containsSpoilers,
  onReviewTextChange,
  onContainsSpoilersChange,
}: Props) => {
  return (
    <div>
      <div className="flex flex-row justify-between">
        <label className="block text-sm font-medium text-base-content mb-2">
          Review
        </label>
        <span
          className={`text-xs self-center ${
            reviewText.length > 2700 ? "text-error" : "text-base-content/60"
          }`}
        >
          {reviewText.length}/3000 characters
        </span>
      </div>
      <textarea
        value={reviewText}
        onChange={(e) => onReviewTextChange(e.target.value)}
        maxLength={3000}
        rows={6}
        className="textarea text-sm focus:outline-none focus:ring-0 focus:textarea-primary w-full resize-none mb-2 rounded"
        placeholder="Share your thoughts about this game..."
      />

      {/* Spoiler Warning */}
      <div className="flex flex-row gap-2">
        <input
          id="spoilerCheckbox"
          type="checkbox"
          checked={containsSpoilers}
          onChange={(e) => onContainsSpoilersChange(e.target.checked)}
          className="checkbox checkbox-xs checkbox-warning"
        />
        <label
          htmlFor="spoilerCheckbox"
          className="flex items-center space-x-2 cursor-pointer"
        >
          <span className="text-xs text-base-content">Spoilers</span>
        </label>
      </div>
    </div>
  );
};

export default ReviewSection;
