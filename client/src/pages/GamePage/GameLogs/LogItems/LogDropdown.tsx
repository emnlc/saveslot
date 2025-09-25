import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit, Trash2, Flag } from "lucide-react";

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  isOwner: boolean;
  showAlways?: boolean;
};

const LogDropdown = ({
  onEdit,
  onDelete,
  onReport,
  isOwner,
  showAlways = false,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const handleEdit = () => {
    onEdit?.();
    setIsOpen(false);
  };

  const handleDelete = () => {
    const confirmMessage = showAlways
      ? "Are you sure you want to delete this log? This action cannot be undone."
      : "Are you sure you want to delete this comment? This action cannot be undone.";

    if (window.confirm(confirmMessage)) {
      onDelete?.();
    }
    setIsOpen(false);
  };

  const handleReport = () => {
    onReport?.();
    setIsOpen(false);
  };

  const buttonClasses = showAlways
    ? "btn btn-ghost btn-sm btn-circle"
    : "btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 bg-base-100 border border-base-300 rounded-lg shadow-lg py-1 min-w-[120px]">
          {isOwner && (
            <>
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-base-content hover:bg-base-200 transition-colors cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </>
          )}
          {!isOwner && onReport && (
            <button
              onClick={handleReport}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-warning hover:bg-warning/10 transition-colors cursor-pointer"
            >
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LogDropdown;
