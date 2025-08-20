import { useEffect, useRef } from "react";
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
  disabled?: boolean;
}

const Dropdown = ({
  buttonText,
  items,
  buttonClass = "btn btn-secondary",
  dropdownClass = "dropdown",
  disabled = false,
}: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (itemOnClick: () => void) => {
    if (disabled) return;

    itemOnClick();

    if (dropdownRef.current) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
      }
      document.body.click();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        const activeElements = dropdownRef.current.querySelectorAll(":focus");
        activeElements.forEach((el) => (el as HTMLElement).blur());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={dropdownClass}>
      <div
        tabIndex={disabled ? -1 : 0}
        role="button"
        className={`${buttonClass} ${disabled ? "btn-disabled" : ""}`}
      >
        {buttonText}
        <ChevronDown size={24} />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content  bg-base-300 rounded-md overflow-clip z-[1] w-full shadow"
      >
        {items.map((item, index) => (
          <li key={index}>
            <a
              onClick={() => handleItemClick(item.onClick)}
              className={`flex items-center justify-between gap-2 text-xs md:text-base p-2 ${
                item.isSelected ? "bg-secondary/20 text-secondary" : ""
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <div className="flex items-center gap-2">
                {item.icon && (
                  <>
                    <item.icon className="" size={16} />
                  </>
                )}
                <span>{item.label}</span>
              </div>
              {item.isSelected && (
                <>
                  <Check size={16} className="" />
                </>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dropdown;
