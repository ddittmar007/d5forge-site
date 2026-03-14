import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import ReactMarkdown from "react-markdown";

const COLORS = {
  bg: "#111111",
  bgUser: "rgba(201, 162, 39, 0.12)",
  bgAssistant: "#1a1a1a",
  border: "#1e2130",
  accent: "#c9a227",
  accentDim: "rgba(201, 162, 39, 0.15)",
  text: "#e8e6e1",
  textDim: "#8b8d98",
  textMuted: "#5c5e6a",
  white: "#ffffff",
};

const API_BASE = "https://d5forge-mcp-production.up.railway.app";
const FONT_UI = "'Inter', 'Outfit', sans-serif";

const WELCOME_MESSAGE = `Hello! I'm your virtual CFO assistant. I have access to your financial data and can help you understand your numbers. Try asking me things like:

• What's our current cash position?
• How does this month's revenue compare to last month?
• Are there any overdue receivables I should worry about?

How can I help?`;

// ─── Markdown renderer styles ───────────────────────────────────────────────

const markdownComponents = {
  p: ({ children }) => <p style={{ margin: "0 0 8px", lineHeight: 1.6 }}>{children}</p>,
  strong: ({ children }) => <strong style={{ color: COLORS.white, fontWeight: 600 }}>{children}</strong>,
  ul: ({ children }) => <ul style={{ margin: "4px 0 8px", paddingLeft: 20 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: "4px 0 8px", paddingLeft: 20 }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.5 }}>{children}</li>,
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre style={{ background: "#0a0a0a", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 12, margin: "8px 0", overflowX: "auto", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
          <code>{children}</code>
        </pre>
      );
    }
    return <code style={{ background: "#0a0a0a", padding: "2px 6px", borderRadius: 4, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: COLORS.accent }}>{children}</code>;
  },
};

// ─── Chat toggle button ─────────────────────────────────────────────────────

export function ChatToggleButton({ onClick, isOpen, hasBeenOpened }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 150,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: hovered ? "#d4ad2e" : COLORS.accent,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 24px rgba(201, 162, 39, 0.3)",
        transition: "all 0.2s",
        transform: hovered ? "scale(1.08)" : "scale(1)",
        animation: !hasBeenOpened && !isOpen ? "chatPulse 2s ease-in-out infinite" : "none",
      }}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0b0d" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0b0d" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
      )}
    </button>
  );
}

// ─── Chat panel ─────────────────────────────────────────────────────────────

export function ChatPanel({ isOpen, onClose, clientId }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setStreaming(true);

    // Add placeholder for assistant response
    const assistantIdx = updatedMessages.length;
    setMessages(prev => [...prev, { role: "assistant", content: "", isStreaming: true }]);

    try {
      const token = await getToken();
      abortRef.current = new AbortController();

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          clientId,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content
                ?? parsed.delta?.text
                ?? parsed.content
                ?? parsed.text
                ?? (typeof parsed === "string" ? parsed : "");
              if (content) {
                accumulated += content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[assistantIdx] = { role: "assistant", content: accumulated, isStreaming: true };
                  return updated;
                });
              }
            } catch {
              // Non-JSON SSE line — treat as plain text content
              if (data.trim()) {
                accumulated += data;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[assistantIdx] = { role: "assistant", content: accumulated, isStreaming: true };
                  return updated;
                });
              }
            }
          }
        }
      }

      // Finalize message
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIdx] = { role: "assistant", content: accumulated || "I received your message but had no response to generate. Please try again.", isStreaming: false };
        return updated;
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIdx] = {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          isError: true,
          isStreaming: false,
        };
        return updated;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, messages, streaming, clientId, getToken]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const retryLast = () => {
    // Remove the error message and resend
    setMessages(prev => prev.slice(0, -1));
    const lastUserIdx = messages.length - 2;
    if (lastUserIdx >= 0 && messages[lastUserIdx].role === "user") {
      setInput(messages[lastUserIdx].content);
      setMessages(prev => prev.slice(0, -1));
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 72,
        right: 0,
        bottom: 0,
        width: 400,
        zIndex: 140,
        background: COLORS.bg,
        borderLeft: `1px solid ${COLORS.accent}`,
        display: "flex",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: FONT_UI,
      }}
    >
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.white }}>Ask your vCFO</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: COLORS.textMuted, padding: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = COLORS.white}
          onMouseLeave={e => e.currentTarget.style.color = COLORS.textMuted}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%",
              background: msg.role === "user" ? COLORS.bgUser : COLORS.bgAssistant,
              border: msg.isError ? `1px solid ${COLORS.accent}` : `1px solid ${msg.role === "user" ? "rgba(201, 162, 39, 0.2)" : COLORS.border}`,
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              padding: "10px 14px",
              fontSize: 13.5,
              lineHeight: 1.55,
              color: COLORS.text,
            }}
          >
            {msg.role === "assistant" ? (
              <div style={{ overflow: "hidden" }}>
                <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
            )}
            {msg.isError && (
              <button
                onClick={retryLast}
                style={{
                  marginTop: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                  background: COLORS.accentDim, color: COLORS.accent,
                  border: `1px solid ${COLORS.accent}`, borderRadius: 6,
                  cursor: "pointer", fontFamily: FONT_UI,
                }}
              >
                Retry
              </button>
            )}
          </div>
        ))}

        {streaming && messages[messages.length - 1]?.content === "" && (
          <div style={{
            alignSelf: "flex-start", maxWidth: "88%",
            background: COLORS.bgAssistant, border: `1px solid ${COLORS.border}`,
            borderRadius: "14px 14px 14px 4px", padding: "10px 14px",
            fontSize: 13, color: COLORS.textDim, fontStyle: "italic",
          }}>
            Your vCFO is thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px 16px",
        borderTop: `1px solid ${COLORS.border}`,
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex",
          gap: 8,
          background: "#0a0a0a",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: "4px 4px 4px 14px",
          alignItems: "flex-end",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your financials..."
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: COLORS.text,
              fontSize: 13.5,
              fontFamily: FONT_UI,
              resize: "none",
              lineHeight: 1.5,
              padding: "8px 0",
              maxHeight: 120,
              overflowY: "auto",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: input.trim() && !streaming ? COLORS.accent : COLORS.border,
              border: "none",
              cursor: input.trim() && !streaming ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !streaming ? "#0a0b0d" : COLORS.textMuted} strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CSS keyframes (injected once) ──────────────────────────────────────────

export function ChatStyles() {
  return (
    <style>{`
      @keyframes chatPulse {
        0%, 100% { box-shadow: 0 4px 24px rgba(201, 162, 39, 0.3); }
        50% { box-shadow: 0 4px 36px rgba(201, 162, 39, 0.55); }
      }
    `}</style>
  );
}
