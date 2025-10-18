import { ListPlus, Star, Gamepad2, Heart, LayoutGrid } from "lucide-react";
import type { Game } from "../../Interface";

import AddToListModal from "../../components/modals/AddToListModal";
import CreateLogModal from "./GameLogModal/CreateLogModal";
import { useState } from "react";
import GameStatusDropdown from "./GameStatusRadio";

import LikeButton from "@/components/controls/LikeButton";
import { useGameRatingStats } from "@/hooks/gameLogs";
import { UserAuth } from "@/context/AuthContext";
import React from "react";
import { useGameStats } from "@/hooks/games";

type Props = {
  data: Game;
};

const GamePageHeader = ({ data }: Props) => {
  const cover_url = `https://images.igdb.com/igdb/image/upload/t_1080p/${data.cover_id}.jpg`;
  const [showModal, setShowModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  const { profile } = UserAuth();

  const { data: gameStats } = useGameStats(data.id);
  const { data: ratingStats } = useGameRatingStats(data.id);

  return (
    <>
      {showModal && profile && (
        <AddToListModal
          gameId={data.id}
          gameTitle={data.name}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Add the CreateLogModal */}
      {showLogModal && profile && data.is_released && (
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
          <span
            className="flex flex-row items-center gap-1"
            title="Times Played"
          >
            <Gamepad2 className="w-5 text-accent fill-accent/20" />{" "}
            <span className="text-base-content/60">
              {gameStats?.play_count}
            </span>
          </span>
          <span className="flex flex-row items-center gap-1">
            <LayoutGrid className="w-5 text-secondary fill-secondary" />
            <span className="text-base-content/60">
              {gameStats?.list_count}
            </span>
          </span>
          <span className="flex flex-row items-center gap-1">
            <Heart className="w-5 text-primary fill-primary" />
            <span className="text-base-content/60">
              {gameStats ? gameStats.like_count : 0}
            </span>
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
          {data.release_date_human ? (
            <>
              <span>{data.release_date_human}</span>
            </>
          ) : (
            <>
              <span>TBD</span>
            </>
          )}

          {data.publishers &&
            data.publishers.map(
              (publisher) =>
                publisher && (
                  <React.Fragment key={publisher.id}>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral"></span>
                    <span className="hover:text-primary transition-colors">
                      {publisher.name}
                    </span>
                  </React.Fragment>
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
            disabled={!profile?.id}
            className="btn btn-secondary btn-sm md:btn-md"
          >
            <ListPlus />
            Add to List
          </button>
          <button
            onClick={() => setShowLogModal(true)}
            disabled={!profile?.id || !data.is_released}
            className="btn btn-accent btn-sm md:btn-md"
          >
            <ListPlus />
            Review or Log
          </button>
          <LikeButton targetId={data.id.toString()} targetType="game" />
        </div>
        <GameStatusDropdown gameId={data.id} released={data.is_released} />
      </div>
    </>
  );
};

export default GamePageHeader;
