import { useEffect, useRef, useState } from "react";
import type { Game } from "../../Interface";

import GameCard from "@/components/content/GameCard";
import { Star } from "lucide-react";

type Props = { data: Game };

const GamePageDetails = ({ data }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showReadMoreButton, setShowReadMoreButton] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setShowReadMoreButton(
        ref.current.scrollHeight !== ref.current.clientHeight
      );
    }
  }, [data?.storyline, data?.summary]);

  const relatedGames =
    data.related_games?.length > 0 ? data.related_games : null;
  const officialWebsite = data.websites?.find(
    (website) => website.type.id === 1
  );
  const esrbRating = data.age_ratings?.find((r) => r.organization_id === 1);

  return (
    <>
      <div className="col-span-1 grid grid-cols-2 gap-y-8">
        <div className="flex flex-col gap-2 col-span-2">
          <h2 className="text-xl font-bold">About</h2>
          <div
            ref={ref}
            className={`text-sm transition-all mb-2 ${isOpen ? "" : "line-clamp-4 overflow-hidden"}`}
          >
            {(data.storyline || data.summary || "")
              .split("\n")
              .map((line, index) => (
                <p key={index}>
                  {line}
                  <br />
                </p>
              ))}
          </div>

          {showReadMoreButton && (
            <button
              className="text-xs btn  btn-soft btn-info btn-xs font-normal self-start transition-all"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? "Read Less" : "Read More"}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 col-span-1">
          <h2 className="text-lg font-bold">Release Date</h2>
          <div className="flex flex-row flex-wrap gap-2">
            <span className="text-sm">
              {data.release_date_human ? (
                <>{data.release_date_human}</>
              ) : (
                <>
                  <span>TBD</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 col-span-1">
          <h2 className="text-lg font-bold">Age Rating</h2>
          <span className="text-sm">
            {esrbRating ? `ESRB ${esrbRating.rating}` : "Not rated"}
          </span>
        </div>

        {data.developers && (
          <>
            <div className="flex flex-col items-start gap-2 col-span-1  ">
              <h2 className="text-lg font-bold">Developers</h2>
              {data.developers.map((developer) => (
                <a
                  className="text-sm hover:text-primary transition-colors"
                  key={developer.id}
                >
                  {developer.name}
                </a>
              ))}
            </div>
          </>
        )}

        {data.publishers && (
          <>
            <div className="flex flex-col items-start gap-2 col-span-1  ">
              <h2 className="text-lg font-bold">Publishers</h2>

              {data.publishers.map((publisher) => (
                <a
                  className="text-sm hover:text-primary transition-colors"
                  key={publisher.id}
                >
                  {publisher.name}
                </a>
              ))}
            </div>
          </>
        )}

        <div className="md:hidden flex flex-col gap-2 col-span-2  ">
          <h2 className="text-lg font-bold">Platforms</h2>
          <div className="flex flex-row flex-wrap gap-2">
            {data.platforms &&
              data.platforms.map((platform, index) => (
                <a
                  className="text-sm text-base-content/60 underline underline-offset-2 hover:text-primary transition-all cursor-pointer"
                  key={index}
                >
                  {platform.name}
                </a>
              ))}
          </div>
        </div>

        {officialWebsite && (
          <div className="flex flex-col gap-2 col-span-1">
            <h2 className="text-lg font-bold">Website</h2>
            <div className="flex flex-row flex-wrap gap-2 overflow-clip">
              <a
                key={officialWebsite.id}
                className="text-sm text-base-content/60 underline underline-offset-2 hover:text-primary transition-all cursor-pointer"
                href={officialWebsite.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official Website
              </a>
            </div>
          </div>
        )}

        {data.igdb_total_rating && (
          <div className="flex flex-col gap-2 col-span-1">
            <h2 className="text-lg font-bold">IGDB Rating</h2>
            <div className="flex flex-row flex-wrap gap-2 overflow-clip">
              <Star className="w-4 text-[#9047FE] fill-[#9047FE]" />
              <span>{(data.igdb_total_rating / 10).toFixed(1)}</span>
            </div>
          </div>
        )}

        {data.genres && (
          <div className="flex flex-col gap-2 col-span-2  ">
            <h2 className="text-lg font-bold">Genres</h2>
            <div className="flex flex-row flex-wrap gap-2">
              {data.genres.map((genre, index) => (
                <a
                  className="text-sm text-base-content/60 underline underline-offset-2 hover:text-primary transition-all cursor-pointer"
                  key={index}
                >
                  {genre.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {relatedGames && (
          <div className="flex flex-col gap-2 col-span-2  ">
            <h2 className="text-lg font-bold">Also in Series</h2>
            <div className="flex flex-row flex-wrap gap-2">
              {relatedGames.map((game, index) => (
                <div className="flex items-start w-28" key={index}>
                  <GameCard
                    id={index.toString()}
                    slug={game.slug}
                    coverId={game.cover_id || ""}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GamePageDetails;
