import { UserButton, useUser } from "@clerk/clerk-react";

const COLORS = {
  bg: "#0a0b0d",
  bgCard: "#111318",
  border: "#1e2130",
  accent: "#c9a227",
  accentDim: "rgba(201, 162, 39, 0.15)",
  text: "#e8e6e1",
  textDim: "#8b8d98",
  textMuted: "#5c5e6a",
  white: "#ffffff",
};

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

export default function DashboardPortal() {
  const { user } = useUser();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Outfit', sans-serif" }}>
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

        <UserButton
          appearance={{
            elements: {
              avatarBox: {
                width: 36,
                height: 36,
              },
            },
          }}
        />
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

        {/* Placeholder Card Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: 32,
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M9 12h6M12 9v6" />
                </svg>
              </div>
              <p style={{ fontSize: 14, color: COLORS.textMuted, textAlign: "center" }}>
                Your dashboards will appear here
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
