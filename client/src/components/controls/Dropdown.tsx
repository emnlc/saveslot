import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { LucideIcon } from "lucide-react";
interface DropdownItem {
  label: string;
  onClick: () => void;
  isSelected?: boolean;
  icon?: LucideIcon;
}
interface DropdownProps {
  buttonText: string;
  items: DropdownItem[];
  buttonClass?: string;
  dropdownClass?: string;
  dropdownMenuClass?: string;
  disabled?: boolean;
}
const Dropdown = ({
  buttonText,
  items,
  buttonClass,
  dropdownClass,
  dropdownMenuClass,
  disabled = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleItemClick = (itemOnClick: () => void) => {
    if (disabled) return;
    itemOnClick();
    setIsOpen(false);
  };
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  const defaultButtonClass =
    "flex items-center justify-between space-x-2 px-3 py-2 text-xs  bg-base-100 border border-base-300 rounded hover:border-base-content/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer";
  const finalButtonClass = buttonClass || defaultButtonClass;
  return (
    <div ref={dropdownRef} className={`relative ${dropdownClass || ""}`}>
      <button
        onClick={toggleDropdown}
        disabled={disabled}
        className={`${finalButtonClass} ${disabled ? "opacity-50 cursor-not-allowed " : ""}`}
      >
        <span className="text-base-content">{buttonText}</span>
        <ChevronDown
          className={`w-4 h-4 text-base-content/60 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-1 min-w-full bg-base-100 border border-base-300 rounded shadow-lg z-50 overflow-hidden ${dropdownMenuClass || ""}`}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.onClick)}
              disabled={disabled}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs  hover:bg-base-200 transition-colors duration-150 cursor-pointer ${
                item.isSelected
                  ? "bg-primary/10 text-primary"
                  : "text-base-content"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center space-x-2 flex-1 text-left">
                {item.icon && <item.icon className="w-4 h-4" />}
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
              {item.isSelected && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default Dropdown;
