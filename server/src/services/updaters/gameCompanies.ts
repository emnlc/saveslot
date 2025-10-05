import { supabase } from "../../lib/supabase";
import { fetchIGDB } from "../igdb";

export async function ensureCompaniesExist(companyIds: number[]) {
  if (companyIds.length === 0) return;

  // Check which companies already exist
  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .in("id", companyIds);

  const existingIds = new Set(existing?.map((c) => c.id) || []);
  const missingIds = companyIds.filter((id) => !existingIds.has(id));

  if (missingIds.length === 0) return;

  // Fetch and insert missing companies
  const companiesBody = `
    fields id, name, logo.image_id;
    where id = (${missingIds.join(",")});
  `;

  const companies = await fetchIGDB("companies", companiesBody);

  const formatted = companies.map((c: any) => ({
    id: c.id,
    name: c.name,
    logo_image_id: c.logo?.image_id || null,
  }));

  await supabase.from("companies").upsert(formatted, { onConflict: "id" });
  console.log(`Added ${formatted.length} new companies`);
}
