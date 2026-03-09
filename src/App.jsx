import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HeliosDashboard from "./HeliosDashboard";

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
            by D5
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {["Features", "How It Works", "Why Forge"].map((item) => (
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
          Forge is your AI-powered virtual CFO. Boardroom-ready financial
          packages, plain-language analysis, and strategic guidance — without
          the six-figure salary.
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
    { value: 40, suffix: "+", label: "Hours saved per month", sub: "on financial reporting" },
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
      desc: "P&L, balance sheet, cash flow statements, and KPI scorecards — assembled automatically from your accounting data. Board-ready every month.",
    },
    {
      icon: "🤖",
      title: "AI-Powered Flux Analysis",
      desc: "Variances flagged and explained in plain language. Forge identifies what changed, why it matters, and what to do about it.",
    },
    {
      icon: "🔗",
      title: "Connects to Your Accounting Software",
      desc: "QuickBooks, Xero, NetSuite — connect once. Your financial data flows in securely, polished reports and dashboards flow out.",
    },
    {
      icon: "🏗️",
      title: "Industry-Specific Intelligence",
      desc: "Construction WIP schedules, SaaS burn metrics, healthcare payer mix — KPIs tailored to your industry, not generic templates.",
    },
    {
      icon: "🔒",
      title: "Bank-Grade Security",
      desc: "Your data is isolated, encrypted, and audit-logged. Built for the sensitivity financial data demands.",
    },
    {
      icon: "📬",
      title: "Delivered Where You Work",
      desc: "Board packages sent to Teams, Slack, email, or a shared Drive folder. Your stakeholders get the right reports in the right place.",
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
          Everything Your Business Needs From a CFO
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textDim, maxWidth: 560, margin: "0 auto", fontWeight: 300 }}>
          CFO-grade financial intelligence — automated, clear, and delivered on schedule.
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

function WhyForge() {
  return (
    <Section id="why-forge" style={{ padding: "100px 48px", maxWidth: 1000, margin: "0 auto" }}>
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
          Why Forge
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
          CFO-Grade Insight Without the Full-Time Cost
        </h2>
        <p style={{ fontSize: 17, color: COLORS.textDim, maxWidth: 600, margin: "0 auto", fontWeight: 300, lineHeight: 1.65 }}>
          Most businesses don't need a full-time CFO. But every business deserves
          to understand their numbers, spot problems early, and make confident
          financial decisions. That's Forge.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[
          {
            icon: "💰",
            title: "A fraction of the cost",
            desc: "A full-time CFO runs $150K–$300K a year. Forge gives you the same caliber of financial reporting and analysis at a fraction of the price.",
          },
          {
            icon: "📈",
            title: "Always-on financial clarity",
            desc: "No more waiting until month-end to know where you stand. Interactive dashboards and real-time cash flow views, available anytime.",
          },
          {
            icon: "🎯",
            title: "Plain language, not jargon",
            desc: "Variance explanations you can actually understand. Forge tells you what changed, why it matters, and what to consider next.",
          },
          {
            icon: "🤝",
            title: "Board-ready from day one",
            desc: "Polished financial packages that impress your board, your investors, and your bank — delivered automatically every month.",
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              padding: "32px 28px",
              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
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
            <div style={{ fontSize: 28, marginBottom: 16 }}>{item.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: COLORS.white, marginBottom: 10 }}>
              {item.title}
            </h3>
            <p style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.65, fontWeight: 300 }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Connect",
      desc: "Link your QuickBooks, Xero, or NetSuite account. Forge securely syncs your financial data through encrypted, audit-logged connections.",
    },
    {
      num: "02",
      title: "Configure",
      desc: "Tell us your industry and what matters most to your business. Forge loads the right KPIs, benchmarks, and report formats automatically.",
    },
    {
      num: "03",
      title: "Review",
      desc: "Every month, Forge assembles your full financial package — P&L, balance sheet, cash flow, variance analysis — with plain-language explanations.",
    },
    {
      num: "04",
      title: "Decide with Confidence",
      desc: "Share polished board packages with stakeholders instantly. Know exactly where your business stands and where it's heading.",
    },
  ];

  return (
    <Section id="how-it-works" style={{ padding: "100px 48px", maxWidth: 1000, margin: "0 auto" }}>
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
  const [form, setForm] = useState({ email: "", name: "", company: "", phone: "", system: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const inputStyle = {
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: "16px 20px",
    fontSize: 16,
    color: COLORS.white,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "'Outfit', sans-serif",
    width: "100%",
  };

  const handleSubmit = async () => {
    if (!form.email) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("https://formspree.io/f/xvzwgdqo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name || "(not provided)",
          company: form.company || "(not provided)",
          phone: form.phone || "(not provided)",
          financial_system: form.system || "(not provided)",
          _subject: "New Forge Waitlist Signup",
        }),
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
          We're onboarding a limited group of businesses for early access.
          Join the waitlist and we'll be in touch.
        </p>

        {!submitted ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="email"
              placeholder="Email address *"
              value={form.email}
              onChange={update("email")}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            />

            <div style={{ display: "flex", gap: 14 }}>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={update("name")}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={update("phone")}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
              />
            </div>

            <input
              type="text"
              placeholder="Business name"
              value={form.company}
              onChange={update("company")}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            />

            <select
              value={form.system}
              onChange={update("system")}
              style={{
                ...inputStyle,
                color: form.system ? COLORS.white : COLORS.textMuted,
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235c5e6a' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 20px center",
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            >
              <option value="" style={{ background: COLORS.bgCard, color: COLORS.textMuted }}>Primary financial system</option>
              <option value="QuickBooks Online" style={{ background: COLORS.bgCard, color: COLORS.white }}>QuickBooks Online</option>
              <option value="QuickBooks Desktop" style={{ background: COLORS.bgCard, color: COLORS.white }}>QuickBooks Desktop</option>
              <option value="Xero" style={{ background: COLORS.bgCard, color: COLORS.white }}>Xero</option>
              <option value="NetSuite" style={{ background: COLORS.bgCard, color: COLORS.white }}>NetSuite</option>
              <option value="FreshBooks" style={{ background: COLORS.bgCard, color: COLORS.white }}>FreshBooks</option>
              <option value="Sage" style={{ background: COLORS.bgCard, color: COLORS.white }}>Sage</option>
              <option value="Wave" style={{ background: COLORS.bgCard, color: COLORS.white }}>Wave</option>
              <option value="Other" style={{ background: COLORS.bgCard, color: COLORS.white }}>Other</option>
              <option value="Not sure" style={{ background: COLORS.bgCard, color: COLORS.white }}>Not sure</option>
            </select>

            <button
              onClick={handleSubmit}
              disabled={!form.email || submitting}
              style={{
                background: form.email ? COLORS.accent : COLORS.bgCard,
                color: form.email ? COLORS.bg : COLORS.textMuted,
                border: `1px solid ${form.email ? COLORS.accent : COLORS.border}`,
                borderRadius: 10,
                padding: "16px",
                fontSize: 16,
                fontWeight: 600,
                cursor: form.email && !submitting ? "pointer" : "default",
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
            by D5
          </span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: COLORS.textMuted }}>
        © 2026 D5 Ventures LLC. All rights reserved.
      </p>
    </footer>
  );
}

function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <style>{styles.global}</style>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <DashboardPreview />
      <WhyForge />
      <HowItWorks />
      <WaitlistForm />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/helios" element={<HeliosDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
