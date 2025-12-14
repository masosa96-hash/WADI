import { useState, useEffect, useRef } from "react";
import { Button } from "./common/Button";

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  placeholder = "¿En qué te ayudo?",
}: ChatInputProps) {
  // Local state for input
  const [input, setInput] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("wadi_chat_draft") || "";
      }
    } catch {
      /* ignore */
    }
    return "";
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Draft persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("wadi_chat_draft", input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const text = input;
    setInput("");
    localStorage.removeItem("wadi_chat_draft");

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await onSendMessage(text);

    // Keep focus after sending
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "0.5rem",
        maxWidth: "900px",
        margin: "0 auto",
        position: "relative",
        alignItems: "flex-end",
      }}
    >
      <div style={{ flex: 1, position: "relative" }}>
        <textarea
          id="chat-input-main"
          name="chat-input-main"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          style={{
            width: "100%",
            padding: "1rem 1.25rem",
            borderRadius: "1.5rem",
            border: "2px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-main)",
            resize: "none",
            minHeight: "50px",
            maxHeight: "200px",
            fontSize: "16px",
            outline: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-primary)";
            e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
            e.target.style.boxShadow = "none";
          }}
          enterKeyHint="send"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !input.trim()}
        aria-label="Enviar mensaje"
        style={{
          height: "50px",
          width: "50px",
          borderRadius: "50%",
          background: "var(--color-primary)",
          color: "#FFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
          border: "2px solid #fff",
          fontSize: "1.2rem",
          transition: "transform 0.1s, opacity 0.2s",
          opacity: isLoading || !input.trim() ? 0.5 : 1,
          cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!isLoading && input.trim())
            e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        ➤
      </Button>
    </form>
  );
}
