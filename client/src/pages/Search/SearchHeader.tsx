import { Search, LucideIcon } from "lucide-react";
import Dropdown from "@/components/controls/Dropdown";
import { useRef } from "react";

interface SearchHeaderProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  getCategoryDisplay: () => string;
  dropdownItems: Array<{
    label: string;
    onClick: () => void;
    isSelected: boolean;
    icon?: LucideIcon;
  }>;
}

export const SearchHeader = ({
  searchInput,
  setSearchInput,
  handleSearch,
  getCategoryDisplay,
  dropdownItems,
}: SearchHeaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const onSubmit = (e: React.FormEvent) => {
    handleSearch(e);
    inputRef.current?.blur();
  };

  return (
    <div className="mb-8">
      <div className="flex flex-row items-center md:flex-row md:items-center justify-between gap-4 mb-4">
        <h1 className="text-xl md:text-3xl font-bold">Search Results</h1>
        {/* Mobile Only Dropdown */}
        <div className="md:hidden">
          <Dropdown buttonText={getCategoryDisplay()} items={dropdownItems} />
        </div>
      </div>
      <form onSubmit={onSubmit} className="relative ">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for games, users, lists, and reviews..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input input-md w-full pl-14 bg-base-200/80 focus:outline-none transition-all focus:border-primary"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
      </form>
    </div>
  );
};
