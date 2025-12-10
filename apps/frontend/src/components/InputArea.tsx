import { useState } from "react";
import type { KeyboardEvent } from "react";

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

      <small style={{ textAlign: "center", opacity: 0.5, fontSize: "0.7rem" }}>
        AI can make mistakes. Please verify important information.
      </small>
    </div>
  );
}
