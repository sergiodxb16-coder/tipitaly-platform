import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import type { Suggestion, FlashDeal } from "./DashboardClient";

export const metadata = { title: "Dashboard — TipItaly" };

/* ─── Tipo profilo gusti ─────────────────────────────────────── */
interface TasteProfile {
  luoghi?: string[] | string;
  destinazioni?: string;
  esperienze?: string | string[];
  compagnia?: string;
  budget?: string;
  completedAt?: string;
  version?: number;
}

/* ─── Libreria suggerimenti per area ────────────────────────── */
const SUGGESTION_LIBRARY: Record<string, Suggestion[]> = {
  sardegna: [
    {
      id: "sar-1",
      type: "hotel",
      title: "Mezzatorre Resort & Spa",
      subtitle: "5 stelle sul mare",
      location: "Sardegna Nord, Olbia",
      emoji: "🏖️",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      reason: "Spiaggia privata con acque cristalline, ideale per chi ama il mare senza folla.",
      originalPrice: 480,
      goldPrice: 289,
      discountPct: 40,
      badge: "Mare cristallino",
    },
    {
      id: "sar-2",
      type: "hotel",
      title: "Is Morus Relais",
      subtitle: "Boutique sul Golfo",
      location: "Santa Margherita di Pula, Cagliari",
      emoji: "🌅",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      reason: "Archittura sarda autentica tra pinete e mare. Quiete assoluta.",
      originalPrice: 310,
      goldPrice: 198,
      discountPct: 36,
    },
  ],
  sicilia: [
    {
      id: "sic-1",
      type: "experience",
      title: "Cena privata in Villa del Settecento",
      subtitle: "Esperienza esclusiva",
      location: "Palermo, Sicilia",
      emoji: "🏛️",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      reason: "Solo 8 ospiti a tavola in un palazzo barocco — il cuoco è stellato.",
      originalPrice: 290,
      goldPrice: 175,
      discountPct: 40,
      spotsLeft: 3,
      badge: "Solo 3 posti",
    },
  ],
  toscana: [
    {
      id: "tos-1",
      type: "hotel",
      title: "Borgo San Felice",
      subtitle: "Relais & Châteaux nel Chianti",
      location: "Castelnuovo Berardenga, Siena",
      emoji: "🍷",
      image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&q=80",
      reason: "Un borgo del 1200 convertito in resort. Vigneti a perdita d'occhio, cantina privata.",
      originalPrice: 420,
      goldPrice: 252,
      discountPct: 40,
      badge: "Chianti autentico",
    },
    {
      id: "tos-2",
      type: "experience",
      title: "Terme di Saturnia",
      subtitle: "Wellness resort",
      location: "Saturnia, Grosseto",
      emoji: "♨️",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
      reason: "Terme naturali a 37°C tra le colline della Maremma. Spa all'aperto unica in Europa.",
      originalPrice: 380,
      goldPrice: 228,
      discountPct: 40,
    },
  ],
  venezia: [
    {
      id: "ven-1",
      type: "experience",
      title: "Cena al Palazzo Dandolo",
      subtitle: "Evento privato esclusivo",
      location: "Venezia, Riva degli Schiavoni",
      emoji: "🕯️",
      image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
      reason: "Palazzo del '700 aperto solo per i nostri ospiti. Gondola privata inclusa.",
      originalPrice: 380,
      goldPrice: 228,
      discountPct: 40,
      spotsLeft: 4,
      badge: "Evento esclusivo",
    },
  ],
  roma: [
    {
      id: "rom-1",
      type: "hotel",
      title: "Hotel de Russie",
      subtitle: "5 stelle Rocco Forte",
      location: "Roma, Via del Babuino",
      emoji: "🏛️",
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
      reason: "A 200 metri da Piazza del Popolo. Giardino segreto in piena Roma.",
      originalPrice: 560,
      goldPrice: 336,
      discountPct: 40,
    },
  ],
  amalfi: [
    {
      id: "ama-1",
      type: "hotel",
      title: "Monastero Santa Rosa",
      subtitle: "Hotel & Spa",
      location: "Conca dei Marini, Costiera Amalfitana",
      emoji: "🌊",
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
      reason: "Ex convento del 1600 sulla scogliera. Infinity pool sospesa sul mare.",
      originalPrice: 640,
      goldPrice: 384,
      discountPct: 40,
      badge: "Vista Costiera",
    },
  ],
  dolomiti: [
    {
      id: "dol-1",
      type: "hotel",
      title: "Rosa Alpina Hotel & Spa",
      subtitle: "San Cassiano, Alta Badia",
      location: "San Cassiano, Dolomiti",
      emoji: "⛰️",
      image: "https://images.unsplash.com/photo-1548777123-e216912df7d8?w=800&q=80",
      reason: "Ristorante stellato St. Hubertus incluso. Paesaggio UNESCO a colazione.",
      originalPrice: 510,
      goldPrice: 306,
      discountPct: 40,
    },
  ],
};

/* ─── Suggerimenti generici (fallback) ──────────────────────── */
const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    id: "def-1",
    type: "hotel",
    title: "Borgo San Felice",
    subtitle: "Relais & Châteaux nel Chianti",
    location: "Castelnuovo Berardenga, Siena",
    emoji: "🍷",
    image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&q=80",
    reason: "Un borgo medievale tra i vigneti del Chianti Classico. Cantina privata inclusa.",
    originalPrice: 420,
    goldPrice: 252,
    discountPct: 40,
    badge: "Top Italia",
  },
  {
    id: "def-2",
    type: "hotel",
    title: "Mezzatorre Resort & Spa",
    subtitle: "5 stelle sul mare",
    location: "Sardegna Nord, Olbia",
    emoji: "🏖️",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    reason: "Spiaggia privata con acque turchesi. Transfer incluso dall'aeroporto.",
    originalPrice: 480,
    goldPrice: 289,
    discountPct: 40,
    badge: "Più prenotato",
  },
  {
    id: "def-3",
    type: "experience",
    title: "Cena al Palazzo Dandolo",
    subtitle: "Evento privato esclusivo",
    location: "Venezia, Riva degli Schiavoni",
    emoji: "🕯️",
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
    reason: "Palazzo del '700 riaperto solo per i nostri soci. Solo 8 coperti.",
    originalPrice: 380,
    goldPrice: 228,
    discountPct: 40,
    spotsLeft: 3,
    badge: "Quasi esaurito",
  },
  {
    id: "def-4",
    type: "hotel",
    title: "Monastero Santa Rosa",
    subtitle: "Hotel & Spa sulla Costiera",
    location: "Conca dei Marini, Amalfi",
    emoji: "🌊",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
    reason: "Infinity pool sospesa sul Tirreno. Ex convento del 1600.",
    originalPrice: 640,
    goldPrice: 384,
    discountPct: 40,
    badge: "Esclusivo",
  },
];

/* ─── Flash deal fisso (aggiornabile) ──────────────────────── */
const FLASH_DEAL: FlashDeal = {
  id: "flash-1",
  type: "experience",
  title: "Terme di Saturnia — Weekend Benessere",
  subtitle: "2 notti in suite + spa illimitata",
  location: "Saturnia, Grosseto",
  emoji: "♨️",
  reason: "Sorgenti termali naturali a 37°C, fango terapeutico, ristorante gourmet.",
  originalPrice: 760,
  goldPrice: 380,
  discountPct: 50,
  deadlineIso: new Date(Date.now() + 11 * 3_600_000 + 23 * 60_000).toISOString(), // ~11h da ora
};

/* ─── Featured fisso per il weekend ────────────────────────── */
const FEATURED: Suggestion = {
  id: "feat-1",
  type: "experience",
  title: "Cena al Palazzo Dandolo",
  subtitle: "Evento serale esclusivo",
  location: "Venezia — Riva degli Schiavoni",
  emoji: "🕯️",
  image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
  reason: "Palazzo veneziano del '700 aperto solo per i nostri soci. Menu degustazione 7 portate con sommelier.",
  originalPrice: 380,
  goldPrice: 228,
  discountPct: 40,
  spotsLeft: 4,
};

/* ─── Genera suggerimenti dal profilo ───────────────────────── */
function buildSuggestions(tasteProfile: TasteProfile): Suggestion[] {
  const raw =
    tasteProfile.destinazioni ??
    (Array.isArray(tasteProfile.luoghi)
      ? tasteProfile.luoghi.join(" ")
      : tasteProfile.luoghi ?? "");

  const dest = raw.toLowerCase();

  const collected: Suggestion[] = [];
  const keys = Object.keys(SUGGESTION_LIBRARY);

  for (const key of keys) {
    if (dest.includes(key)) {
      collected.push(...SUGGESTION_LIBRARY[key]);
    }
    if (collected.length >= 4) break;
  }

  // Se non abbastanza, aggiungi dal default
  if (collected.length < 3) {
    for (const s of DEFAULT_SUGGESTIONS) {
      if (!collected.find((c) => c.id === s.id)) {
        collected.push(s);
        if (collected.length >= 4) break;
      }
    }
  }

  return collected.slice(0, 4);
}

/* ─── Pagina principale ─────────────────────────────────────── */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const admin = createAdminClient();

  // 1. Cardholder
  const { data: cardholder, error: chErr } = await admin
    .from("Cardholder")
    .select("id, email, nome, cognome, tasteProfile, onboardingCompleted")
    .eq("supabaseUid", user.id)
    .maybeSingle();

  if (chErr) console.error("[dashboard] cardholder error:", chErr);
  if (!cardholder) redirect("/onboarding"); // NON rimandare a /auth/login — crea un loop con il middleware

  // 2. Se onboarding non completato → redirect
  if (!cardholder.onboardingCompleted) redirect("/onboarding");

  // 3. Card assignment
  const { data: assignmentRow } = await admin
    .from("CardAssignment")
    .select("id, Card(id, serialNumber, level, status, expiresAt, activatedAt)")
    .eq("cardholderId", cardholder.id)
    .order("assignedAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const card = assignmentRow?.Card as any;
  const cardActive: boolean = card?.status === "ACTIVE";
  const cardLevel: string | null = card?.level ?? null;

  // 4. Taste profile
  const tasteProfile: TasteProfile = (cardholder.tasteProfile as TasteProfile) ?? {};

  // 5. Suggerimenti curati
  const suggestions = buildSuggestions(tasteProfile);

  return (
    <DashboardClient
      nome={cardholder.nome ?? ""}
      genere={null} // TODO: aggiungere campo genere al Cardholder e leggerlo qui
      tasteProfile={tasteProfile}
      cardActive={cardActive}
      cardLevel={cardLevel}
      suggestions={suggestions}
      featured={FEATURED}
      flash={FLASH_DEAL}
    />
  );
}
