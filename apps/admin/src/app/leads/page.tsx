"use client";

import { useEffect, useState, useTransition } from "react";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
type CompanySize = "MICRO" | "SMALL" | "MEDIUM" | "LARGE";

interface B2bLead {
  id: string;
  ragioneSociale: string;
  pIva: string | null;
  emailReferente: string;
  nomeReferente: string | null;
  ruoloReferente: string | null;
  settore: string | null;
  dimensione: CompanySize | null;
  citta: string | null;
  status: LeadStatus;
  notes: string | null;
  emailSentAt: string | null;
  emailSubject: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nuovo",
  CONTACTED: "Contattato",
  QUALIFIED: "Qualificato",
  CONVERTED: "Convertito",
  LOST: "Perso",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "#6b7280",
  CONTACTED: "#2563eb",
  QUALIFIED: "#d97706",
  CONVERTED: "#16a34a",
  LOST: "#dc2626",
};

const SIZE_LABELS: Record<CompanySize, string> = {
  MICRO: "1-9",
  SMALL: "10-49",
  MEDIUM: "50-249",
  LARGE: "250+",
};

const emptyForm = {
  ragioneSociale: "",
  pIva: "",
  emailReferente: "",
  nomeReferente: "",
  ruoloReferente: "",
  settore: "",
  dimensione: "" as CompanySize | "",
  sitoWeb: "",
  citta: "",
  notes: "",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<B2bLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "ALL">("ALL");

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadLeads = async () => {
    setLoading(true);
    const url = filterStatus === "ALL" ? "/api/leads" : `/api/leads?status=${filterStatus}`;
    const res = await fetch(url);
    const data = await res.json();
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { loadLeads(); }, [filterStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...form };
    if (!body.dimensione) delete (body as any).dimensione;
    if (!body.pIva) delete (body as any).pIva;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setForm(emptyForm);
      setShowForm(false);
      showToast("Lead aggiunto ✓", true);
      loadLeads();
    } else {
      const err = await res.json();
      showToast(err.error ?? "Errore", false);
    }
  };

  const handleSendEmail = async (lead: B2bLead) => {
    if (!confirm(`Inviare email outreach a ${lead.emailReferente}?`)) return;
    setSendingId(lead.id);
    const res = await fetch(`/api/leads/${lead.id}/email`, { method: "POST" });
    setSendingId(null);
    if (res.ok) {
      showToast("Email inviata ✓", true);
      loadLeads();
    } else {
      const err = await res.json();
      showToast(err.error ?? "Errore invio", false);
    }
  };

  const filtered = filterStatus === "ALL"
    ? leads
    : leads.filter((l) => l.status === filterStatus);

  return (
    <div style={styles.page}>
      {/* Toast */}
      {toast && (
        <div style={{ ...styles.toast, background: toast.ok ? "#16a34a" : "#dc2626" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Agent 01 — B2B Leads</h1>
          <p style={styles.subtitle}>{leads.length} lead totali</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annulla" : "+ Nuovo lead"}
        </button>
      </div>

      {/* Filtri status */}
      <div style={styles.filters}>
        {(["ALL", "NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              ...styles.filterBtn,
              ...(filterStatus === s ? styles.filterBtnActive : {}),
            }}
          >
            {s === "ALL" ? "Tutti" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Form nuovo lead */}
      {showForm && (
        <form onSubmit={handleCreate} style={styles.form}>
          <h2 style={styles.formTitle}>Nuovo lead B2B</h2>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Ragione sociale *</label>
              <input style={styles.input} required value={form.ragioneSociale}
                onChange={(e) => setForm({ ...form, ragioneSociale: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email referente *</label>
              <input style={styles.input} type="email" required value={form.emailReferente}
                onChange={(e) => setForm({ ...form, emailReferente: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Nome referente</label>
              <input style={styles.input} value={form.nomeReferente}
                onChange={(e) => setForm({ ...form, nomeReferente: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Ruolo</label>
              <input style={styles.input} placeholder="es. HR Manager" value={form.ruoloReferente}
                onChange={(e) => setForm({ ...form, ruoloReferente: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Settore</label>
              <input style={styles.input} placeholder="es. Moda, Finanza, Tech" value={form.settore}
                onChange={(e) => setForm({ ...form, settore: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Dimensione</label>
              <select style={styles.input} value={form.dimensione}
                onChange={(e) => setForm({ ...form, dimensione: e.target.value as CompanySize | "" })}>
                <option value="">—</option>
                <option value="MICRO">Micro (1-9)</option>
                <option value="SMALL">Piccola (10-49)</option>
                <option value="MEDIUM">Media (50-249)</option>
                <option value="LARGE">Grande (250+)</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>P.IVA</label>
              <input style={styles.input} value={form.pIva}
                onChange={(e) => setForm({ ...form, pIva: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Città</label>
              <input style={styles.input} value={form.citta}
                onChange={(e) => setForm({ ...form, citta: e.target.value })} />
            </div>
            <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Note</label>
              <textarea style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
            <button type="submit" style={styles.btnPrimary} disabled={saving}>
              {saving ? "Salvataggio..." : "Aggiungi lead"}
            </button>
            <button type="button" style={styles.btnSecondary} onClick={() => setShowForm(false)}>
              Annulla
            </button>
          </div>
        </form>
      )}

      {/* Tabella leads */}
      {loading ? (
        <p style={{ padding: "40px", color: "#6b7280", textAlign: "center" }}>Caricamento...</p>
      ) : filtered.length === 0 ? (
        <p style={{ padding: "40px", color: "#6b7280", textAlign: "center" }}>
          Nessun lead {filterStatus !== "ALL" ? `in stato ${STATUS_LABELS[filterStatus]}` : ""}. Aggiungine uno sopra.
        </p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Azienda", "Referente", "Email", "Settore", "Dim.", "Status", "Email inviata", "Azioni"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.companyName}>{lead.ragioneSociale}</div>
                    {lead.citta && <div style={styles.small}>{lead.citta}</div>}
                  </td>
                  <td style={styles.td}>
                    <div>{lead.nomeReferente ?? "—"}</div>
                    {lead.ruoloReferente && <div style={styles.small}>{lead.ruoloReferente}</div>}
                  </td>
                  <td style={styles.td}>{lead.emailReferente}</td>
                  <td style={styles.td}>{lead.settore ?? "—"}</td>
                  <td style={styles.td}>
                    {lead.dimensione ? SIZE_LABELS[lead.dimensione] : "—"}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: STATUS_COLORS[lead.status] + "20",
                      color: STATUS_COLORS[lead.status],
                      borderColor: STATUS_COLORS[lead.status] + "40",
                    }}>
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {lead.emailSentAt
                      ? new Date(lead.emailSentAt).toLocaleDateString("it-IT")
                      : "—"}
                  </td>
                  <td style={styles.td}>
                    {lead.status !== "CONVERTED" && lead.status !== "LOST" && (
                      <button
                        onClick={() => handleSendEmail(lead)}
                        disabled={sendingId === lead.id}
                        style={lead.status === "CONTACTED" ? styles.btnResend : styles.btnSend}
                      >
                        {sendingId === lead.id
                          ? "Invio..."
                          : lead.status === "CONTACTED"
                          ? "Re-invia"
                          : "Invia email"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: "relative",
  },
  toast: {
    position: "fixed",
    top: "24px",
    right: "24px",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    zIndex: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "4px 0 0",
  },
  filters: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: "13px",
    color: "#6b7280",
    cursor: "pointer",
  },
  filterBtnActive: {
    background: "#111827",
    color: "#fff",
    border: "1px solid #111827",
  },
  form: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "32px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    color: "#111827",
    background: "#fff",
    outline: "none",
  },
  btnPrimary: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    fontSize: "14px",
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  tr: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "14px 16px",
    color: "#374151",
    verticalAlign: "middle",
  },
  companyName: {
    fontWeight: "600",
    color: "#111827",
  },
  small: {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "2px",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    border: "1px solid",
  },
  btnSend: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnResend: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#6b7280",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};
