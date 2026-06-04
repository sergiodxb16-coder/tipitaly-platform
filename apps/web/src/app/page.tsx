import Link from 'next/link'

// ── Dati statici ──────────────────────────────────────────────────────────────

const plans = [
  {
    name: 'WHITE',
    price: '29',
    tagline: 'Ideale per iniziare',
    badge: 'bg-gray-100 text-gray-500',
    benefits: [
      'Hotel partner convenzionati',
      'Coupon base (20+ offerte)',
      'Soccorso stradale H24',
    ],
    cta: 'Inizia con WHITE',
    highlight: false,
  },
  {
    name: 'GOLD',
    price: '79',
    tagline: 'Il più scelto',
    badge: 'bg-orange-100 text-orange-700',
    popular: true,
    benefits: [
      'Hotel partner – sconto 20%',
      'Voli a tariffe esclusive',
      'Coupon premium (50+ offerte)',
      'Tutela legale gratuita 24/7',
      'Soccorso stradale H24',
    ],
    cta: 'Scegli GOLD',
    highlight: true,
  },
  {
    name: 'PLATINUM',
    price: '149',
    tagline: 'Il meglio di tutto',
    badge: 'bg-gray-900 text-white',
    benefits: [
      'Hotel partner – sconto 30%',
      'Voli priority booking',
      'Coupon elite (100+ offerte)',
      'Tutela legale + consulenza',
      'Soccorso stradale Premium',
      'Assistenza clienti dedicata',
    ],
    cta: 'Scegli PLATINUM',
    highlight: false,
  },
]

const benefits = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    title: 'Hotel partner',
    desc: 'Sconti esclusivi in centinaia di strutture convenzionate in Italia e in Europa.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
    title: 'Voli scontati',
    desc: 'Tariffe preferenziali con le principali compagnie aeree partner.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
      </svg>
    ),
    title: 'Coupon & offerte',
    desc: 'Accesso a coupon esclusivi da oltre 200 partner commerciali in tutta Italia.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Tutela legale',
    desc: 'Assistenza legale gratuita 24/7 per te e la tua famiglia, inclusa nel piano GOLD e PLATINUM.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Soccorso stradale',
    desc: 'Assistenza stradale H24 in Italia e in tutta Europa, senza costi aggiuntivi.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: 'Partner privilegiati',
    desc: 'Accesso a eventi e offerte esclusive riservate ai soli titolari TipItaly Card.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Scegli il piano',
    desc: "Seleziona WHITE, GOLD o PLATINUM in base alle tue esigenze e completa l'acquisto in pochi click con Stripe.",
  },
  {
    n: '02',
    title: 'Ricevi e attiva',
    desc: 'La card fisica arriva a casa entro 7 giorni lavorativi. Attivala in un secondo con il numero seriale.',
  },
  {
    n: '03',
    title: 'Goditi i vantaggi',
    desc: 'Accedi a hotel, voli, coupon e tutti i servizi inclusi direttamente dalla tua dashboard personale.',
  },
]

const faqs = [
  {
    q: 'Come funziona la TipItaly Card?',
    a: "Acquisti la card online, la ricevi a casa per posta e la attivi con il numero seriale. Da quel momento hai accesso immediato a tutti i vantaggi del tuo livello — coupon, hotel, tutela legale e altro.",
  },
  {
    q: 'Posso cambiare piano in seguito?',
    a: "Sì, puoi fare upgrade al livello superiore in qualsiasi momento dalla tua dashboard. La differenza di prezzo viene calcolata proporzionalmente ai mesi rimanenti.",
  },
  {
    q: 'Quanto tempo ci vuole per ricevere la card?',
    a: 'La card fisica arriva entro 5–7 giorni lavorativi. I vantaggi digitali (coupon, tutela legale) sono disponibili immediatamente dopo il pagamento.',
  },
  {
    q: "Il rinnovo è automatico?",
    a: "Sì, l'abbonamento si rinnova automaticamente ogni anno. Puoi disattivare il rinnovo in qualsiasi momento dalla dashboard senza costi aggiuntivi.",
  },
  {
    q: 'La tutela legale è davvero gratuita?',
    a: 'Sì, è inclusa nei piani GOLD e PLATINUM senza costi extra. Copre consulenze legali telefoniche illimitate, assistenza in controversie civili e tutela del consumatore.',
  },
]

// ── Componente CheckIcon ────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )
}

// ── Pagina principale ───────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="bg-white">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-white pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            Disponibile in Italia, UK e Svizzera
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
            Il privilegio di viaggiare<br />
            <span className="text-orange-600">e vivere meglio</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Una card. Hotel, voli, coupon, tutela legale e soccorso stradale.
            Tutto incluso nel tuo abbonamento annuale TipItaly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/acquista"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 active:scale-95 transition-all text-lg"
            >
              Acquista la card
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
            <a
              href="#vantaggi"
              className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-colors text-lg"
            >
              Scopri i vantaggi
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-xs mx-auto">
            {[['200+', 'Partner'], ['3', 'Paesi'], ['24/7', 'Assistenza']].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{val}</div>
                <div className="text-sm text-gray-400 mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="prezzi" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Scegli il tuo piano
            </h2>
            <p className="text-gray-500 text-lg">Tutti i piani includono la card fisica spedita gratis a casa tua</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl p-6 flex flex-col ${
                  plan.highlight
                    ? 'border-2 border-orange-500 shadow-xl shadow-orange-100 md:-mt-4 md:pb-10'
                    : 'border border-gray-100 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                    <span className="bg-orange-600 text-white text-xs font-bold tracking-wide px-4 py-1 rounded-full uppercase">
                      Più popolare
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <span className={`inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4 ${plan.badge}`}>
                    {plan.name}
                  </span>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-400 text-sm">/ anno</span>
                  </div>
                  <p className="text-gray-500 text-sm">{plan.tagline}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckIcon />
                      {b}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/acquista?piano=${plan.name.toLowerCase()}`}
                  className={`block text-center py-3.5 px-6 rounded-xl font-semibold transition-all active:scale-95 ${
                    plan.highlight
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────── */}
      <section id="vantaggi" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Tutto incluso nella tua card
            </h2>
            <p className="text-gray-500 text-lg">Vantaggi concreti per ogni momento della tua vita</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group bg-gray-50 hover:bg-orange-50 rounded-2xl p-6 transition-colors"
              >
                <div className="mb-4">{b.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-orange-700 transition-colors">
                  {b.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Come funziona
          </h2>
          <p className="text-orange-100 text-lg mb-14">Tre passi e sei operativo</p>

          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{s.n}</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-orange-100 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Domande frequenti
            </h2>
            <p className="text-gray-500">Tutto quello che vuoi sapere prima di iniziare</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-gray-50 hover:bg-orange-50 rounded-2xl open:bg-orange-50 transition-colors"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-medium text-gray-900 group-open:text-orange-700">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 group-open:text-orange-500 transition-transform shrink-0 ml-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </summary>
                <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Pronto a iniziare?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Unisciti a migliaia di italiani che già risparmiano con TipItaly.
          </p>
          <Link
            href="/acquista"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 active:scale-95 transition-all text-lg"
          >
            Acquista la tua card
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <p className="text-gray-600 text-sm mt-4">
            Card fisica inclusa · Spedizione gratuita · Garanzia soddisfatti
          </p>
        </div>
      </section>

    </main>
  )
}
