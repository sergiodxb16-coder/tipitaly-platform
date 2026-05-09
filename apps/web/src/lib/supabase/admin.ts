import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client that uses the service-role key.
 * Bypasses RLS and PgBouncer — uses PostgREST (HTTP) not a direct TCP connection.
 * Never expose this to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
