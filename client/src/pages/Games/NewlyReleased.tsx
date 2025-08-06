import { Link } from "@tanstack/react-router";
import { useAllNewlyReleasedGames } from "@/hooks/GameHooks/useAllNewlyReleasedGames";

import { useEffect } from "react";
import { Route as NewlyReleasedRoute } from "../../routes/newly-released";
type SortOption = "popularity" | "name" | "first_release_date";

import { ArrowDown, ArrowUp } from "lucide-react";

const sortLabels: Record<SortOption, string> = {
  popularity: "Popularity",
  name: "Name",
  first_release_date: "Release Date",
};

const NewlyReleased = () => {
  const search = NewlyReleasedRoute.useSearch();
  const navigate = NewlyReleasedRoute.useNavigate();

  const page = search.page ?? 1;
  const sort = search.sort ?? "popularity";
  const order = search.order ?? "desc";

  const { data, isLoading, isError } = useAllNewlyReleasedGames(
    page,
    sort,
    order
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) });
  };

  if (isLoading) return <div className="min-h-screen" />;
  if (isError || !data) return <p>Error fetching game data.</p>;

  const sortOptions: SortOption[] = [
    "popularity",
    "name",
    "first_release_date",
  ];
  const isAscending = order === "asc";

  return (
    <>
      <div>
        <div className="flex justify-between items-center gap-2 md:mx-auto my-4 px-4 container">
          <span className="text-sm">Games Released Within 90 Days</span>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn m-1">
              Sort: {sortLabels[sort]}
              {isAscending ? (
                <ArrowUp className="w-5" />
              ) : (
                <ArrowDown className="w-5" />
              )}
            </label>

            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {sortOptions.map((value) => {
                const isActive = sort === value;

                return (
                  <li key={value}>
                    <a
                      className={`justify-between ${isActive ? "text-primary font-semibold" : ""}`}
                      onClick={() =>
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            sort: value,
                            order: isActive
                              ? isAscending
                                ? "desc"
                                : "asc"
                              : "asc",
                            page: 1,
                          }),
                        })
                      }
                    >
                      {sortLabels[value]}
                      {isActive &&
                        (isAscending ? (
                          <ArrowUp className="w-5" />
                        ) : (
                          <ArrowDown className="w-5" />
                        ))}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:mx-auto px-4 container mb-16 gap-4 place-items-center join">
          {data.games.map((game) => (
            <Link
              key={game.id}
              to="/games/$gamesSlug"
              params={{ gamesSlug: game.slug }}
              className="group relative rounded-lg overflow-hidden border border-neutral hover:border-primary transition-colors w-full"
            >
              <div className="aspect-[3/4] w-full">
                <img
                  src={`https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover_id}.jpg`}
                  className="w-full h-full object-cover rounded-lg transition duration-300 group-hover:brightness-25"
                />

                {/* Hover Info Overlay */}
                <div className="absolute inset-0  text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-sm font-semibold">{game.name}</h3>
                  {game.first_release_date && (
                    <p className="text-xs text-gray-300">
                      {new Date(game.first_release_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}

          <div className="col-span-full join mt-8 flex justify-center">
            {[...Array(data.totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn ${page === i + 1 ? "btn-active text-primary" : ""}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewlyReleased;
