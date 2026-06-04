import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncCompanyEmployee } from "@tip-italy/db/auth";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  await syncCompanyEmployee(user);

  const redirectTo = request.nextUrl.searchParams.get("redirect") ?? "/dashboard/travel";
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set("_emp_synced", "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
