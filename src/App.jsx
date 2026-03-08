import { useState, useEffect, useRef } from "react";

const GOOGLE_FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap";

// Inject fonts
if (!document.querySelector(`link[href="${GOOGLE_FONTS}"]`)) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = GOOGLE_FONTS;
  document.head.appendChild(link);
}

const COLORS = {
  bg: "#0a0b0d",
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

const styles = {
  global: `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'Outfit', sans-serif; overflow-x: hidden; }
    ::selection { background: ${COLORS.accentDim}; color: ${COLORS.accent}; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes gridFlow { 0% { opacity: 0.03; } 50% { opacity: 0.07; } 100% { opacity: 0.03; } }
    @keyframes numberTick { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  `,
};

function CrucibleLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="crucGrad" x1="32" y1="4" x2="32" y2="60">
          <stop offset="0%" stopColor="#e8c84a" />
          <stop offset="50%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#b87333" />
        </linearGradient>
        <linearGradient id="moltenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e85d26" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
      </defs>
      <path d="M32 4 L56 28 L32 60 L8 28 Z" fill="none" stroke="url(#crucGrad)" strokeWidth="3" />
      <path d="M32 18 L44 28 L32 46 L20 28 Z" fill="url(#moltenGrad)" opacity="0.25" />
      <path d="M14 28 L50 28" stroke="url(#crucGrad)" strokeWidth="2" opacity="0.6" />
      <path d="M28 14 L28 8" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M36 14 L36 10" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M32 16 L32 6" stroke="#e85d26" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function AnimatedNumber({ value, prefix = "", suffix = "", delay = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const timeout = setTimeout(() => {
      const duration = 1800;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(tick);
      };
      tick();
    }, delay);
    return () => clearTimeout(timeout);
  }, [started, value, delay]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Section({ children, style, id }) {
  const [ref, inView] = useInView();
  return (
    <section
      id={id}
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 48px",
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(10, 11, 13, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${COLORS.border}` : "1px solid transparent",
        transition: "all 0.4s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <CrucibleLogo size={36} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24,
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
            by D5 Ventures
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {["Features", "For vCFOs", "For Businesses"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
            style={{
              color: COLORS.textDim,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: "0.02em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = COLORS.white)}
            onMouseLeave={(e) => (e.target.style.color = COLORS.textDim)}
          >
            {item}
          </a>
        ))}
        <a
          href="#waitlist"
          style={{
            background: COLORS.accent,
            color: COLORS.bg,
            padding: "10px 24px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            letterSpacing: "0.02em",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = `0 8px 30px ${COLORS.accentDim}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Join Waitlist
        </a>
      </div>
    </nav>
  );
}

function HeroGrid() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Horizontal lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`h${i}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${(i + 1) * 8}%`,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${COLORS.border}44, transparent)`,
            animation: `gridFlow ${3 + i * 0.5}s ease-in-out infinite`,
          }}
        />
      ))}
      {/* Vertical lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`v${i}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${(i + 1) * 12}%`,
            width: 1,
            background: `linear-gradient(180deg, transparent, ${COLORS.border}33, transparent)`,
            animation: `gridFlow ${4 + i * 0.3}s ease-in-out infinite`,
          }}
        />
      ))}
      {/* Accent glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          background: `radial-gradient(ellipse, ${COLORS.accentGlow}, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}

function Hero() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 48px 80px",
      }}
    >
      <HeroGrid />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 900,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: COLORS.accentDim,
            borderRadius: 100,
            marginBottom: 32,
            animation: "fadeIn 0.8s ease both",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: COLORS.accent,
              animation: "pulse 2s ease infinite",
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: COLORS.accent,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Now accepting early access requests
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(42px, 6vw, 78px)",
            fontWeight: 600,
            lineHeight: 1.08,
            color: COLORS.white,
            marginBottom: 28,
            animation: "fadeUp 0.8s ease both 0.1s",
            letterSpacing: "-0.02em",
          }}
        >
          Financial Intelligence,{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${COLORS.accent}, #e8c84a)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Forged
          </span>{" "}
          for Growth
        </h1>

        <p
          style={{
            fontSize: "clamp(17px, 2vw, 20px)",
            lineHeight: 1.65,
            color: COLORS.textDim,
            maxWidth: 640,
            margin: "0 auto 48px",
            animation: "fadeUp 0.8s ease both 0.25s",
            fontWeight: 300,
          }}
        >
          D5 Forge transforms raw financial data into boardroom-ready insights.
          AI-powered analysis, automated deliverables, and the trusted guidance
          of a virtual CFO — all in one platform.
        </p>

        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            animation: "fadeUp 0.8s ease both 0.4s",
          }}
        >
          <a
            href="#waitlist"
            style={{
              background: COLORS.accent,
              color: COLORS.bg,
              padding: "16px 36px",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.3s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = `0 12px 40px ${COLORS.accentDim}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Request Early Access
          </a>
          <a
            href="#features"
            style={{
              background: "transparent",
              color: COLORS.text,
              padding: "16px 36px",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 400,
              textDecoration: "none",
              border: `1px solid ${COLORS.border}`,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = COLORS.borderLight;
              e.target.style.background = COLORS.bgCard;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = COLORS.border;
              e.target.style.background = "transparent";
            }}
          >
            See How It Works
          </a>
        </div>
      </div>
    </div>
  );
}

function Stats() {
  const stats = [
    { value: 40, suffix: "+", label: "Hours saved per month", sub: "per vCFO practice" },
    { value: 10, suffix: "x", label: "Faster reporting", sub: "vs. manual assembly" },
    { value: 100, suffix: "%", label: "Data security", sub: "SOC 2 roadmap" },
  ];

  return (
    <Section>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 48px 100px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: COLORS.border,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: COLORS.bg,
              padding: "48px 36px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 52,
                fontWeight: 700,
                color: COLORS.accent,
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              <AnimatedNumber value={s.value} suffix={s.suffix} delay={i * 200} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.text, marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Features() {
  const features = [
    {
      icon: "📊",
      title: "Automated Financial Packages",
      desc: "P&L, balance sheet, cash flow statements, and KPI scorecards — assembled automatically from your connected data sources. Review, annotate, deliver.",
    },
    {
      icon: "🤖",
      title: "AI-Powered Flux Analysis",
      desc: "Variances flagged and explained automatically. D5 Forge identifies the story behind the numbers so you can focus on the strategic narrative.",
    },
    {
      icon: "🔗",
      title: "Universal Connectors",
      desc: "QuickBooks, Xero, NetSuite — connect once per client. Financial data flows in, polished deliverables flow out through Teams, Slack, or email.",
    },
    {
      icon: "🏗️",
      title: "Industry Recipes",
      desc: "Construction WIP schedules, SaaS burn metrics, healthcare payer mix — industry-specific KPIs that load automatically based on each client's vertical.",
    },
    {
      icon: "🔒",
      title: "Multi-Tenant Trust Layer",
      desc: "Every CFO sees only their clients. Every client's data is isolated, encrypted, and audit-logged. Built for the sensitivity financial data demands.",
    },
    {
      icon: "📬",
      title: "One-Click Delivery",
      desc: "Configure once per client: Teams channel, Slack DM, email to the board, shared Drive folder. Hit publish and every stakeholder gets their package.",
    },
  ];

  return (
    <Section id="features" style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: COLORS.accent,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 16,
          }}
        >
          Capabilities
        </span>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 600,
            color: COLORS.white,
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Everything a vCFO Practice Needs
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textDim, maxWidth: 560, margin: "0 auto", fontWeight: 300 }}>
          From raw data to boardroom-ready deliverables — automated, branded, and delivered on schedule.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              background: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              padding: "36px 32px",
              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.bgCardHover;
              e.currentTarget.style.borderColor = COLORS.borderLight;
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLORS.bgCard;
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 20 }}>{f.icon}</div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: COLORS.white,
                marginBottom: 10,
                letterSpacing: "0.01em",
              }}
            >
              {f.title}
            </h3>
            <p style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.65, fontWeight: 300 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function DashboardPreview() {
  return (
    <Section style={{ padding: "80px 48px 120px", maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          background: `linear-gradient(180deg, ${COLORS.bgCard}, ${COLORS.bg})`,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 20,
          padding: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Fake browser chrome */}
        <div
          style={{
            background: COLORS.bgCard,
            borderRadius: "17px 17px 0 0",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          <div
            style={{
              marginLeft: 16,
              background: COLORS.bg,
              borderRadius: 6,
              padding: "6px 16px",
              fontSize: 12,
              color: COLORS.textMuted,
              flex: 1,
              maxWidth: 400,
            }}
          >
            d5forge.com/ridgeline-dist/board/2026-02
          </div>
        </div>

        {/* Dashboard mockup */}
        <div style={{ padding: "32px 40px 40px", background: COLORS.bg, borderRadius: "0 0 17px 17px" }}>
          {/* Header bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                Board Financial Package
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.white }}>Ridgeline Distributors LLC</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>February 2026 — Prepared by Forge</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Overview", "Revenue", "Expenses", "KPIs"].map((tab, i) => (
                <div
                  key={tab}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    background: i === 0 ? COLORS.accentDim : "transparent",
                    color: i === 0 ? COLORS.accent : COLORS.textMuted,
                    border: `1px solid ${i === 0 ? COLORS.accent + "33" : COLORS.border}`,
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>

          {/* Metric cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Total Revenue YTD", value: "$1.24M", change: "+12.3%", up: true },
              { label: "Gross Margin", value: "34.2%", change: "+1.8pts", up: true },
              { label: "Net Income", value: "$25,240", change: "+41.8%", up: true },
              { label: "Cash Position", value: "$342,800", change: "+8.2%", up: true },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: "18px 16px",
                }}
              >
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.white, marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>
                  {m.value}
                </div>
                <div style={{ fontSize: 12, color: m.up ? COLORS.green : COLORS.red, fontWeight: 500 }}>
                  {m.change} vs. budget
                </div>
              </div>
            ))}
          </div>

          {/* Chart mockup */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: "20px",
                height: 180,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500, marginBottom: 16 }}>
                REVENUE VS. BUDGET — MONTHLY TREND
              </div>
              <svg width="100%" height="120" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="budgetFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Budget line (dashed) */}
                <path
                  d="M 0,80 L 62,75 L 125,70 L 187,72 L 250,65 L 312,58 L 375,50 L 437,45 L 500,40"
                  fill="none"
                  stroke={COLORS.textMuted}
                  strokeWidth="1.5"
                  strokeDasharray="6,4"
                />
                {/* Actual line */}
                <path
                  d="M 0,85 L 62,68 L 125,72"
                  fill="none"
                  stroke={COLORS.accent}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 0,85 L 62,68 L 125,72 L 125,120 L 0,120 Z"
                  fill="url(#budgetFill)"
                />
                {/* Data points */}
                <circle cx="0" cy="85" r="3.5" fill={COLORS.accent} />
                <circle cx="62" cy="68" r="3.5" fill={COLORS.accent} />
                <circle cx="125" cy="72" r="3.5" fill={COLORS.accent} />
              </svg>
              <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 2, background: COLORS.accent, borderRadius: 1 }} />
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>Actual</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 2, background: COLORS.textMuted, borderRadius: 1, backgroundImage: `repeating-linear-gradient(90deg, ${COLORS.textMuted} 0 4px, transparent 4px 8px)` }} />
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>Budget</span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: "20px",
              }}
            >
              <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500, marginBottom: 16 }}>
                REVENUE MIX
              </div>
              {[
                { label: "Wholesale", pct: 62, color: COLORS.accent },
                { label: "Direct-to-Retail", pct: 21, color: "#6366f1" },
                { label: "Contract", pct: 12, color: COLORS.green },
                { label: "Other", pct: 5, color: COLORS.textMuted },
              ].map((r) => (
                <div key={r.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: COLORS.text }}>{r.label}</span>
                    <span style={{ fontSize: 12, color: COLORS.textDim }}>{r.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${r.pct}%`,
                        height: "100%",
                        background: r.color,
                        borderRadius: 2,
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: 14,
          color: COLORS.textMuted,
          marginTop: 24,
          fontStyle: "italic",
        }}
      >
        Live preview — client board financial package, auto-generated from connected data
      </p>
    </Section>
  );
}

function AudienceSection() {
  return (
    <Section id="for-vcfos" style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        {/* vCFOs */}
        <div
          style={{
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: "48px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${COLORS.accent}, transparent)`,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.accent,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 20,
            }}
          >
            For Virtual CFOs
          </span>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32,
              fontWeight: 600,
              color: COLORS.white,
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            Scale Your Practice Without Scaling Your Hours
          </h3>
          <p style={{ fontSize: 15, color: COLORS.textDim, lineHeight: 1.7, marginBottom: 28, fontWeight: 300 }}>
            D5 Forge handles the assembly so you can focus on advisory. Serve more
            clients at a higher standard with automated financial packages, industry-specific
            templates, and one-click delivery to every stakeholder.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Multi-client dashboard — every client in one view",
              "Automated monthly packages from connected data",
              "Industry recipe library with pre-built KPI sets",
              "Your branding, your commentary, your value-add",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: COLORS.accentDim,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <span style={{ color: COLORS.accent, fontSize: 12 }}>✓</span>
                </div>
                <span style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Owners */}
        <div
          id="for-businesses"
          style={{
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: "48px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${COLORS.green}, transparent)`,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.green,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 20,
            }}
          >
            For Business Owners
          </span>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32,
              fontWeight: 600,
              color: COLORS.white,
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            CFO-Grade Insight Without the Full-Time Cost
          </h3>
          <p style={{ fontSize: 15, color: COLORS.textDim, lineHeight: 1.7, marginBottom: 28, fontWeight: 300 }}>
            Get the financial clarity your board and investors expect. D5 Forge delivers
            interactive dashboards, plain-language analysis, and strategic guidance — powered
            by AI, guided by an experienced vCFO.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Interactive board packages — click, don't squint",
              "Plain-language variance explanations",
              "Cash flow forecasts updated in real time",
              "Delivered where you work — Teams, Slack, email",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: COLORS.greenDim,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <span style={{ color: COLORS.green, fontSize: 12 }}>✓</span>
                </div>
                <span style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Connect",
      desc: "Link your clients' QuickBooks, Xero, or NetSuite accounts. D5 Forge securely syncs financial data through encrypted, audit-logged connections.",
    },
    {
      num: "02",
      title: "Configure",
      desc: "Select an industry recipe, customize your KPI scorecard, and set delivery preferences for each client. One-time setup, ongoing value.",
    },
    {
      num: "03",
      title: "Review & Annotate",
      desc: "D5 Forge assembles the financial package automatically. You add the strategic commentary and judgment calls that make you indispensable.",
    },
    {
      num: "04",
      title: "Deliver",
      desc: "One click. Every stakeholder gets the right package through their preferred channel — Teams, Slack, email, or a branded dashboard link.",
    },
  ];

  return (
    <Section style={{ padding: "100px 48px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: COLORS.accent,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 16,
          }}
        >
          How it Works
        </span>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 600,
            color: COLORS.white,
            lineHeight: 1.15,
          }}
        >
          From Data to Deliverable in Four Steps
        </h2>
      </div>

      <div style={{ position: "relative" }}>
        {/* Connector line */}
        <div
          style={{
            position: "absolute",
            left: 28,
            top: 40,
            bottom: 40,
            width: 1,
            background: `linear-gradient(180deg, ${COLORS.accent}44, ${COLORS.border}, ${COLORS.accent}44)`,
          }}
        />

        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 32,
              marginBottom: i < steps.length - 1 ? 48 : 0,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.accent,
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              {s.num}
            </div>
            <div style={{ paddingTop: 6 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: COLORS.white, marginBottom: 8 }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 15, color: COLORS.textDim, lineHeight: 1.65, fontWeight: 300 }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !role) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("https://formspree.io/f/xvzwgdqo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, role, _subject: "New Forge Waitlist Signup" }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <Section id="waitlist" style={{ padding: "120px 48px", maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: COLORS.accent,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 16,
          }}
        >
          Early Access
        </span>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 600,
            color: COLORS.white,
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Be First to the Forge
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textDim, marginBottom: 48, fontWeight: 300 }}>
          We're onboarding a limited group of vCFOs and forward-thinking businesses for early access.
          Join the waitlist and we'll be in touch.
        </p>

        {!submitted ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: "16px 20px",
                fontSize: 16,
                color: COLORS.white,
                outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "'Outfit', sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            />

            <div style={{ display: "flex", gap: 10 }}>
              {["I'm a vCFO / Fractional CFO", "I'm a Business Owner"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    background: role === r ? COLORS.accentDim : COLORS.bgCard,
                    border: `1px solid ${role === r ? COLORS.accent + "55" : COLORS.border}`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: role === r ? COLORS.accent : COLORS.textDim,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!email || !role || submitting}
              style={{
                background: email && role ? COLORS.accent : COLORS.bgCard,
                color: email && role ? COLORS.bg : COLORS.textMuted,
                border: `1px solid ${email && role ? COLORS.accent : COLORS.border}`,
                borderRadius: 10,
                padding: "16px",
                fontSize: 16,
                fontWeight: 600,
                cursor: email && role && !submitting ? "pointer" : "default",
                transition: "all 0.3s",
                letterSpacing: "0.01em",
                fontFamily: "'Outfit', sans-serif",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Join the Waitlist"}
            </button>
            {error && (
              <p style={{ fontSize: 14, color: COLORS.red, marginTop: 4 }}>{error}</p>
            )}
          </div>
        ) : (
          <div
            style={{
              background: COLORS.bgCard,
              border: `1px solid ${COLORS.accent}33`,
              borderRadius: 16,
              padding: "48px 40px",
              animation: "fadeUp 0.5s ease both",
            }}
          >
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><CrucibleLogo size={48} /></div>
            <h3 style={{ fontSize: 22, fontWeight: 600, color: COLORS.white, marginBottom: 8 }}>
              You're on the list.
            </h3>
            <p style={{ fontSize: 15, color: COLORS.textDim, fontWeight: 300 }}>
              We'll reach out soon with early access details. In the meantime, keep forging.
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${COLORS.border}`,
        padding: "48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <CrucibleLogo size={28} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: COLORS.text, lineHeight: 1 }}>
            Forge
          </span>
          <span style={{ fontSize: 8, fontWeight: 500, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1 }}>
            by D5 Ventures
          </span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: COLORS.textMuted }}>
        © 2026 D5 Ventures LLC. All rights reserved.
      </p>
    </footer>
  );
}

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <style>{styles.global}</style>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <DashboardPreview />
      <AudienceSection />
      <HowItWorks />
      <WaitlistForm />
      <Footer />
    </div>
  );
}
