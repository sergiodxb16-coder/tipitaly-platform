import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/callback",
  "/auth/confirm",
  "/auth/signout",
  "/acquista",
  "/api/pricing",
  "/api/stripe/checkout",
  "/api/stripe/webhook",
  "/api/dev/login", // DEV ONLY — bypassa il rate limit email in sviluppo
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Helper: crea redirect copiando gli header Set-Cookie di Supabase (evita loop da token refresh perso)
  function makeRedirect(destination: string, search = "") {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    url.search = search;
    const res = NextResponse.redirect(url);
    supabaseResponse.headers.getSetCookie().forEach((setCookie) => {
      res.headers.append("Set-Cookie", setCookie);
    });
    return res;
  }

  if (!user && !isPublic) {
    return makeRedirect("/auth/login");
  }

  if (user && pathname === "/auth/login") {
    return makeRedirect("/dashboard");
  }

  // Company employees: provision Cardholder on first web-app access
  if (user && !isPublic && !pathname.startsWith("/api/")) {
    const role = (user.user_metadata?.role as string | undefined) ?? "";
    if (role === "company_employee") {
      const isSynced = request.cookies.get("_emp_synced")?.value === "1";
      if (!isSynced) {
        return makeRedirect(
          "/api/employee/sync",
          `?redirect=${encodeURIComponent(pathname + request.nextUrl.search)}`
        );
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
