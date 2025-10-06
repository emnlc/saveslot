// routes/search/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import SearchPage from "@/pages/Search/SearchPage";

export const Route = createFileRoute("/search/")({
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || "",
      category: (search.category as string) || undefined,
    };
  },
});
