import { useGames } from "../../hooks/useGames";
import { useUpcomingGames } from "../../hooks/useUpcomingGames";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "@splidejs/react-splide/css";

const Games = () => {
  const [page, setPage] = useState(1);
  const splideRef = useRef<any>(null);

  const { data, isLoading, isError } = useGames(page);
  const {
    data: upcomingData,
    isLoading: upcomingIsLoading,
    isError: upcomingIsError,
  } = useUpcomingGames();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  if (isLoading || upcomingIsLoading) return <div className="min-h-screen" />;
  if (isError || upcomingIsError || !data || !upcomingData)
    return <p>Error fetching game data.</p>;

  console.log(data.games);

  return (
    <>
      <div className="flex flex-col gap-2  container md:mx-auto px-4 my-16">
        <div className="flex flex-row justify-between">
          <h1 className="font-bold text-2xl">Upcoming Games</h1>
          <Link className="self-end">More</Link>
        </div>

        <Splide
          ref={splideRef}
          hasTrack={false}
          options={{
            perPage: 6,
            gap: "1rem",
            pagination: false,
            arrows: false,
            rewind: false,
            breakpoints: {
              1024: { perPage: 4 },
              768: { perPage: 3, arrows: false },
              640: { perPage: 2, arrows: false },
            },
          }}
          aria-label="Upcoming Games Carousel"
          className="relative"
        >
          <SplideTrack className="px-12">
            {upcomingData.map((game) => (
              <SplideSlide key={game.id}>
                <Link
                  to="/games/$gamesSlug"
                  params={{ gamesSlug: game.slug }}
                  className="block group border border-neutral hover:border-primary rounded-lg overflow-hidden transition-colors"
                >
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_720p/${game.cover.image_id}.jpg`}
                    alt={game.name}
                    className="col-span-1 object-fill  transition duration-300 group-hover:brightness-25"
                  />
                </Link>
              </SplideSlide>
            ))}
          </SplideTrack>

          <button
            type="button"
            onClick={() => splideRef.current?.go("<")}
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-base-200 shadow select-none"
          >
            <ChevronLeft className="w-5 h-5 fill-none stroke-current" />
          </button>
          <button
            type="button"
            onClick={() => splideRef.current?.go(">")}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-base-200 shadow select-none"
          >
            <ChevronRight className="w-5 h-5 fill-none stroke-current" />
          </button>
        </Splide>
      </div>

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
              className={`join-item btn ${page === i + 1 ? "btn-active" : ""}`}
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

export default Games;
