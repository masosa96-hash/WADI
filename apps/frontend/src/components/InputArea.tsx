import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useChatStore } from "../store/chatStore";

interface InputAreaProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  suggestions?: string[];
}

export function InputArea({
  onSend,
  disabled,
  placeholder,
  suggestions,
}: InputAreaProps) {
  const { preferences, setPreferences } = useChatStore();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        padding: "var(--space-4)",
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-app)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        position: "sticky",
        bottom: 0,
        zIndex: 10,
      }}
    >
      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            overflowX: "auto",
            paddingBottom: "var(--space-1)",
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSend(s)}
              disabled={disabled}
              style={{
                fontSize: "0.85rem",
                padding: "var(--space-1) var(--space-3)",
                backgroundColor: "var(--bg-element)",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "var(--space-2)",
          backgroundColor: "var(--bg-element)",
          padding: "var(--space-2)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "var(--border-focus)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "var(--border-subtle)")
        }
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type a message..."}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            maxHeight: "150px",
            minHeight: "24px",
            padding: "var(--space-1) var(--space-2)",
            background: "transparent",
            border: "none",
            outline: "none",
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          style={{
            padding: "var(--space-2)",
            borderRadius: "50%",
            backgroundColor: text.trim()
              ? "var(--accent-primary)"
              : "transparent",
            color: text.trim() ? "white" : "var(--text-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            transition: "background-color 0.2s",
          }}
          aria-label="Send"
        >
          {/* Simple Arrow Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      {/* Controls Bar */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          alignItems: "center",
          justifyContent: "flex-end", // Align right or center? Prompt doesn't say. Let's start left or center.
          marginTop: "var(--space-1)",
        }}
      >
        <select
          value={preferences.tone}
          onChange={(e) => setPreferences({ tone: e.target.value as any })}
          style={{
            fontSize: "0.75rem",
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-element)",
            color: "var(--text-secondary)",
          }}
        >
          <option value="neutro">Neutro</option>
          <option value="casual">Casual</option>
          <option value="tecnico">Técnico</option>
        </select>
        <select
          value={preferences.length}
          onChange={(e) => setPreferences({ length: e.target.value as any })}
          style={{
            fontSize: "0.75rem",
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-element)",
            color: "var(--text-secondary)",
          }}
        >
          <option value="corta">Corta</option>
          <option value="media">Media</option>
          <option value="larga">Larga</option>
        </select>
        <select
          value={preferences.language}
          onChange={(e) => setPreferences({ language: e.target.value as any })}
          style={{
            fontSize: "0.75rem",
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-element)",
            color: "var(--text-secondary)",
          }}
        >
          <option value="auto">Auto (Idioma)</option>
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      <small style={{ textAlign: "center", opacity: 0.5, fontSize: "0.7rem" }}>
        AI can make mistakes. Please verify important information.
      </small>
    </div>
  );
}
