import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

type Props = {
  id: number;
  name: string;
  slug: string;
  coverId: string;
  first_release_date?: string;

  editMode?: boolean;
  onRemoveClick?: () => void;
  isMarkedForRemoval?: boolean;
  showAsMarkedForRemoval?: boolean;
};

const GameCard = (props: Props) => {
  const handleClick = (e: React.MouseEvent) => {
    if (props.editMode && props.onRemoveClick) {
      e.preventDefault();
      e.stopPropagation();
      props.onRemoveClick();
    }
  };

  return (
    <>
      <Link
        key={props.id}
        to="/games/$gamesSlug"
        params={{ gamesSlug: props.slug }}
        className="group relative rounded-lg overflow-hidden border border-neutral hover:border-primary transition-colors w-full"
        onClick={handleClick}
      >
        {/* Remove indicator in edit mode */}
        {props.editMode && (
          <div
            className={`absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 transition-opacity ${
              props.showAsMarkedForRemoval
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <X className="w-4 h-4" />
          </div>
        )}

        <div className="aspect-[3/4] w-full">
          <img
            src={`https://images.igdb.com/igdb/image/upload/t_1080p/${props.coverId}.jpg`}
            className="w-full h-full object-cover rounded-lg transition duration-300 group-hover:brightness-25"
          />

          {/* Hover Info Overlay */}
          <div className="absolute inset-0  text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-sm font-semibold">{props.name}</h3>
            {props.first_release_date && (
              <p className="text-xs text-gray-300">
                {new Date(props.first_release_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </Link>
    </>
  );
};

export default GameCard;
