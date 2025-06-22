import { Link } from "@tanstack/react-router";
import { useGames } from "../../hooks/useGames";
import { useEffect, useState } from "react";

const AllGames = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGames(page);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  if (isLoading) return <div className="min-h-screen" />;
  if (isError || !data) return <p>Error fetching game data.</p>;
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:mx-auto px-4 container my-16 gap-4 place-items-center join">
        {data.games.map((game) => (
          <Link
            className="group rounded-lg overflow-hidden border border-neutral hover:border-primary transition-colors"
            key={game.id}
            to="/games/$gamesSlug"
            params={{ gamesSlug: game.slug }}
          >
            <img
              className="col-span-1 object-fill rounded-lg transition duration-300 group-hover:brightness-25"
              src={`https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover_id}.jpg`}
            />
          </Link>
        ))}

        <div className="col-span-full join mt-8 flex justify-center">
          {[...Array(data.totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn ${page === i + 1 ? "btn-active text-primary" : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AllGames;
