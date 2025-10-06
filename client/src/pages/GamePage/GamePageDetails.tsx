import { useEffect, useRef, useState } from "react";
import type { Game } from "../../Interface";

// import { Link } from "@tanstack/react-router";
import GameCard from "@/components/GameCard";

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

  const relatedGames = data.related_games || [];

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

        <div className="flex flex-col gap-2 col-span-1  ">
          <h2 className="text-lg font-bold">Age Rating</h2>
          <span className="text-sm">
            {data.esrb_rating ? data.esrb_rating : "Not rated"}
          </span>
        </div>

        {data.involved_companies && data.involved_companies[0].developer && (
          <>
            <div className="flex flex-col items-start gap-2 col-span-1  ">
              <h2 className="text-lg font-bold">Developers</h2>
              {data.involved_companies.map(
                (company) =>
                  company.developer && (
                    <a
                      className="text-sm hover:text-primary transition-colors"
                      key={company.id}
                    >
                      {company.company.name}
                    </a>
                  )
              )}
            </div>
          </>
        )}

        {data.involved_companies && data.involved_companies[0].publisher && (
          <>
            <div className="flex flex-col items-start gap-2 col-span-1  ">
              <h2 className="text-lg font-bold">Publishers</h2>

              {data.involved_companies.map(
                (company) =>
                  company.publisher && (
                    <a
                      className="text-sm hover:text-primary transition-colors"
                      key={company.id}
                    >
                      {company.company.name}
                    </a>
                  )
              )}
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

        <div className="flex flex-col gap-2 col-span-2  ">
          <h2 className="text-lg font-bold">Website</h2>
          <div className="flex flex-row flex-wrap gap-2 overflow-clip">
            {data.official_website && (
              <a
                key={data.official_website}
                className="text-sm text-base-content/60 underline underline-offset-2 hover:text-primary transition-all cursor-pointer"
                href={data.official_website}
                target="_blank"
              >
                Official Website
              </a>
            )}
          </div>
        </div>

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
      </div>
    </>
  );
};

export default GamePageDetails;
