import { X } from "lucide-react";
import { Game } from "@/Interface";

type Props = { game: Game; onClose: () => void; isEditing?: boolean };

const ModalHeader = ({ game, onClose, isEditing }: Props) => {
  const cover_url = game.cover?.image_id
    ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover.image_id}.jpg`
    : null;

  return (
    <div className="flex items-center justify-between p-6 border-b border-base-300">
      <div className="flex items-center space-x-4">
        {cover_url && (
          <img
            src={cover_url}
            alt={game.name}
            className="w-12 h-16 rounded object-cover"
          />
        )}
        <div>
          <h2 className="text-xl font-bold text-base-content">
            {isEditing ? "Edit Game Log" : ""}
          </h2>
          <h3 className="text-lg text-base-content/80">{game.name}</h3>
        </div>
      </div>
      <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ModalHeader;
