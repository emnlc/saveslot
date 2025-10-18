import { Link } from "@tanstack/react-router";

import GameCarousel from "@/components/content/GameCarousel";
import {
  useNewlyReleasedGames,
  useUpcomingGames,
  useHighlyRated,
} from "@/hooks/games";
import { ArrowRight } from "lucide-react";

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
  } = useHighlyRated();

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
      <div className="flex container flex-col gap-16 my-12">
        <div className="flex flex-col gap-2 px-4">
          <div className="flex flex-row justify-between">
            <h1 className="font-bold text-2xl">Upcoming Games</h1>
            <Link
              to="/upcoming"
              className="self-end text-sm text-base-content/60 hover:text-primary flex items-center gap-1 transition-all"
              search={{ page: 1, sort: "popularity", order: "desc" }}
              resetScroll={true}
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <GameCarousel data={upcomingData} date={true} />
        </div>

        <div className="flex flex-col gap-2 px-4">
          <div className="flex flex-row justify-between">
            <h1 className="font-bold text-2xl">New Releases</h1>
            <Link
              to="/new-releases"
              className="self-end text-sm text-base-content/60 hover:text-primary flex items-center gap-1 transition-all"
              search={{ page: 1, sort: "first_release_date", order: "desc" }}
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <GameCarousel data={newlyData} />
        </div>

        <div className="flex flex-col gap-2 px-4">
          <div className="flex flex-row justify-between">
            <h1 className="font-bold text-2xl">Highly Rated</h1>
          </div>

          <GameCarousel data={criticallyData} />
        </div>

        <div className="mx-auto w-fit">
          <Link to="/all-games" className="btn btn-primary btn-md">
            View All Games
          </Link>
        </div>
      </div>
    </>
  );
};

export default Games;
