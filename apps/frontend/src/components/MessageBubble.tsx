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
        marginBottom: "1rem", // Use explicit unit
        maxWidth: "80%",
        alignSelf: isUser ? "flex-end" : "flex-start",
        width: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: isUser
            ? "var(--color-primary)"
            : "var(--color-surface)",
          color: isUser ? "#FFFFFF" : "var(--color-text-main)",
          padding: "0.8rem 1.2rem", // Explicit padding
          borderRadius: "1rem", // Explicit radius
          borderBottomRightRadius: isUser ? "4px" : "1rem",
          borderBottomLeftRadius: !isUser ? "4px" : "1rem",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: "var(--shadow-sm)",
          fontSize: "var(--text-base)",
          fontWeight: isUser ? 500 : 400,
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
                        fontWeight: 700,
                        fontSize: "1.05em",
                        marginBottom: "0.5rem",
                        color: "var(--color-primary)",
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
            marginTop: "0.25rem",
            marginRight: isUser ? "0.25rem" : 0,
            marginLeft: !isUser ? "0.25rem" : 0,
            opacity: 0.7,
            fontSize: "0.75rem",
            color: "var(--color-text-soft)",
          }}
        >
          {timestamp}
        </small>
      )}
    </div>
  );
}
