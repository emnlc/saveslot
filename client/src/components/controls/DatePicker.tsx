import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import Dropdown from "./Dropdown";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  allowClear?: boolean;
}

const DatePicker = ({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className = "",
  error,
  allowClear = true,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Initialize currentMonth based on value
  useEffect(() => {
    if (value) {
      const date = new Date(value + "T00:00:00");
      if (!isNaN(date.getTime())) {
        setCurrentMonth(date);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handleDateClick = (day: number) => {
    if (disabled) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const formattedDate = date.toISOString().split("T")[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange("");
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleMonthChange = (newMonth: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (newYear: number) => {
    setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const isSelectedDate = (day: number) => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate year range (1900 to current year)
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => 1900 + i
  ).reverse();

  // Generate month dropdown items
  const monthItems = monthNames.map((monthName, idx) => ({
    label: monthName,
    onClick: () => handleMonthChange(idx),
    isSelected: idx === month,
  }));

  // Generate year dropdown items
  const yearItems = yearRange.map((y) => ({
    label: y.toString(),
    onClick: () => handleYearChange(y),
    isSelected: y === year,
  }));

  return (
    <div ref={datePickerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between space-x-2 px-3 py-2 text-xs bg-base-100 border border-base-300 rounded hover:border-base-content/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${error ? "border-error focus:ring-error/20 focus:border-error" : ""}`}
      >
        <div className="flex items-center space-x-2 flex-1 text-left">
          <Calendar className="w-4 h-4 text-base-content/60" />
          <span
            className={value ? "text-base-content" : "text-base-content/50"}
          >
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {allowClear && value && !disabled && (
            <X
              className="w-4 h-4 text-base-content/60 hover:text-base-content transition-colors"
              onClick={handleClearDate}
            />
          )}
          <ChevronDown
            className={`w-4 h-4 text-base-content/60 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-base-100 border border-base-300 rounded shadow-lg z-50 p-4 min-w-[280px]">
          {/* Month/Year Selection */}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-base-200 rounded transition-colors duration-150"
            >
              <ChevronLeft className="w-4 h-4 text-base-content" />
            </button>

            <div className="flex-1">
              <Dropdown
                buttonText={monthNames[month]}
                items={monthItems}
                buttonClass="w-full flex items-center justify-between space-x-2 px-2 py-1 text-xs bg-base-100 border border-base-300 rounded hover:border-base-content/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
                dropdownClass="w-full"
                dropdownMenuClass="max-h-[calc(6*2.5rem)] overflow-y-auto"
              />
            </div>

            <div className="w-20">
              <Dropdown
                buttonText={year.toString()}
                items={yearItems}
                buttonClass="w-full flex items-center justify-between space-x-1 px-2 py-1 text-xs bg-base-100 border border-base-300 rounded hover:border-base-content/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
                dropdownClass="w-full"
                dropdownMenuClass="max-h-[calc(6*2.5rem)] overflow-y-auto"
              />
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-base-200 rounded transition-colors duration-150"
            >
              <ChevronRight className="w-4 h-4 text-base-content" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-base-content/60 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isSelected = isSelectedDate(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    p-2 text-xs rounded hover:bg-base-200 transition-colors duration-150 cursor-pointer
                    ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-base-content"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
