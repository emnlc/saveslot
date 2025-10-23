import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  buttonClass?: string;
  dropdownClass?: string;
  label?: string;
  required?: boolean;
}

const Select = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  error,
  className,
  buttonClass,
  dropdownClass,
  label,
  required = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleOptionClick = (optionValue: string | number) => {
    if (disabled) return;
    onChange(optionValue);
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
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
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
    "flex items-center justify-between space-x-2 px-3 py-2 text-xs bg-base-100 border border-base-300 rounded hover:border-base-content/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer";

  const finalButtonClass = buttonClass || defaultButtonClass;

  return (
    <div className={`w-full ${className || ""}`}>
      {label && (
        <label className="block text-sm font-medium text-base-content mb-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div ref={selectRef} className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className={`w-full ${finalButtonClass} ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${error ? "border-error focus:ring-error/20 focus:border-error" : ""}`}
        >
          <div className="flex items-center space-x-2 flex-1 text-left">
            {selectedOption?.icon && (
              <selectedOption.icon className="w-4 h-4 text-base-content/60" />
            )}
            <span
              className={
                selectedOption ? "text-base-content" : "text-base-content/50"
              }
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-base-content/60 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            className={`absolute left-0 right-0 top-full mt-1 bg-base-100 border border-base-300 rounded shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto ${
              dropdownClass || ""
            }`}
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-base-content/50">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  disabled={disabled || option.disabled}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-base-200 transition-colors duration-150 cursor-pointer ${
                    option.value === value
                      ? "bg-primary/10 text-primary"
                      : "text-base-content"
                  } ${
                    disabled || option.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 text-left">
                    {option.icon && <option.icon className="w-4 h-4" />}
                    <span className="whitespace-nowrap">{option.label}</span>
                  </div>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
};

export default Select;
