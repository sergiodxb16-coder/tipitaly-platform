import { getRevenueByCountry } from "@tip-italy/db/purchases";

const PERIOD_DAYS: Record<string, number> = {
  "30": 30,
  "90": 90,
  "365": 365,
};

const FLAG: Record<string, string> = { IT: "🇮🇹", GB: "🇬🇧", CH: "🇨🇭" };

function fmt(amount: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "30" } = await searchParams;
  const days = PERIOD_DAYS[period] ?? 30;
  const fromDate = new Date(Date.now() - days * 86_400_000);

  const rows = await getRevenueByCountry(fromDate);

  const totals = rows.reduce(
    (acc, r) => ({
      orders: acc.orders + r.orders,
      gross: acc.gross + r.grossRevenue,
      tax: acc.tax + r.totalTax,
      net: acc.net + r.netRevenue,
    }),
    { orders: 0, gross: 0, tax: 0, net: 0 }
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Revenue per Paese</h1>
        <form>
          <select
            name="period"
            defaultValue={period}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("period", e.target.value);
              window.location.href = url.toString();
            }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="30">Ultimi 30 giorni</option>
            <option value="90">Ultimi 90 giorni</option>
            <option value="365">Ultimo anno</option>
          </select>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Paese</th>
              <th className="px-4 py-3">Valuta</th>
              <th className="px-4 py-3 text-right">Ordini</th>
              <th className="px-4 py-3 text-right">Lordo</th>
              <th className="px-4 py-3 text-right">IVA</th>
              <th className="px-4 py-3 text-right">Netto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Nessun ordine nel periodo selezionato
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={`${row.country}-${row.currency}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {FLAG[row.country] ?? ""} {row.country}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{row.currency}</td>
                  <td className="px-4 py-3 text-right">{row.orders}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(row.grossRevenue, row.currency)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{fmt(row.totalTax, row.currency)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">{fmt(row.netRevenue, row.currency)}</td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td className="px-4 py-3 text-gray-700" colSpan={2}>Totale</td>
                <td className="px-4 py-3 text-right">{totals.orders}</td>
                <td className="px-4 py-3 text-right">—</td>
                <td className="px-4 py-3 text-right">—</td>
                <td className="px-4 py-3 text-right">—</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-400">
        * I totali multi-valuta non sono aggregabili direttamente — ogni riga è nella propria valuta.
      </p>
    </div>
  );
}
