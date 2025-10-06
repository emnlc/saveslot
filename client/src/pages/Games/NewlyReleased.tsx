import { useAllNewlyReleasedGames } from "@/hooks/GameHooks/useAllNewlyReleasedGames";
import GameCard from "@/components/GameCard";

import { useEffect, useState } from "react";
import { Route as NewlyReleasedRoute } from "../../routes/newly-released";
type SortOption = "popularity" | "name" | "first_release_date";

import { ArrowDown, ArrowUp } from "lucide-react";
import Pagination from "@/components/controls/Pagination";

const sortLabels: Record<SortOption, string> = {
  popularity: "Popularity",
  name: "Name",
  first_release_date: "Release Date",
};

const NewlyReleased = () => {
  const search = NewlyReleasedRoute.useSearch();
  const navigate = NewlyReleasedRoute.useNavigate();

  const [page, setPage] = useState(1);
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
            <GameCard
              id={game.id.toString()}
              name={game.name}
              slug={game.slug}
              coverId={game.cover_id}
              release_date_human={game.release_date_human}
            />
          ))}

          <div className="col-span-full join mt-8 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NewlyReleased;
