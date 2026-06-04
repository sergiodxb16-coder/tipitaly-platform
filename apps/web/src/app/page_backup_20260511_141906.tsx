import Link from "next/link";

const BENEFITS = [
  { icon: "🏨", title: "Hotel fino a −80%", desc: "2,9 milioni di strutture in tutto il mondo a tariffe riservate." },
  { icon: "✈️", title: "Voli scontati", desc: "Tariffe esclusive su tutti i principali aeroporti italiani ed europei." },
  { icon: "🎟️", title: "Coupon partner", desc: "Sconti esclusivi presso ristoranti, spa, negozi e servizi selezionati." },
  { icon: "⚖️", title: "Tutela legale 24/7", desc: "Consulenza legale sempre disponibile. Inclusa da GOLD in su." },
  { icon: "🚗", title: "Soccorso stradale", desc: "Assistenza su strada in tutta Italia. Inclusa con PLATINUM." },
  { icon: "🤖", title: "Assistente AI", desc: "TIPA ti aiuta a prenotare, usare i coupon e risponde a ogni domanda." },
];

const TIERS = [
  {
    level: "WHITE",
    tagline: "Inizia a risparmiare",
    price: "€29",
    popular: false,
    features: [
      { text: "Travel Advantage (−80%)", included: true },
      { text: "Coupon partner esclusivi", included: true },
      { text: "Sconto hotel −5%", included: true },
      { text: "Assistente AI TIPA", included: true },
      { text: "Tutela legale 24/7", included: false },
      { text: "Soccorso stradale 24/7", included: false },
    ],
  },
  {
    level: "GOLD",
    tagline: "Il più scelto",
    price: "€49",
    popular: true,
    features: [
      { text: "Travel Advantage (−80%)", included: true },
      { text: "Coupon partner esclusivi", included: true },
      { text: "Sconto hotel −10%", included: true },
      { text: "Assistente AI TIPA", included: true },
      { text: "Tutela legale 24/7", included: true },
      { text: "Soccorso stradale 24/7", included: false },
    ],
  },
  {
    level: "PLATINUM",
    tagline: "Massima protezione",
    price: "€79",
    popular: false,
    features: [
      { text: "Travel Advantage (−80%)", included: true },
      { text: "Coupon partner esclusivi", included: true },
      { text: "Sconto hotel −15%", included: true },
      { text: "Assistente AI TIPA", included: true },
      { text: "Tutela legale 24/7", included: true },
      { text: "Soccorso stradale 24/7", included: true },
    ],
  },
];

const FAQS = [
  {
    q: "È un abbonamento mensile?",
    a: "No. Paghi una volta sola e la card è tua per sempre (validità 3 anni, rinnovabile).",
  },
  {
    q: "Come ricevo la card?",
    a: "La card fisica viene spedita al tuo indirizzo entro 5-7 giorni lavorativi. Puoi usare i vantaggi digitali da subito dopo l'attivazione.",
  },
  {
    q: "Come funzionano gli sconti hotel?",
    a: "Accedi alla sezione Travel della tua dashboard e cerca hotel o voli. I prezzi mostrati includono già il tuo sconto per livello card.",
  },
  {
    q: "Posso usarla anche fuori dall'Italia?",
    a: "Sì. Travel Advantage funziona in tutto il mondo. I coupon partner sono principalmente in Italia, UK e Svizzera.",
  },
];

const STATS = [
  { value: "2,9M+", label: "Strutture convenzionate" },
  { value: "−80%", label: "Sconto massimo hotel" },
  { value: "3", label: "Paesi supportati" },
  { value: "24/7", label: "Assistenza inclusa" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-orange-600 tracking-tight">tip.italy</span>
          <div className="hidden items-center gap-8 sm:flex">
            <a href="#vantaggi" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Vantaggi</a>
            <a href="#prezzi" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Prezzi</a>
            <a href="#faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900">Accedi</Link>
            <Link
              href="/acquista"
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
            >
              Acquista la Card
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-b from-orange-50 to-white px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5 text-xs font-medium text-orange-700 shadow-sm">
            ✈️ Disponibile in Italia, UK e Svizzera
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            La card che ti fa{" "}
            <span className="text-orange-600">risparmiare</span>
            <br />su viaggi, hotel e molto altro
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-500 leading-relaxed">
            Hotel fino all&apos;80% in meno, voli scontati, coupon partner esclusivi,
            tutela legale e soccorso stradale. Tutto in una card. Pagamento unico.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/acquista"
              className="w-full rounded-xl bg-orange-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-orange-700 transition-colors sm:w-auto"
            >
              Scopri le card →
            </Link>
            <a
              href="#vantaggi"
              className="w-full rounded-xl border border-orange-200 bg-white px-8 py-3.5 text-base font-semibold text-orange-700 hover:bg-orange-50 transition-colors sm:w-auto"
            >
              Come funziona
            </a>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-orange-600">{s.value}</p>
                <p className="mt-1 text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="vantaggi" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-600">Vantaggi inclusi</p>
            <h2 className="text-3xl font-bold text-gray-900">Tutto quello che ottieni</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-gray-100 p-6 hover:border-orange-200 hover:shadow-sm transition-all">
                <div className="mb-3 text-3xl">{b.icon}</div>
                <h3 className="mb-1 font-semibold text-gray-900">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="prezzi" className="bg-orange-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-600">Piani</p>
            <h2 className="text-3xl font-bold text-gray-900">Scegli la tua card</h2>
            <p className="mt-3 text-gray-500">Pagamento unico — nessun abbonamento mensile.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.level}
                className={`relative flex flex-col rounded-2xl bg-white p-6 ${
                  tier.popular
                    ? "border-2 border-orange-500 shadow-lg"
                    : "border border-gray-200"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-semibold text-white">
                    Più popolare
                  </span>
                )}
                <p className="text-lg font-bold text-gray-900">{tier.level}</p>
                <p className="mt-0.5 text-sm text-gray-400">{tier.tagline}</p>
                <p className="mt-4 text-4xl font-bold text-orange-600">{tier.price}</p>
                <p className="text-xs text-gray-400">pagamento unico · IVA inclusa</p>
                <hr className="my-5 border-gray-100" />
                <ul className="flex-1 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 font-bold ${f.included ? "text-orange-500" : "text-gray-200"}`}>
                        {f.included ? "✓" : "✗"}
                      </span>
                      <span className={f.included ? "text-gray-700" : "text-gray-300"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/acquista?level=${tier.level}`}
                  className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                    tier.popular
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  Acquista {tier.level}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-600">FAQ</p>
            <h2 className="text-3xl font-bold text-gray-900">Domande frequenti</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-gray-100 p-5">
                <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-900 marker:content-none">
                  {faq.q}
                  <span className="ml-4 flex-shrink-0 text-orange-400 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="bg-orange-600 px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl font-bold">Pronto a risparmiare?</h2>
          <p className="mt-3 text-orange-100">
            Unisciti a migliaia di titolari TipItaly e accedi a vantaggi esclusivi da oggi.
          </p>
          <Link
            href="/acquista"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Acquista la tua Card →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white px-6 py-10">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-lg font-bold text-orange-600">tip.italy</span>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Termini</a>
            <a href="mailto:supporto@tipitaly.it" className="hover:text-gray-600">Supporto</a>
          </div>
          <p className="text-xs text-gray-300">© 2026 innovavalore srl</p>
        </div>
      </footer>
    </main>
  );
}
