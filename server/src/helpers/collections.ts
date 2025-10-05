import { supabase } from "../lib/supabase";

interface Collection {
  id: number;
  name: string;
  slug: string;
}

export async function ensureCollectionsExist(
  collections: Collection[]
): Promise<void> {
  if (!collections || collections.length === 0) return;

  try {
    const { error } = await supabase.from("collections").upsert(
      collections.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      { onConflict: "id", ignoreDuplicates: true }
    );

    if (error) {
      console.error("Error upserting collections:", error);
    }
  } catch (err) {
    console.error("Failed to ensure collections exist:", err);
  }
}
