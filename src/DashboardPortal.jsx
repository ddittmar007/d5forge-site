import { useState, useEffect, useCallback } from "react";
import { UserButton, useUser, useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const COLORS = {
  bg: "#0a0b0d",
  bgCard: "#111318",
  bgCardHover: "#161921",
  border: "#1e2130",
  borderLight: "#2a2d42",
  accent: "#c9a227",
  accentDim: "rgba(201, 162, 39, 0.15)",
  text: "#e8e6e1",
  textDim: "#8b8d98",
  textMuted: "#5c5e6a",
  white: "#ffffff",
};

const API_BASE = "https://d5forge-mcp-production.up.railway.app";

function CrucibleLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="dashCrucGrad" x1="32" y1="4" x2="32" y2="60">
          <stop offset="0%" stopColor="#e8c84a" />
          <stop offset="50%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#b87333" />
        </linearGradient>
        <linearGradient id="dashMoltenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e85d26" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
      </defs>
      <path d="M32 4 L56 28 L32 60 L8 28 Z" fill="none" stroke="url(#dashCrucGrad)" strokeWidth="3" />
      <path d="M32 18 L44 28 L32 46 L20 28 Z" fill="url(#dashMoltenGrad)" opacity="0.25" />
      <path d="M14 28 L50 28" stroke="url(#dashCrucGrad)" strokeWidth="2" opacity="0.6" />
      <path d="M28 14 L28 8" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M36 14 L36 10" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M32 16 L32 6" stroke="#e85d26" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        border: `3px solid ${COLORS.border}`,
        borderTopColor: COLORS.accent,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}

function ClientCard({ client }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? COLORS.bgCardHover : COLORS.bgCard,
        border: `1px solid ${hovered ? COLORS.accent : COLORS.border}`,
        borderRadius: 12,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        minHeight: 200,
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: COLORS.accentDim,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18M9 3v18" />
        </svg>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>
        {client.name}
      </h3>
      {client.industry && (
        <p style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 24 }}>
          {client.industry}
        </p>
      )}

      <Link
        to={`/dashboard/${client.id}`}
        style={{
          marginTop: "auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 20px",
          background: COLORS.accentDim,
          color: COLORS.accent,
          border: `1px solid ${COLORS.accent}`,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          transition: "all 0.2s",
          ...(hovered ? { background: COLORS.accent, color: COLORS.bg } : {}),
        }}
      >
        View Dashboard
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: COLORS.accentDim,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      </div>
      <p style={{ fontSize: 15, color: COLORS.textMuted, textAlign: "center" }}>
        No clients assigned yet.
      </p>
    </div>
  );
}

export default function DashboardPortal() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.publicMetadata?.role === "platform_admin";

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.clients ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: 72,
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(10, 11, 13, 0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CrucibleLogo size={32} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 700,
                color: COLORS.white,
                letterSpacing: "0.03em",
                lineHeight: 1,
              }}
            >
              Forge
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: COLORS.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              by D5
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {isAdmin && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.accent,
                background: COLORS.accentDim,
                padding: "4px 10px",
                borderRadius: 6,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Admin
            </span>
          )}
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: 36, height: 36 },
              },
            }}
          />
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 48px" }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36,
            fontWeight: 600,
            color: COLORS.text,
            marginBottom: 8,
          }}
        >
          Welcome, {user?.firstName || "there"}
        </h1>
        <p style={{ fontSize: 15, color: COLORS.textDim, marginBottom: 48 }}>
          Your client portal for D5 Forge
        </p>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 64 }}>
            <Spinner />
            <p style={{ fontSize: 14, color: COLORS.textDim }}>Loading your dashboards...</p>
          </div>
        )}

        {error && (
          <div
            style={{
              background: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 48,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <p style={{ fontSize: 15, color: COLORS.textDim }}>Unable to load dashboards. Please try again.</p>
            <button
              onClick={fetchClients}
              style={{
                padding: "10px 24px",
                background: COLORS.accentDim,
                color: COLORS.accent,
                border: `1px solid ${COLORS.accent}`,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Outfit', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = COLORS.accent;
                e.target.style.color = COLORS.bg;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = COLORS.accentDim;
                e.target.style.color = COLORS.accent;
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && clients.length === 0 && <EmptyState />}

        {!loading && !error && clients.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
