import { useGames } from "@/hooks/games";
import { useEffect, useState } from "react";
import Pagination from "@/components/controls/Pagination";

import GameCard from "@/components/content/GameCard";

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:mx-auto px-4 container my-16 gap-4 place-items-center">
        {data.games.map((game) => (
          <GameCard
            key={game.id}
            id={game.id.toString()}
            name={game.name}
            slug={game.slug}
            coverId={game.cover_id}
            first_release_date={game.first_release_date}
          />
        ))}

        <div className="col-span-full">
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
};

export default AllGames;
