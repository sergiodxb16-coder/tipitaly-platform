import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-600">TipItaly Card</h1>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Esci
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-gray-500 text-sm">Connesso come: {user.email}</p>
        <p className="mt-4 text-gray-400 text-sm italic">Dashboard in costruzione — prossimi passi: attivazione card, vantaggi, coupon.</p>
      </div>
    </main>
  );
}
