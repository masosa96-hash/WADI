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
        {isUser ? (
          content
        ) : (
          <div>
            {content.split(/(?=^#{1,3}\s)/m).map((block, i) => {
              const match = block.match(/^(#{1,3})\s+(.+)(\r?\n|$)/);
              if (match) {
                const title = match[2].trim();
                const body = block.replace(match[0], "").trim();
                return (
                  <div key={i} style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "1.05em",
                        marginBottom: "0.5rem",
                        color: "var(--accent-primary)",
                      }}
                    >
                      {title}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{body}</div>
                  </div>
                );
              }
              return (
                <div key={i} style={{ whiteSpace: "pre-wrap" }}>
                  {block.trim()}
                </div>
              );
            })}
          </div>
        )}
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
