import { Link } from "@tanstack/react-router";
import {
  useTopReviews,
  useRecentlyReleased,
  useUpcomingGames,
  useMostRatedGames,
  useFeaturedGame,
  usePopularLists,
} from "@/hooks/LandingHooks/useLanding";
import GameCard from "@/components/GameCard";
import ReviewCard from "@/pages/Landing/ReviewCard";
import { ArrowRight, Sparkles } from "lucide-react";
import { GameLogWithProfile, Game } from "@/Interface";
import { GameListWithGames } from "@/Interface";
import ListCard from "./ListCard";

interface TopReview extends GameLogWithProfile {
  like_count?: number;
}

interface MostRatedGame extends Game {
  review_count?: number;
}

const Landing = () => {
  const topReviews = useTopReviews(6);
  const recentlyReleased = useRecentlyReleased(6);
  const upcomingGames = useUpcomingGames(6);
  const mostRatedGames = useMostRatedGames(6);
  const popularLists = usePopularLists(4);
  const featuredGame = useFeaturedGame();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Stacked Featured Games */}
      <section className="min-h-[80vh] my-12 flex items-center px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Side - Text */}
            <div className="max-w-3xl lg:max-w-xl">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-none">
                Track. Rate.
                <br />
                <span className="text-primary">Remember.</span>
              </h1>

              <p className="text-lg md:text-xl text-base-content/70 mb-10 font-light max-w-xl">
                The modern way to log your gaming journey and discover what to
                play next
              </p>

              <div className="flex gap-3 items-center">
                <Link to="/sign-up" className="btn btn-primary gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/games" className="btn btn-ghost">
                  Browse Games
                </Link>
              </div>
            </div>

            {/* Right Side - Featured Game */}
            <div className="flex-shrink-0">
              {featuredGame.isLoading && (
                <div className="skeleton w-64 md:w-80 h-96 md:h-[480px] rounded-2xl"></div>
              )}

              {featuredGame.data && (
                <div className="text-center">
                  <Link
                    to="/games/$gamesSlug"
                    params={{ gamesSlug: (featuredGame.data as Game).slug }}
                    className="group block relative"
                  >
                    <div className="relative w-64 md:w-80 h-96 md:h-[480px] rounded-2xl overflow-hidden border-2 border-base-300 group-hover:border-primary transition-all duration-300 shadow-2xl">
                      {/* Game Cover */}
                      <img
                        src={`https://images.igdb.com/igdb/image/upload/t_1080p/${(featuredGame.data as Game).cover_id}.jpg`}
                        alt={(featuredGame.data as Game).name}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Game Info - Shows on Hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <h3 className="text-xl md:text-2xl font-bold mb-2">
                          {(featuredGame.data as Game).name}
                        </h3>
                        {(featuredGame.data as Game).first_release_date && (
                          <p className="text-sm text-gray-300">
                            {new Date(
                              (featuredGame.data as Game)
                                .first_release_date as number
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Featured Badge - Below Game */}
                  <div className="flex justify-center mt-4">
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      Featured Game
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Top Reviews Section */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Top Reviews</h2>
          </div>
          {/* <Link to="/reviews" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all
            <ArrowRight className="w-3 h-3" />
          </Link> */}
        </div>

        {topReviews.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-40 w-full rounded-xl"></div>
            ))}
          </div>
        )}

        {topReviews.data && topReviews.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(topReviews.data as TopReview[]).slice(0, 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {topReviews.data && topReviews.data.length === 0 && (
          <div className="text-center py-16 text-base-content/50 text-sm">
            No reviews yet. Be the first to share your thoughts!
          </div>
        )}
      </section>
      {/* Recently Released Games */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-secondary rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Just Released</h2>
          </div>
          <Link
            to="/newly-released"
            search={{ page: 1, sort: "first_release_date", order: "desc" }}
            className="text-sm text-base-content/60 hover:text-primary flex items-center gap-1 transition-all"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentlyReleased.isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="skeleton aspect-[3/4] w-full rounded-lg"
              ></div>
            ))}
          </div>
        )}

        {recentlyReleased.data && recentlyReleased.data.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(recentlyReleased.data as Game[]).map((game) => (
              <GameCard
                key={game.id}
                id={game.id.toString()}
                name={game.name}
                slug={game.slug}
                coverId={game.cover_id || ""}
                first_release_date={
                  game.first_release_date
                    ? new Date(game.first_release_date).toISOString()
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
      {/* Upcoming Games */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-accent rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Coming Soon</h2>
          </div>
          <Link
            to="/upcoming"
            search={{ page: 1, sort: "popularity", order: "desc" }}
            className="text-sm text-base-content/60 hover:text-primary flex items-center gap-1 transition-all"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {upcomingGames.isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="skeleton aspect-[3/4] w-full rounded-lg"
              ></div>
            ))}
          </div>
        )}

        {upcomingGames.data && upcomingGames.data.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(upcomingGames.data as Game[]).map((game) => (
              <GameCard
                key={game.id}
                id={game.id.toString()}
                name={game.name}
                slug={game.slug}
                coverId={game.cover_id || ""}
                first_release_date={
                  game.first_release_date
                    ? new Date(game.first_release_date).toISOString()
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {upcomingGames.data && upcomingGames.data.length === 0 && (
          <div className="text-center py-16 text-base-content/50 text-sm">
            No upcoming games available
          </div>
        )}
      </section>
      {/* Most Rated Games */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-warning rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Most Reviewed</h2>
          </div>
          {/* <Link
            to="/games"
            className="text-sm text-base-content/60 hover:text-primary flex items-center gap-1 transition-all"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link> */}
        </div>

        {mostRatedGames.isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="skeleton aspect-[3/4] w-full rounded-lg"
              ></div>
            ))}
          </div>
        )}

        {mostRatedGames.data && mostRatedGames.data.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(mostRatedGames.data as MostRatedGame[]).map((game) => (
              <MostRatedGameCard
                key={game.id}
                game={game}
                reviewCount={game.review_count || 0}
              />
            ))}
          </div>
        )}
      </section>

      {/* Popular Lists Section */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-info rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Popular Lists</h2>
          </div>
          {/* <Link to="/lists" className="text-sm text-primary hover:underline flex items-center gap-1">
      View all
      <ArrowRight className="w-3 h-3" />
    </Link> */}
        </div>

        {popularLists.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-48 w-full rounded-xl"></div>
            ))}
          </div>
        )}

        {popularLists.data && popularLists.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(popularLists.data as GameListWithGames[]).map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        )}

        {popularLists.data && popularLists.data.length === 0 && (
          <div className="text-center py-16 text-base-content/50 text-sm">
            No public lists yet. Create one to get started!
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Start tracking today
          </h2>
          <p className="text-lg text-base-content/60 mb-8 font-light">
            Never lose track of your gaming backlog again
          </p>
          <Link to="/sign-up" className="btn btn-primary btn-lg gap-2">
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

// Component for Most Rated Game Card
const MostRatedGameCard = ({
  game,
  reviewCount,
}: {
  game: Game;
  reviewCount: number;
}) => {
  return (
    <Link
      to="/games/$gamesSlug"
      params={{ gamesSlug: game.slug }}
      className="group relative rounded-lg overflow-hidden border border-neutral hover:border-primary transition-colors w-full"
    >
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-primary/90 backdrop-blur-sm text-primary-content rounded-full px-3 py-1 text-xs font-bold shadow-lg">
        {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
      </div>

      <div className="aspect-[3/4] w-full">
        <img
          src={`https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover_id}.jpg`}
          className="w-full h-full object-cover rounded-lg transition duration-300 group-hover:brightness-25"
          alt={game.name}
        />

        <div className="absolute inset-0 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-sm font-semibold">{game.name}</h3>
          {game.first_release_date && (
            <p className="text-xs text-gray-300">
              {new Date(game.first_release_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Landing;
