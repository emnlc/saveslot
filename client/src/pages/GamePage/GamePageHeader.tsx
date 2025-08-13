import { Heart, ListPlus, Star } from "lucide-react";
import type { Game } from "../../Interface";
import { convertToDate } from "../../utils/gameHelpers";

import AddToListModal from "./AddToListModal";
import { useState } from "react";

type Props = {
  data: Game;
};

const GamePageHeader = ({ data }: Props) => {
  const cover_url = `https://images.igdb.com/igdb/image/upload/t_1080p/${data.cover.image_id}.jpg`;
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && (
        <AddToListModal
          gameId={data.id}
          gameTitle={data.name}
          onClose={() => setShowModal(false)}
        />
      )}

      <img
        src={`${cover_url}`}
        className="w-52 md:w-60 h-auto rounded-lg shadow-lg z-10"
        alt={data.name}
      />

      <div className="w-full flex flex-col gap-4 z-10">
        <h1 className="font-medium text-center md:text-left text-3xl md:text-4xl">
          {data.name}
        </h1>

        <div className="md:flex flex-row items-center gap-2 text-sm hidden">
          <span>{convertToDate(data.first_release_date)}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral"></span>
          {data.involved_companies.map(
            (company) =>
              company.developer && (
                <span
                  className="hover:text-primary transition-colors"
                  key={company.id}
                >
                  {company.company.name}
                </span>
              )
          )}
        </div>

        <div className="md:flex flex-row flex-wrap gap-2 hidden">
          {data.platforms.map(
            (platform) =>
              platform && (
                <span
                  className="badge badge-neutral badge-sm w-fit text-xs hover:text-primary transition-colors"
                  key={platform.id}
                >
                  {platform.name}
                </span>
              )
          )}
        </div>

        <div className="flex flex-row items-center justify-center md:justify-start flex-wrap gap-2">
          <div className="flex flex-col items-center justify-center">
            <span className="flex items-center gap-2 text-xl">
              <Star fill="#FFD700" stroke="#FFD700" />
              N/A
            </span>
            <span className="text-xs">User Ratings</span>
          </div>
          <div className="h-12 w-px bg-base-300" />

          <div className="flex flex-col items-center justify-center">
            <span className="flex items-center gap-2 text-xl">
              <Star fill="#FFD700" stroke="#FFD700" />
              <div>
                <span>{(data.rating / 10).toFixed(1)}</span>
                <span>/10</span>
              </div>
            </span>
            <span className="text-xs">
              <a
                target="_blank"
                className="hover:text-[#9047FE] transition-all"
                href={`${data.url}`}
              >
                IGDB Rating
              </a>
            </span>
          </div>
          <div className="h-12 w-px bg-base-300" />

          <div className="flex flex-col items-center justify-center">
            <span className="flex items-center gap-2 text-xl">
              {data.aggregated_rating ? data.aggregated_rating.toFixed(0) : ""}
            </span>
            <span className="text-xs">Metascore</span>
          </div>
        </div>

        <div className="flex flex-row gap-4 flex-wrap">
          <button className="btn btn-primary btn-sm md:btn-md">
            <Heart fill={"none"} stroke="white" />
            Favorite
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-secondary btn-sm md:btn-md"
          >
            <ListPlus />
            Add to List
          </button>

          <button className="btn btn-accent btn-sm md:btn-md">
            <ListPlus />
            Review
          </button>
        </div>
      </div>
    </>
  );
};

export default GamePageHeader;
