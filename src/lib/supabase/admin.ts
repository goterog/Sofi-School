import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const isSupabaseAdminConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

export function createSupabaseWriteClient() {
  if (isSupabaseAdminConfigured) {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return null;
}
