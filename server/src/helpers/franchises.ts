import { supabase } from "../lib/supabase";

interface Franchise {
  id: number;
  name: string;
  slug: string;
}

export async function ensureFranchisesExist(
  franchises: Franchise[]
): Promise<void> {
  if (!franchises || franchises.length === 0) return;

  try {
    const { error } = await supabase.from("franchises").upsert(
      franchises.map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
      })),
      { onConflict: "id", ignoreDuplicates: true }
    );

    if (error) {
      console.error("Error upserting franchises:", error);
    }
  } catch (err) {
    console.error("Failed to ensure franchises exist:", err);
  }
}
