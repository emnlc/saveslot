import { useUpcomingGames } from "../../hooks/useUpcomingGames";
import { useNewlyReleasedGames } from "@/hooks/useNewlyReleased";
import { useCriticallyAcclaimedGames } from "@/hooks/useCriticallyAcclaimedGames";
import { Link } from "@tanstack/react-router";

import GameCarousel from "@/components/GameCarousel";

const Games = () => {
  const {
    data: upcomingData,
    isLoading: upcomingIsLoading,
    isError: upcomingIsError,
  } = useUpcomingGames();

  const {
    data: newlyData,
    isLoading: newlyIsLoading,
    isError: newlyIsError,
  } = useNewlyReleasedGames();

  const {
    data: criticallyData,
    isLoading: criticallyIsLoading,
    isError: criticallyIsError,
  } = useCriticallyAcclaimedGames();

  if (upcomingIsLoading || newlyIsLoading || criticallyIsLoading)
    return <div className="min-h-screen" />;
  if (
    upcomingIsError ||
    newlyIsError ||
    criticallyIsError ||
    !upcomingData ||
    !newlyData ||
    !criticallyData
  )
    return <p>Error fetching game data.</p>;

  return (
    <>
      <div className="flex flex-col gap-2  container md:mx-auto px-4 my-16">
        <div className="flex flex-row justify-between">
          <h1 className="font-bold text-2xl">Upcoming Games</h1>
          <Link
            to="/upcoming"
            className="self-end hover:text-accent transition-all"
            search={{ page: 1, sort: "popularity", order: "desc" }}
          >
            More
          </Link>
        </div>

        <GameCarousel data={upcomingData} date={true} />
      </div>

      <div className="flex flex-col gap-2  container md:mx-auto px-4 my-16">
        <div className="flex flex-row justify-between">
          <h1 className="font-bold text-2xl">Newly Released</h1>
          <Link
            to="/newly-released"
            className="self-end hover:text-accent transition-all"
            search={{ page: 1, sort: "popularity", order: "desc" }}
          >
            More
          </Link>
        </div>

        <GameCarousel data={newlyData} />
      </div>

      <div className="flex flex-col gap-2  container md:mx-auto px-4 my-16">
        <div className="flex flex-row justify-between">
          <h1 className="font-bold text-2xl">Critically Acclaimed</h1>
          {/* <Link to="/" className="self-end hover:text-accent transition-all">
            More
          </Link> */}
        </div>

        <GameCarousel data={criticallyData} />
      </div>

      <div className="mx-auto w-fit my-16">
        <Link to="/all-games" className="btn btn-primary btn-md lg:btn-lg ">
          View All Games
        </Link>
      </div>
    </>
  );
};

export default Games;
