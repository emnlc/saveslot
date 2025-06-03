import { useHighlyRated } from "../../hooks/useHighlyRated";
import { Link } from "@tanstack/react-router";

import { convertToDate } from "../../utils/gameHelpers";

const HighlyRated = () => {
  const { data, isLoading, isError } = useHighlyRated();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching users.</p>;

  return (
    <>
      <div className="flex flex-row justify-center items-center gap-2">
        {data?.map((game) => {
          const cover_url = `https://images.igdb.com/igdb/image/upload/t_1080p/${game?.cover.image_id}.jpg`;

          return (
            <Link
              key={game.id}
              to="/games/$gamesSlug"
              params={{ gamesSlug: game.slug }}
              className="relative w-44 group rounded-lg overflow-hidden block"
            >
              <img
                className="w-full h-full object-fill rounded-lg transition duration-300 group-hover:brightness-25"
                src={cover_url}
                alt={game.name}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 opacity-0 group-hover:opacity-100 transition duration-300">
                <span className="flex-1 flex flex-col justify-end text-white font-normal text-center px-2">
                  {game.name}
                </span>
                <span className="flex-1 flex flex-col justify-center text-white text-xs">
                  {convertToDate(game.first_release_date)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default HighlyRated;
