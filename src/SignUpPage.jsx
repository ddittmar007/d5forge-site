import { SignUp } from "@clerk/clerk-react";

const COLORS = {
  bg: "#000000",
  accent: "#c9a227",
  textMuted: "#5c5e6a",
};

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Outfit', sans-serif",
      }}
    >
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <svg width={56} height={56} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="signupCrucGrad" x1="32" y1="4" x2="32" y2="60">
              <stop offset="0%" stopColor="#e8c84a" />
              <stop offset="50%" stopColor="#c9a227" />
              <stop offset="100%" stopColor="#b87333" />
            </linearGradient>
            <linearGradient id="signupMoltenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e85d26" />
              <stop offset="100%" stopColor="#c9a227" />
            </linearGradient>
          </defs>
          <path d="M32 4 L56 28 L32 60 L8 28 Z" fill="none" stroke="url(#signupCrucGrad)" strokeWidth="3" />
          <path d="M32 18 L44 28 L32 46 L20 28 Z" fill="url(#signupMoltenGrad)" opacity="0.25" />
          <path d="M14 28 L50 28" stroke="url(#signupCrucGrad)" strokeWidth="2" opacity="0.6" />
          <path d="M28 14 L28 8" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          <path d="M36 14 L36 10" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
          <path d="M32 16 L32 6" stroke="#e85d26" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
        </svg>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "0.03em",
            marginTop: 8,
          }}
        >
          D5 Forge
        </div>
        <div
          style={{
            fontSize: 13,
            color: COLORS.textMuted,
            marginTop: 4,
          }}
        >
          Create your account
        </div>
      </div>

      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        forceRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: COLORS.accent,
            colorBackground: "#111318",
            colorText: "#e8e6e1",
            colorTextSecondary: "#8b8d98",
            colorInputBackground: "#0a0b0d",
            colorInputText: "#e8e6e1",
            borderRadius: "8px",
            fontFamily: "'Inter', 'Outfit', sans-serif",
          },
          elements: {
            card: {
              backgroundColor: "#111318",
              border: "1px solid #1e2130",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            },
            headerTitle: {
              color: "#e8e6e1",
            },
            headerSubtitle: {
              color: "#8b8d98",
            },
            formButtonPrimary: {
              backgroundColor: COLORS.accent,
              color: "#0a0b0d",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#d4ad2e",
              },
            },
            footerActionLink: {
              color: COLORS.accent,
            },
          },
        }}
      />
    </div>
  );
}
