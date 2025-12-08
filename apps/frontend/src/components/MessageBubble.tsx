// Imports removed

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function MessageBubble({
  role,
  content,
  timestamp,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: "var(--space-4)",
        maxWidth: "80%",
        alignSelf: isUser ? "flex-end" : "flex-start",
        width: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: isUser ? "var(--msg-user-bg)" : "var(--msg-ai-bg)",
          color: isUser ? "var(--msg-user-text)" : "var(--msg-ai-text)",
          padding: "var(--space-3) var(--space-4)",
          borderRadius: "var(--radius-lg)",
          borderBottomRightRadius: isUser ? "2px" : "var(--radius-lg)",
          borderBottomLeftRadius: !isUser ? "2px" : "var(--radius-lg)",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {content}
      </div>
      {timestamp && (
        <small
          style={{
            marginTop: "var(--space-1)",
            marginRight: isUser ? "var(--space-1)" : 0,
            marginLeft: !isUser ? "var(--space-1)" : 0,
            opacity: 0.7,
          }}
        >
          {timestamp}
        </small>
      )}
    </div>
  );
}
