import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

export type AppRole = "admin" | "parent";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
};

export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Components cannot set cookies; middleware and route handlers can.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Server Components cannot remove cookies; middleware and route handlers can.
        }
      }
    }
  });
}

export async function getCurrentSession() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      configured: false,
      supabase: null,
      user: null,
      profile: null as Profile | null
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      configured: true,
      supabase,
      user: null,
      profile: null as Profile | null
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return {
    configured: true,
    supabase,
    user,
    profile
  };
}
