import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseService = process.env.SUPABASE_SERVICE!;

export const supabase = createClient(supabaseUrl, supabaseService);
