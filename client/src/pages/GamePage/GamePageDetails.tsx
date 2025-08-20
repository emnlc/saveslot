import { useEffect, useRef, useState } from "react";
import type { Game } from "../../Interface";
import { convertToDate } from "../../utils/gameHelpers";
import { Link } from "@tanstack/react-router";

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

  const website =
    data.websites &&
    data.websites.filter((website) => website.type && website.type.id === 1);

  const rating = data.age_ratings?.find(
    (rating) => rating.rating_category?.organization?.id === 1
  );

  const gamesInSeries =
    data.collections &&
    data.collections[0].games.filter(
      (game) =>
        (game.game_type === 0 || game.game_type === 4) &&
        game.name !== data.name
    );

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
              {data.first_release_date ? (
                <>{convertToDate(data.first_release_date)}</>
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
            {rating ? rating.rating_category.rating : "Not rated"}
          </span>
        </div>

        {data.involved_companies[0].developer && (
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

        {data.involved_companies[0].publisher && (
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
            {website &&
              website.map((website) => (
                <a
                  key={website.id}
                  className="text-sm text-base-content/60 underline underline-offset-2 hover:text-primary transition-all cursor-pointer"
                  href={website.url}
                  target="_blank"
                >
                  Official Website
                </a>
              ))}
          </div>
        </div>

        {gamesInSeries ? (
          <div className="flex flex-col gap-2 col-span-2  ">
            <h2 className="text-lg font-bold">Also in Series</h2>
            <div className="flex flex-row flex-wrap gap-2">
              {gamesInSeries.slice(0, 4).map((game) => (
                <Link
                  key={game.id}
                  to={"/games/$gamesSlug"}
                  params={{ gamesSlug: game.slug }}
                  className="relative w-28 group rounded-lg overflow-hidden block border border-neutral hover:border-primary transition-all"
                >
                  <img
                    className=" object-fill rounded-lg transition duration-300 group-hover:brightness-25"
                    src={
                      game.cover
                        ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game?.cover.image_id}.jpg`
                        : ""
                    }
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 opacity-0 group-hover:opacity-100 transition duration-300">
                    <span className="text-xs flex-1 flex flex-col justify-center text-white font-normal text-center px-2">
                      {game.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default GamePageDetails;
