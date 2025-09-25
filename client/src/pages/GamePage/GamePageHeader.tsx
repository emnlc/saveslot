import { ListPlus, Star, Gamepad2, Heart, LayoutGrid } from "lucide-react";
import type { Game } from "../../Interface";
import { convertToDate } from "../../utils/gameHelpers";
import AddToListModal from "./AddToListModal";
import CreateLogModal from "./GameLogModal/CreateLogModal";
import { useState } from "react";
import GameStatusDropdown from "./GameStatusRadio";

import LikeButton from "@/components/LikeButton";
import { useGameLikeCount } from "@/hooks/UserLikeHooks/useGameLikeCount";
import { useGameRatingStats } from "@/hooks/GameLogs/useGameLogs";
import { UserAuth } from "@/context/AuthContext";

type Props = {
  data: Game;
};

const GamePageHeader = ({ data }: Props) => {
  const cover_url = `https://images.igdb.com/igdb/image/upload/t_1080p/${data.cover.image_id}.jpg`;
  const [showModal, setShowModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  const { profile } = UserAuth();

  const { data: likeCount } = useGameLikeCount(data.id.toString());
  const { data: ratingStats } = useGameRatingStats(data.id);

  return (
    <>
      {showModal && (
        <AddToListModal
          gameId={data.id}
          gameTitle={data.name}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Add the CreateLogModal */}
      {showLogModal && profile && (
        <CreateLogModal
          game={data}
          userId={profile.id}
          onClose={() => setShowLogModal(false)}
        />
      )}

      <div className="min-w-52 md:min-w-60 flex flex-col items-center gap-2 -mb-5">
        <img
          className="w-52 md:w-60 h-auto rounded-lg shadow-lg z-10"
          src={`${cover_url}`}
          alt={data.name}
        />
        <div className="flex flex-row gap-2">
          <span className="flex flex-row items-center gap-1">
            <Gamepad2 className="w-5 text-accent fill-accent/20" />{" "}
            <span className="text-base-content/60">0</span>
          </span>
          <span className="flex flex-row items-center gap-1">
            <LayoutGrid className="w-5 text-secondary fill-secondary" />
            <span className="text-base-content/60">0</span>
          </span>
          <span className="flex flex-row items-center gap-1">
            <Heart className="w-5 text-primary fill-primary" />
            <span className="text-base-content/60">{likeCount ?? 0}</span>
          </span>
        </div>
      </div>
      <div className="w-full flex flex-col gap-4 z-10">
        <div className="flex flex-row gap-2 justify-center md:justify-start">
          <h1 className="font-medium text-center md:text-left text-2xl md:text-4xl">
            {data.name}
          </h1>
        </div>
        <div className="md:flex flex-row items-center gap-2 text-sm hidden">
          {data.first_release_date ? (
            <>
              <span>{convertToDate(data.first_release_date)}</span>
            </>
          ) : (
            <>
              <span>TBD</span>
            </>
          )}
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
          {data.platforms &&
            data.platforms.map(
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
              {/* Update this to show actual user rating stats */}
              {ratingStats && ratingStats.total_logs > 0
                ? ratingStats.average_rating.toFixed(1)
                : "N/A"}
            </span>
            <span className="text-xs">
              User Ratings {ratingStats && `(${ratingStats.total_logs})`}
            </span>
          </div>
          {data.rating && (
            <>
              <div className="h-12 w-px bg-base-300" />
              <div className="flex flex-col items-center justify-center">
                <span className="flex items-center gap-2 text-xl">
                  <Star fill="#9146FE" stroke="#9146FE" />
                  <div>
                    <span>{(data.rating / 10).toFixed(1)}</span>
                    <span>/10</span>
                  </div>
                </span>
                <span className="text-xs">
                  <a
                    target="_blank"
                    className="hover:text-[#9146FE] transition-all"
                    href={`${data.url}`}
                  >
                    IGDB Rating
                  </a>
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-row gap-4 justify-center md:justify-start">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-secondary btn-sm md:btn-md"
          >
            <ListPlus />
            Add to List
          </button>
          {/* Update the Review or Log button */}
          <button
            onClick={() => setShowLogModal(true)}
            disabled={!profile?.id}
            className="btn btn-accent btn-sm md:btn-md"
          >
            <ListPlus />
            Review or Log
          </button>
          <LikeButton targetId={data.id.toString()} targetType="game" />
        </div>
        <GameStatusDropdown gameId={data.id} />
      </div>
    </>
  );
};

export default GamePageHeader;
