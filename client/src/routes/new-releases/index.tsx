import { createFileRoute } from "@tanstack/react-router";
import NewlyReleased from "@/pages/Games/NewlyReleased";
import { useEffect } from "react";

const validSortValues = ["popularity", "name", "first_release_date"] as const;
const validOrderValues = ["asc", "desc"] as const;

type SortOption = (typeof validSortValues)[number];
type OrderOption = (typeof validOrderValues)[number];

function isValidSort(value: unknown): value is SortOption {
  return validSortValues.includes(value as SortOption);
}

function isValidOrder(value: unknown): value is OrderOption {
  return validOrderValues.includes(value as OrderOption);
}

export const Route = createFileRoute("/new-releases/")({
  component: RouteComponent,
  validateSearch: (search) => {
    const sort: SortOption = isValidSort(search.sort)
      ? search.sort
      : "popularity";
    const page = Number(search.page ?? 1);
    const order: OrderOption = isValidOrder(search.order)
      ? search.order
      : "desc";

    return { page, sort, order };
  },
});

function RouteComponent() {
  useEffect(() => {
    document.title = "New Releases | Games";
  });

  return <NewlyReleased />;
}
