import { LogFilters } from "@/Interface";
import Dropdown from "@/components/controls/Dropdown";

type Props = {
  sortBy: LogFilters["sort_by"];
  onSortChange: (sortBy: LogFilters["sort_by"]) => void;
};

const ReviewsHeader = ({ sortBy, onSortChange }: Props) => {
  const sortOptions = [
    {
      label: "Newest First",
      onClick: () => onSortChange("newest"),
      isSelected: sortBy === "newest",
    },
    {
      label: "Oldest First",
      onClick: () => onSortChange("oldest"),
      isSelected: sortBy === "oldest",
    },
    {
      label: "Most Liked", // Updated label
      onClick: () => onSortChange("highest_rated"),
      isSelected: sortBy === "highest_rated",
    },
    {
      label: "Least Liked", // Updated label
      onClick: () => onSortChange("lowest_rated"),
      isSelected: sortBy === "lowest_rated",
    },
  ];

  const selectedOption = sortOptions.find((option) => option.isSelected);
  const buttonText = selectedOption?.label || "Sort by";

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold">Reviews</h1>

      <div className="flex items-center space-x-3">
        <span className="text-sm text-base-content/60 min-w-fit">Sort by:</span>
        <Dropdown buttonText={buttonText} items={sortOptions} />
      </div>
    </div>
  );
};

export default ReviewsHeader;
