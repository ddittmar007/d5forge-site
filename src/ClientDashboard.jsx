import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { UserButton, useUser, useAuth } from "@clerk/clerk-react";
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell,
} from "recharts";
import { ChatToggleButton, ChatPanel, ChatStyles } from "./ChatPanel";

// ─── Constants ──────────────────────────────────────────────────────────────

const C = {
  bg: "#000000", bgCard: "#111318", bgCardHover: "#161921",
  border: "#1e2130", borderLight: "#2a2d42",
  accent: "#c9a227", accentDim: "rgba(201, 162, 39, 0.15)", accentGlow: "rgba(201, 162, 39, 0.08)",
  amber: "#b87333", amberDim: "rgba(184, 115, 51, 0.15)",
  text: "#e8e6e1", textDim: "#8b8d98", textMuted: "#5c5e6a", white: "#ffffff",
  green: "#34d399", greenDim: "rgba(52, 211, 153, 0.15)",
  red: "#f87171", redDim: "rgba(248, 113, 113, 0.15)", redDark: "#b91c1c",
  blue: "#60a5fa", blueDim: "rgba(96, 165, 250, 0.15)",
};

const API = "https://d5forge-mcp-production.up.railway.app";
const FM = "'JetBrains Mono', 'SF Mono', monospace";
const FU = "'Inter', 'Outfit', sans-serif";
const FS = "'Cormorant Garamond', serif";

const YEARS = Array.from({ length: 18 }, (_, i) => 2009 + i);

const MILESTONES = {
  2013: "Phoenix WH opened",
  2017: "Acquisition",
  2019: "Marketo launched",
  2020: "COVID impact",
  2024: "Atlanta WH",
};

const PRODUCT_COLORS = { "Traditional A/V": C.accent, "Premium Audio": C.amber, "Computer Equipment": C.textMuted, "Freight Revenue": C.borderLight };

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
  return `${sign}$${abs.toLocaleString()}`;
}

function fmtFull(n) {
  if (n == null) return "—";
  return `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString()}`;
}

function pctChange(current, prior) {
  if (!prior || !current) return null;
  return ((current - prior) / Math.abs(prior) * 100).toFixed(1);
}

function pctStr(val) {
  if (val == null) return "";
  const n = parseFloat(val);
  return `${n >= 0 ? "+" : ""}${n}%`;
}

// ─── API fetcher with per-widget error isolation ────────────────────────────

async function apiFetch(token, path) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Shared UI components ───────────────────────────────────────────────────

function CrucibleLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="cdCG" x1="32" y1="4" x2="32" y2="60"><stop offset="0%" stopColor="#e8c84a" /><stop offset="50%" stopColor="#c9a227" /><stop offset="100%" stopColor="#b87333" /></linearGradient>
        <linearGradient id="cdMG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e85d26" /><stop offset="100%" stopColor="#c9a227" /></linearGradient>
      </defs>
      <path d="M32 4 L56 28 L32 60 L8 28 Z" fill="none" stroke="url(#cdCG)" strokeWidth="3" />
      <path d="M32 18 L44 28 L32 46 L20 28 Z" fill="url(#cdMG)" opacity="0.25" />
      <path d="M14 28 L50 28" stroke="url(#cdCG)" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

function Skeleton({ height = 240 }) {
  return <div style={{ height, borderRadius: 8, background: C.border, animation: "pulse 1.5s ease-in-out infinite" }} />;
}

function WidgetError() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: C.textMuted, fontSize: 13, fontFamily: FU }}>
      Data unavailable for this period
    </div>
  );
}

function WidgetCard({ title, tooltip, children, loading, error }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: C.bgCard, border: `1px solid ${hovered ? C.accent : C.border}`, borderRadius: 12, padding: 28, transition: "border-color 0.2s", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: FU }}>{title}</h3>
        <span style={{ fontSize: 14, color: C.textMuted, cursor: "help" }} title={tooltip || title}>ℹ</span>
      </div>
      {loading ? <Skeleton /> : error ? <WidgetError /> : children}
    </div>
  );
}

function SnapshotCard({ label, value, sub, indicator, loading }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: C.bgCard, border: `1px solid ${hovered ? C.accent : C.border}`, borderRadius: 12, padding: "20px 24px", flex: "1 1 0", minWidth: 160, transition: "border-color 0.2s" }}>
      <p style={{ fontSize: 11, color: C.textDim, fontFamily: FU, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</p>
      {loading ? <div style={{ height: 32, width: 100, borderRadius: 4, background: C.border, animation: "pulse 1.5s ease-in-out infinite" }} /> : (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 700, fontFamily: FM, color: C.white }}>{value}</span>
            {indicator && <span style={{ fontSize: 12, fontWeight: 600, fontFamily: FM, color: indicator === "up" ? C.accent : C.red }}>{indicator === "up" ? "▲" : "▼"}</span>}
          </div>
          {sub && <p style={{ fontSize: 11, color: C.textMuted, fontFamily: FU, marginTop: 4 }}>{sub}</p>}
        </>
      )}
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", background: h ? C.accent : "transparent", color: h ? C.bg : C.accent, border: `1px solid ${C.accent}`, borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: FU, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
      {icon}{label}
    </button>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 200, background: C.bgCard, border: `1px solid ${C.accent}`, borderRadius: 10, padding: "16px 24px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: 12, animation: "fadeUp 0.3s ease" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
      <span style={{ fontSize: 14, color: C.text, fontFamily: FU }}>{message}</span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", zIndex: 10 }}>
      <p style={{ fontSize: 12, color: C.textDim, marginBottom: 6, fontFamily: FU }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, color: p.color || p.stroke || C.text, fontFamily: FM }}>{p.name}: {fmtFull(p.value)}</p>
      ))}
    </div>
  );
}

function ChartLegend({ items }) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 10 }}>
      {items.map(({ label, color, dashed }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: dashed ? 16 : 10, height: dashed ? 2 : 10, borderRadius: dashed ? 0 : 2, background: dashed ? "transparent" : color, borderTop: dashed ? `2px dashed ${color}` : "none" }} />
          <span style={{ fontSize: 11, color: C.textDim, fontFamily: FU }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Year selector ──────────────────────────────────────────────────────────

function YearSelector({ year, setYear, compareYear, setCompareYear, compareActive, setCompareActive }) {
  const selectStyle = {
    background: C.bgCard, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6,
    padding: "6px 12px", fontSize: 13, fontFamily: FM, cursor: "pointer", outline: "none",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <label style={{ fontSize: 12, color: C.textDim, fontFamily: FU }}>FY</label>
      <select value={year} onChange={e => setYear(+e.target.value)} style={selectStyle}>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <button onClick={() => setCompareActive(!compareActive)}
        style={{ ...selectStyle, cursor: "pointer", background: compareActive ? C.accentDim : C.bgCard, color: compareActive ? C.accent : C.textDim, border: `1px solid ${compareActive ? C.accent : C.border}` }}>
        Compare
      </button>
      {compareActive && (
        <select value={compareYear} onChange={e => setCompareYear(+e.target.value)} style={selectStyle}>
          {YEARS.filter(y => y !== year).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      )}
    </div>
  );
}

// ─── Balance Sheet visual ───────────────────────────────────────────────────

function BalanceSheetVisual({ data }) {
  if (!data) return <WidgetError />;
  const assets = data.assets || {};
  const liabilities = data.liabilities || {};
  const equity = data.equity || {};

  const assetItems = [
    { label: "Cash", value: assets.cash ?? 0, color: C.green },
    { label: "A/R", value: assets.accountsReceivable ?? 0, color: C.accent },
    { label: "Inventory", value: assets.inventory ?? 0, color: C.amber },
    { label: "Fixed Assets", value: assets.fixedAssets ?? 0, color: C.textMuted },
  ];
  const liabItems = [
    { label: "A/P", value: liabilities.accountsPayable ?? 0, color: C.red },
    { label: "Debt", value: liabilities.debt ?? liabilities.longTermDebt ?? 0, color: C.redDark },
    { label: "Equity", value: equity.totalEquity ?? equity.total ?? 0, color: C.blue },
  ];

  const totalAssets = assetItems.reduce((s, i) => s + i.value, 0);
  const totalLiab = liabItems.reduce((s, i) => s + i.value, 0);
  const maxVal = Math.max(totalAssets, totalLiab, 1);

  const renderBar = (items, total, barLabel) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: C.textDim, fontFamily: FU }}>{barLabel}</span>
        <span style={{ fontSize: 13, color: C.text, fontFamily: FM }}>{fmt(total)}</span>
      </div>
      <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", background: C.border }}>
        {items.filter(i => i.value > 0).map((item, idx) => (
          <div key={idx} title={`${item.label}: ${fmtFull(item.value)}`}
            style={{ width: `${(item.value / maxVal) * 100}%`, background: item.color, transition: "width 0.5s ease", minWidth: item.value > 0 ? 2 : 0 }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        {items.filter(i => i.value > 0).map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
            <span style={{ fontSize: 11, color: C.textDim, fontFamily: FU }}>{item.label}</span>
            <span style={{ fontSize: 11, color: C.text, fontFamily: FM }}>{fmt(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {renderBar(assetItems, totalAssets, "Total Assets")}
      {renderBar(liabItems, totalLiab, "Liabilities + Equity")}
    </div>
  );
}

// ─── Cash Flow Waterfall ────────────────────────────────────────────────────

function CashFlowWaterfall({ data }) {
  if (!data) return <WidgetError />;
  const starting = data.startingCash ?? data.starting_cash ?? 0;
  const operating = data.operatingActivities ?? data.operating ?? 0;
  const investing = data.investingActivities ?? data.investing ?? 0;
  const financing = data.financingActivities ?? data.financing ?? 0;
  const ending = data.endingCash ?? data.ending_cash ?? (starting + operating + investing + financing);

  const items = [
    { name: "Starting Cash", value: starting, total: starting },
    { name: "Operating", value: operating, total: starting + operating },
    { name: "Investing", value: investing, total: starting + operating + investing },
    { name: "Financing", value: financing, total: starting + operating + investing + financing },
    { name: "Ending Cash", value: ending, total: ending },
  ];

  // Build waterfall bar data
  const chartData = items.map((item, i) => {
    if (i === 0 || i === items.length - 1) {
      return { name: item.name, base: 0, value: item.value, fill: C.accent };
    }
    const prev = items[i - 1].total;
    return {
      name: item.name,
      base: item.value >= 0 ? prev : prev + item.value,
      value: Math.abs(item.value),
      fill: item.value >= 0 ? C.green : C.red,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} barSize={48}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 11, fontFamily: FU }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: C.textMuted, fontSize: 11, fontFamily: FM }} axisLine={false} tickLine={false} tickFormatter={fmt} width={56} />
        <Tooltip content={({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          const item = items.find(i => i.name === label);
          return (
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: 12, color: C.textDim, fontFamily: FU, marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 13, fontFamily: FM, color: item?.value >= 0 ? C.green : C.red }}>{fmtFull(item?.value)}</p>
            </div>
          );
        }} />
        <Bar dataKey="base" stackId="w" fill="transparent" radius={0} />
        <Bar dataKey="value" stackId="w" radius={[4, 4, 0, 0]}>
          {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Aging table ────────────────────────────────────────────────────────────

function AgingTable({ rows, type }) {
  if (!rows?.length) return <p style={{ fontSize: 12, color: C.textMuted, fontFamily: FU, marginTop: 12 }}>No {type} data available</p>;
  const top10 = rows.slice(0, 10);
  return (
    <div style={{ marginTop: 16, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: FU }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            <th style={{ textAlign: "left", padding: "6px 8px", color: C.textDim, fontWeight: 500 }}>{type === "ar" ? "Customer" : "Vendor"}</th>
            <th style={{ textAlign: "right", padding: "6px 8px", color: C.textDim, fontWeight: 500 }}>Current</th>
            <th style={{ textAlign: "right", padding: "6px 8px", color: C.textDim, fontWeight: 500 }}>30 Day</th>
            <th style={{ textAlign: "right", padding: "6px 8px", color: C.textDim, fontWeight: 500 }}>60 Day</th>
            <th style={{ textAlign: "right", padding: "6px 8px", color: C.textDim, fontWeight: 500 }}>90+ Day</th>
            <th style={{ textAlign: "right", padding: "6px 8px", color: C.textDim, fontWeight: 500 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {top10.map((r, i) => {
            const has90 = (r.days90 ?? r.overdue90 ?? 0) > 0;
            return (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "6px 8px", color: has90 ? C.red : C.text }}>{r.name || r.customer || r.vendor}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: FM, color: C.text }}>{fmt(r.current ?? 0)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: FM, color: C.text }}>{fmt(r.days30 ?? 0)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: FM, color: C.amber }}>{fmt(r.days60 ?? 0)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: FM, color: has90 ? C.red : C.text }}>{fmt(r.days90 ?? r.overdue90 ?? 0)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: FM, fontWeight: 600, color: C.text }}>{fmt(r.total ?? (r.current + (r.days30 ?? 0) + (r.days60 ?? 0) + (r.days90 ?? 0)))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Aging stacked bar (shared for AR/AP) ───────────────────────────────────

function AgingBar({ data }) {
  if (!data) return null;
  const totals = {
    current: data.current ?? data.totalCurrent ?? 0,
    days30: data.days30 ?? data.total30 ?? 0,
    days60: data.days60 ?? data.total60 ?? 0,
    days90: data.days90 ?? data.total90 ?? data.overdue90 ?? 0,
  };
  const chartData = [{ bucket: "Aging", ...totals }];
  return (
    <>
      <ResponsiveContainer width="100%" height={60}>
        <BarChart data={chartData} layout="vertical" barSize={32}>
          <XAxis type="number" tick={{ fill: C.textMuted, fontSize: 11, fontFamily: FM }} axisLine={false} tickLine={false} tickFormatter={fmt} />
          <YAxis type="category" dataKey="bucket" hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="current" stackId="a" fill={C.accent} name="Current" radius={[4, 0, 0, 4]} />
          <Bar dataKey="days30" stackId="a" fill={C.amber} name="30 Days" />
          <Bar dataKey="days60" stackId="a" fill="#d97706" name="60 Days" />
          <Bar dataKey="days90" stackId="a" fill={C.red} name="90+ Days" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend items={[
        { label: "Current", color: C.accent },
        { label: "30 Days", color: C.amber },
        { label: "60 Days", color: "#d97706" },
        { label: "90+ Days", color: C.red },
      ]} />
    </>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const { clientId } = useParams();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [year, setYear] = useState(2025);
  const [compareYear, setCompareYear] = useState(2024);
  const [compareActive, setCompareActive] = useState(false);

  const [toast, setToast] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHasBeenOpened, setChatHasBeenOpened] = useState(false);

  // Per-widget data + loading + error
  const [clientName, setClientName] = useState("Dashboard");
  const [summary, setSummary] = useState({ data: null, loading: true, error: false });
  const [revenue, setRevenue] = useState({ data: null, loading: true, error: false });
  const [profitability, setProfitability] = useState({ data: null, loading: true, error: false });
  const [balanceSheet, setBalanceSheet] = useState({ data: null, loading: true, error: false });
  const [cashFlow, setCashFlow] = useState({ data: null, loading: true, error: false });
  const [arAging, setArAging] = useState({ data: null, loading: true, error: false });
  const [apAging, setApAging] = useState({ data: null, loading: true, error: false });
  const [trends, setTrends] = useState({ data: null, loading: true, error: false });

  const isAdmin = user?.publicMetadata?.role === "platform_admin";

  const toggleChat = () => {
    setChatOpen(prev => { if (!prev) setChatHasBeenOpened(true); return !prev; });
  };

  // Fetch a single endpoint with error isolation
  const fetchWidget = useCallback(async (path, setter) => {
    setter(prev => ({ ...prev, loading: true, error: false }));
    try {
      const token = await getToken();
      const data = await apiFetch(token, path);
      setter({ data, loading: false, error: false });
      return data;
    } catch {
      setter(prev => ({ ...prev, loading: false, error: true }));
      return null;
    }
  }, [getToken]);

  // Fetch all data when year changes
  useEffect(() => {
    const yearEnd = `${year}-12-31`;

    // Get client name from basic dashboard endpoint
    fetchWidget(`/api/clients/${clientId}/dashboard`, (s) => {
      if (s.data) setClientName(s.data.clientName || s.data.client?.name || "Dashboard");
    });

    fetchWidget(`/api/clients/${clientId}/financials/summary?year=${year}`, setSummary);
    fetchWidget(`/api/clients/${clientId}/financials/revenue?year=${year}`, setRevenue);
    fetchWidget(`/api/clients/${clientId}/financials/profitability?year=${year}`, setProfitability);
    fetchWidget(`/api/clients/${clientId}/financials/balance-sheet?asOfDate=${yearEnd}`, setBalanceSheet);
    fetchWidget(`/api/clients/${clientId}/financials/cash-flow?year=${year}`, setCashFlow);
    fetchWidget(`/api/clients/${clientId}/financials/ar-aging?asOfDate=${yearEnd}`, setArAging);
    fetchWidget(`/api/clients/${clientId}/financials/ap-aging?asOfDate=${yearEnd}`, setApAging);
    fetchWidget(`/api/clients/${clientId}/financials/trends?startYear=2009&endYear=2026`, setTrends);
  }, [clientId, year, fetchWidget]);

  // Accessors
  const s = summary.data;
  const priorPct = (field) => {
    if (!s) return null;
    const val = pctChange(s[field], s[`${field}PriorYear`] ?? s[`prior_${field}`]);
    return val;
  };

  const showToast = (msg) => setToast(msg);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FU }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line { stroke: ${C.border}; }
        select option { background: ${C.bgCard}; color: ${C.text}; }
      `}</style>

      {/* ── Top Nav ────────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, height: 72, padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, color: C.textDim, textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = C.accent} onMouseLeave={e => e.currentTarget.style.color = C.textDim}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            All Clients
          </Link>
          <div style={{ width: 1, height: 24, background: C.border }} />
          <CrucibleLogo size={28} />
          <span style={{ fontFamily: FS, fontSize: 20, fontWeight: 700, color: C.white, letterSpacing: "0.03em" }}>{clientName}</span>
          <div style={{ width: 1, height: 24, background: C.border }} />
          <YearSelector year={year} setYear={setYear} compareYear={compareYear} setCompareYear={setCompareYear} compareActive={compareActive} setCompareActive={setCompareActive} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {isAdmin && <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, background: C.accentDim, padding: "4px 10px", borderRadius: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Admin</span>}
          <UserButton appearance={{ elements: { avatarBox: { width: 36, height: 36 } } }} />
        </div>
      </nav>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 48px 80px" }}>

        {/* ── ROW 1: Financial Snapshot ──────────────────────────────────── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <SnapshotCard label="Cash Position" loading={summary.loading}
            value={fmt(s?.cashPosition ?? s?.cash_position)} indicator={s?.cashPosition > 0 ? "up" : null}
            sub={s ? `as of ${year}` : ""} />
          <SnapshotCard label="Revenue" loading={summary.loading}
            value={fmt(s?.revenue ?? s?.totalRevenue)}
            indicator={priorPct("revenue") > 0 ? "up" : priorPct("revenue") < 0 ? "down" : null}
            sub={priorPct("revenue") != null ? `${pctStr(priorPct("revenue"))} vs prior year` : `FY ${year}`} />
          <SnapshotCard label="Net Income" loading={summary.loading}
            value={fmt(s?.netIncome ?? s?.net_income)}
            indicator={priorPct("netIncome") > 0 ? "up" : priorPct("netIncome") < 0 ? "down" : null}
            sub={priorPct("netIncome") != null ? `${pctStr(priorPct("netIncome"))} vs prior year` : `FY ${year}`} />
          <SnapshotCard label="Gross Margin" loading={summary.loading}
            value={s?.grossMargin != null ? `${(s.grossMargin * 100).toFixed(1)}%` : (s?.gross_margin != null ? `${(s.gross_margin * 100).toFixed(1)}%` : "—")}
            indicator={s?.grossMargin > (s?.grossMarginPriorYear ?? 0) ? "up" : null}
            sub="of revenue" />
          <SnapshotCard label="Accounts Receivable" loading={summary.loading}
            value={fmt(s?.accountsReceivable ?? s?.ar_total)} sub="total outstanding" />
          <SnapshotCard label="Accounts Payable" loading={summary.loading}
            value={fmt(s?.accountsPayable ?? s?.ap_total)} sub="total outstanding" />
        </div>

        {/* ── ROW 2: Revenue & Profitability ────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <WidgetCard title="Revenue by Product Line" tooltip="Monthly revenue broken down by product category" loading={revenue.loading} error={revenue.error}>
            {revenue.data && (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenue.data.monthly || revenue.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: C.textMuted, fontSize: 11, fontFamily: FU }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.textMuted, fontSize: 11, fontFamily: FM }} axisLine={false} tickLine={false} tickFormatter={fmt} width={56} />
                    <Tooltip content={<CustomTooltip />} />
                    {Object.keys(PRODUCT_COLORS).map(key => (
                      <Bar key={key} dataKey={key} stackId="rev" fill={PRODUCT_COLORS[key]} name={key} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <ChartLegend items={Object.entries(PRODUCT_COLORS).map(([label, color]) => ({ label, color }))} />
              </>
            )}
          </WidgetCard>

          <WidgetCard title="Profitability Trend" tooltip="Monthly gross profit and net income with prior year comparison" loading={profitability.loading} error={profitability.error}>
            {profitability.data && (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={profitability.data.monthly || profitability.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: C.textMuted, fontSize: 11, fontFamily: FU }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.textMuted, fontSize: 11, fontFamily: FM }} axisLine={false} tickLine={false} tickFormatter={fmt} width={56} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="grossProfit" stroke={C.accent} strokeWidth={2} dot={false} name="Gross Profit" />
                    <Line type="monotone" dataKey="netIncome" stroke={C.white} strokeWidth={2} dot={false} name="Net Income" />
                    <Line type="monotone" dataKey="priorNetIncome" stroke={C.textMuted} strokeWidth={1.5} dot={false} strokeDasharray="6 4" name="Prior Year Net Income" />
                  </LineChart>
                </ResponsiveContainer>
                <ChartLegend items={[
                  { label: "Gross Profit", color: C.accent },
                  { label: "Net Income", color: C.white },
                  { label: "Prior Year NI", color: C.textMuted, dashed: true },
                ]} />
              </>
            )}
          </WidgetCard>
        </div>

        {/* ── ROW 3: Balance Sheet & Cash Flow ──────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <WidgetCard title="Visual Balance Sheet" tooltip="Proportional view of assets vs liabilities and equity" loading={balanceSheet.loading} error={balanceSheet.error}>
            {balanceSheet.data && <BalanceSheetVisual data={balanceSheet.data} />}
          </WidgetCard>

          <WidgetCard title="Cash Flow Waterfall" tooltip="Where cash came from and went during the period" loading={cashFlow.loading} error={cashFlow.error}>
            {cashFlow.data && <CashFlowWaterfall data={cashFlow.data} />}
          </WidgetCard>
        </div>

        {/* ── ROW 4: AR & AP Aging ──────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <WidgetCard title="AR Aging Breakdown" tooltip="Accounts receivable by aging bucket with top customers" loading={arAging.loading} error={arAging.error}>
            {arAging.data && (
              <>
                <AgingBar data={arAging.data.totals || arAging.data.summary || arAging.data} />
                <AgingTable rows={arAging.data.customers || arAging.data.details || arAging.data.rows} type="ar" />
              </>
            )}
          </WidgetCard>

          <WidgetCard title="AP Aging Breakdown" tooltip="Accounts payable by aging bucket with top vendors" loading={apAging.loading} error={apAging.error}>
            {apAging.data && (
              <>
                <AgingBar data={apAging.data.totals || apAging.data.summary || apAging.data} />
                <AgingTable rows={apAging.data.vendors || apAging.data.details || apAging.data.rows} type="ap" />
              </>
            )}
          </WidgetCard>
        </div>

        {/* ── ROW 5: Multi-Year Growth Timeline ─────────────────────────── */}
        <WidgetCard title="Company Growth Timeline" tooltip="Annual revenue and net income from 2009 to present with key milestones" loading={trends.loading} error={trends.error}>
          {trends.data && (() => {
            const trendData = trends.data.years || trends.data.annual || trends.data;
            if (!Array.isArray(trendData)) return <WidgetError />;
            return (
              <>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: C.textMuted, fontSize: 11, fontFamily: FM }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: C.textMuted, fontSize: 11, fontFamily: FM }} axisLine={false} tickLine={false} tickFormatter={fmt} width={56} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: C.textMuted, fontSize: 11, fontFamily: FM }} axisLine={false} tickLine={false} tickFormatter={fmt} width={56} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="revenue" fill={C.accent} radius={[4, 4, 0, 0]} name="Revenue" opacity={0.85} />
                    <Line yAxisId="right" type="monotone" dataKey="netIncome" stroke={C.white} strokeWidth={2} dot={{ r: 3, fill: C.white }} name="Net Income" />
                    {/* Milestone reference lines */}
                    {Object.entries(MILESTONES).map(([yr, label]) => (
                      <ReferenceLine key={yr} yAxisId="left" x={parseInt(yr)} stroke={C.accentDim} strokeDasharray="3 3"
                        label={{ value: label, position: "top", fill: C.textDim, fontSize: 10, fontFamily: FU }} />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
                <ChartLegend items={[
                  { label: "Annual Revenue", color: C.accent },
                  { label: "Net Income", color: C.white },
                ]} />
              </>
            );
          })()}
        </WidgetCard>

        {/* ── ROW 6: CFO Actions ────────────────────────────────────────── */}
        <div style={{ marginTop: 24, marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: FU, marginBottom: 16 }}>CFO Actions</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <ActionButton label="Generate Board Package"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
              onClick={() => showToast("Coming soon — this action will be available when your data source is connected.")} />
            <ActionButton label="Financial Health Check"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}
              onClick={() => showToast("Coming soon — this action will be available when your data source is connected.")} />
            <ActionButton label="Run Flux Analysis"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>}
              onClick={() => showToast("Coming soon — this action will be available when your data source is connected.")} />
          </div>
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <ChatStyles />
      <ChatToggleButton onClick={toggleChat} isOpen={chatOpen} hasBeenOpened={chatHasBeenOpened} />
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} clientId={clientId} />
    </div>
  );
}
