import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { InputArea } from "./InputArea";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatInterfaceProps {
  title?: string;
  status?: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isThinking?: boolean;
  suggestions?: string[];
}

export function ChatInterface({
  title,
  status,
  messages,
  onSendMessage,
  isThinking,
  suggestions,
}: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "var(--space-4)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--bg-app)", // Sticky header if needed
          zIndex: 5,
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.1rem" }}>{title || "New Conversation"}</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--success)",
              }}
            />
            <small>{status || "Online"}</small>
          </div>
        </div>
        <div className="actions">
          {/* Placeholder for future actions like 'Clear Chat', 'Search', etc */}
          <button
            style={{
              padding: "var(--space-2)",
              color: "var(--text-secondary)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      </header>

      {/* Message List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.5,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>
              👋
            </div>
            <h3>Welcome to WADI</h3>
            <p>Start a conversation to begin.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}

        {isThinking && (
          <div
            className="flex items-center gap-2"
            style={{ padding: "var(--space-4)", opacity: 0.7 }}
          >
            <div
              className="typing-dot"
              style={{ animation: "pulse 1s infinite" }}
            >
              ●
            </div>
            <small>Thinking...</small>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <InputArea
        onSend={onSendMessage}
        disabled={isThinking}
        suggestions={suggestions}
      />
    </div>
  );
}
