import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { UserButton, useUser, useAuth } from "@clerk/clerk-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = {
  bg: "#000000",
  bgCard: "#111318",
  bgCardHover: "#161921",
  border: "#1e2130",
  borderLight: "#2a2d42",
  accent: "#c9a227",
  accentDim: "rgba(201, 162, 39, 0.15)",
  accentGlow: "rgba(201, 162, 39, 0.08)",
  text: "#e8e6e1",
  textDim: "#8b8d98",
  textMuted: "#5c5e6a",
  white: "#ffffff",
  green: "#34d399",
  greenDim: "rgba(52, 211, 153, 0.12)",
  red: "#f87171",
};

const API_BASE = "https://d5forge-mcp-production.up.railway.app";

const FONT_MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";
const FONT_UI = "'Inter', 'Outfit', sans-serif";
const FONT_SERIF = "'Cormorant Garamond', serif";

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_REVENUE_BUDGET = [
  { month: "Oct", revenue: 58000, budget: 62000 },
  { month: "Nov", revenue: 64000, budget: 63000 },
  { month: "Dec", revenue: 71000, budget: 65000 },
  { month: "Jan", revenue: 59000, budget: 66000 },
  { month: "Feb", revenue: 67000, budget: 68000 },
  { month: "Mar", revenue: 73000, budget: 70000 },
];

const MOCK_CASH_FLOW = [
  { month: "Oct", inflow: 82000, outflow: 71000 },
  { month: "Nov", inflow: 88000, outflow: 76000 },
  { month: "Dec", inflow: 95000, outflow: 83000 },
  { month: "Jan", inflow: 79000, outflow: 74000 },
  { month: "Feb", inflow: 91000, outflow: 78000 },
  { month: "Mar", inflow: 98000, outflow: 81000 },
];

const MOCK_AR_AGING = [
  { bucket: "AR Aging", current: 48000, days30: 22000, days60: 11500, days90: 6800 },
];

const MOCK_EXPENSES = [
  { name: "Payroll", value: 42000 },
  { name: "Software", value: 12500 },
  { name: "Facilities", value: 8200 },
  { name: "Marketing", value: 6800 },
  { name: "Other", value: 4500 },
];

const PIE_COLORS = [COLORS.accent, "#b87333", "#8b8d98", "#5c5e6a", "#2a2d42"];

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtFull(n) {
  return `$${n.toLocaleString()}`;
}

// ─── Shared components ──────────────────────────────────────────────────────

function CrucibleLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="cdCrucGrad" x1="32" y1="4" x2="32" y2="60">
          <stop offset="0%" stopColor="#e8c84a" />
          <stop offset="50%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#b87333" />
        </linearGradient>
        <linearGradient id="cdMoltenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e85d26" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
      </defs>
      <path d="M32 4 L56 28 L32 60 L8 28 Z" fill="none" stroke="url(#cdCrucGrad)" strokeWidth="3" />
      <path d="M32 18 L44 28 L32 46 L20 28 Z" fill="url(#cdMoltenGrad)" opacity="0.25" />
      <path d="M14 28 L50 28" stroke="url(#cdCrucGrad)" strokeWidth="2" opacity="0.6" />
      <path d="M28 14 L28 8" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M36 14 L36 10" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M32 16 L32 6" stroke="#e85d26" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function Spinner() {
  return (
    <div style={{ width: 32, height: 32, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
  );
}

const chartTooltipStyle = {
  contentStyle: { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: FONT_UI, color: COLORS.text },
  itemStyle: { color: COLORS.text },
  labelStyle: { color: COLORS.textDim, marginBottom: 4 },
  cursor: { fill: COLORS.accentGlow },
};

// ─── Snapshot card ──────────────────────────────────────────────────────────

function SnapshotCard({ label, value, sub, indicator }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${hovered ? COLORS.accent : COLORS.border}`,
        borderRadius: 12,
        padding: "24px 28px",
        flex: 1,
        minWidth: 200,
        transition: "border-color 0.2s",
      }}
    >
      <p style={{ fontSize: 12, color: COLORS.textDim, fontFamily: FONT_UI, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, fontFamily: FONT_MONO, color: COLORS.white }}>{value}</span>
        {indicator && (
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT_MONO, color: indicator === "up" ? COLORS.green : COLORS.red }}>
            {indicator === "up" ? "▲" : "▼"}
          </span>
        )}
      </div>
      {sub && <p style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONT_UI, marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

// ─── Widget card wrapper ────────────────────────────────────────────────────

function WidgetCard({ title, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${hovered ? COLORS.accent : COLORS.border}`,
        borderRadius: 12,
        padding: 28,
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, fontFamily: FONT_UI }}>{title}</h3>
        <span style={{ fontSize: 14, color: COLORS.textMuted, cursor: "default" }} title="More info">ℹ</span>
      </div>
      {children}
    </div>
  );
}

// ─── Action button ──────────────────────────────────────────────────────────

function ActionButton({ icon, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 24px",
        background: hovered ? COLORS.accent : "transparent",
        color: hovered ? COLORS.bg : COLORS.accent,
        border: `1px solid ${COLORS.accent}`,
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: FONT_UI,
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Toast ──────────────────────────────────────────────────────────────────

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 200,
      background: COLORS.bgCard, border: `1px solid ${COLORS.accent}`,
      borderRadius: 10, padding: "16px 24px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", gap: 12,
      animation: "fadeUp 0.3s ease",
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
      <span style={{ fontSize: 14, color: COLORS.text, fontFamily: FONT_UI }}>{message}</span>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function DashboardEmptyState() {
  return (
    <div style={{
      background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12,
      padding: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 16, background: COLORS.accentDim,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="1.5">
          <path d="M3 3v18h18" />
          <path d="M7 16l4-6 4 4 5-8" />
        </svg>
      </div>
      <p style={{ fontSize: 16, color: COLORS.text, fontFamily: FONT_UI, textAlign: "center", maxWidth: 440 }}>
        No financial data connected yet.
      </p>
      <p style={{ fontSize: 14, color: COLORS.textMuted, fontFamily: FONT_UI, textAlign: "center", maxWidth: 440, lineHeight: 1.6 }}>
        Your CFO will connect your accounting system to bring this dashboard to life.
      </p>
    </div>
  );
}

// ─── Custom recharts tooltip ────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 6, fontFamily: FONT_UI }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, color: p.color, fontFamily: FONT_MONO }}>{p.name}: {fmtFull(p.value)}</p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontSize: 13, color: payload[0].payload.fill || COLORS.text, fontFamily: FONT_MONO }}>
        {payload[0].name}: {fmtFull(payload[0].value)}
      </p>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const { clientId } = useParams();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const isAdmin = user?.publicMetadata?.role === "platform_admin";

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/clients/${clientId}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clientId, getToken]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const clientName = data?.client?.name || data?.clientName || "Client Dashboard";
  const hasData = data && !data.empty;

  const showToast = (msg) => setToast(msg);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: FONT_UI }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line { stroke: ${COLORS.border}; }
      `}</style>

      {/* Top Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, height: 72, padding: "0 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(0, 0, 0, 0.92)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textDim, textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = COLORS.accent}
            onMouseLeave={e => e.currentTarget.style.color = COLORS.textDim}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            All Clients
          </Link>
          <div style={{ width: 1, height: 24, background: COLORS.border }} />
          <CrucibleLogo size={28} />
          <span style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 700, color: COLORS.white, letterSpacing: "0.03em" }}>
            {!loading && !error ? clientName : "Dashboard"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {isAdmin && (
            <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.accent, background: COLORS.accentDim, padding: "4px 10px", borderRadius: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Admin
            </span>
          )}
          <UserButton appearance={{ elements: { avatarBox: { width: 36, height: 36 } } }} />
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 48px 64px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 80 }}>
            <Spinner />
            <p style={{ fontSize: 14, color: COLORS.textDim }}>Loading dashboard...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <p style={{ fontSize: 15, color: COLORS.textDim }}>Unable to load dashboard. Please try again.</p>
            <button onClick={fetchDashboard} style={{
              padding: "10px 24px", background: COLORS.accentDim, color: COLORS.accent,
              border: `1px solid ${COLORS.accent}`, borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: FONT_UI, transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.background = COLORS.accent; e.target.style.color = COLORS.bg; }}
              onMouseLeave={e => { e.target.style.background = COLORS.accentDim; e.target.style.color = COLORS.accent; }}
            >Retry</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !hasData && <DashboardEmptyState />}

        {/* Dashboard content — show with placeholder data when API returns anything (even partial) */}
        {!loading && !error && (
          <>
            {/* Financial Snapshot Row */}
            <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
              <SnapshotCard label="Cash Position" value={fmt(data?.cash_position ?? 142500)} indicator="up" sub="Updated today" />
              <SnapshotCard label="Revenue YTD" value={fmt(data?.revenue_ytd ?? 385000)} indicator="up" sub="+12.4% vs prior year" />
              <SnapshotCard label="Net Income MTD" value={fmt(data?.net_income_mtd ?? 28700)} sub="March 2026" />
              <SnapshotCard label="Accounts Receivable" value={fmt(data?.ar_total ?? 88300)} indicator="down" sub="$6.8K 90+ days" />
            </div>

            {/* Widget Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginBottom: 36 }}>

              {/* Revenue vs Budget */}
              <WidgetCard title="Revenue vs Budget">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data?.revenue_vs_budget ?? MOCK_REVENUE_BUDGET} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: COLORS.textMuted, fontSize: 12, fontFamily: FONT_UI }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} tickFormatter={fmt} width={52} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill={COLORS.accent} radius={[4, 4, 0, 0]} name="Revenue" />
                    <Bar dataKey="budget" fill={COLORS.borderLight} radius={[4, 4, 0, 0]} name="Budget" />
                  </BarChart>
                </ResponsiveContainer>
              </WidgetCard>

              {/* Cash Flow Trend */}
              <WidgetCard title="Cash Flow Trend">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data?.cash_flow_trend ?? MOCK_CASH_FLOW}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: COLORS.textMuted, fontSize: 12, fontFamily: FONT_UI }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} tickFormatter={fmt} width={52} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="inflow" stroke={COLORS.accent} strokeWidth={2} dot={false} name="Inflow" />
                    <Line type="monotone" dataKey="outflow" stroke={COLORS.textMuted} strokeWidth={2} dot={false} strokeDasharray="5 5" name="Outflow" />
                  </LineChart>
                </ResponsiveContainer>
              </WidgetCard>

              {/* AR Aging */}
              <WidgetCard title="AR Aging Breakdown">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data?.ar_aging ?? MOCK_AR_AGING} layout="vertical" barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
                    <XAxis type="number" tick={{ fill: COLORS.textMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                    <YAxis type="category" dataKey="bucket" hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="current" stackId="ar" fill={COLORS.accent} name="Current" radius={[4, 0, 0, 4]} />
                    <Bar dataKey="days30" stackId="ar" fill="#b87333" name="30 Days" />
                    <Bar dataKey="days60" stackId="ar" fill={COLORS.textMuted} name="60 Days" />
                    <Bar dataKey="days90" stackId="ar" fill={COLORS.textMuted} name="90+ Days" radius={[0, 4, 4, 0]} opacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8 }}>
                  {[
                    { label: "Current", color: COLORS.accent },
                    { label: "30 Days", color: "#b87333" },
                    { label: "60 Days", color: COLORS.textMuted },
                    { label: "90+ Days", color: COLORS.textMuted },
                  ].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color, opacity: l.label === "90+ Days" ? 0.6 : 1 }} />
                      <span style={{ fontSize: 11, color: COLORS.textDim, fontFamily: FONT_UI }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </WidgetCard>

              {/* Expense Summary */}
              <WidgetCard title="Expense Summary by Category">
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <ResponsiveContainer width="55%" height={240}>
                    <PieChart>
                      <Pie
                        data={data?.expenses ?? MOCK_EXPENSES}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {(data?.expenses ?? MOCK_EXPENSES).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    {(data?.expenses ?? MOCK_EXPENSES).map((item, i) => (
                      <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span style={{ fontSize: 13, color: COLORS.textDim, fontFamily: FONT_UI }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: 13, color: COLORS.text, fontFamily: FONT_MONO }}>{fmt(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </WidgetCard>
            </div>

            {/* CFO Actions */}
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, fontFamily: FONT_UI, marginBottom: 16 }}>CFO Actions</h2>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <ActionButton
                  label="Generate Board Package"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
                  onClick={() => showToast("Coming soon — this action will be available when your data source is connected.")}
                />
                <ActionButton
                  label="Financial Health Check"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}
                  onClick={() => showToast("Coming soon — this action will be available when your data source is connected.")}
                />
                <ActionButton
                  label="Run Flux Analysis"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>}
                  onClick={() => showToast("Coming soon — this action will be available when your data source is connected.")}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
