import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useChatStore } from "../store/chatStore";

import { ChatInput } from "../components/ChatInput";
import { OnboardingModal } from "../components/OnboardingModal";

const PLACEHOLDERS = ["¿Una idea?", "¿Un problema?", "¿Un objetivo?"];

export default function ChatPage() {
  // Lazy initialization to avoid useEffect flicker
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("wadi_onboarding_seen");
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem("wadi_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  const { conversationId } = useParams();
  const navigate = useNavigate();
  const {
    messages,
    isLoading,
    sendMessage,
    loadConversations,
    resetChat,
    loadConversation,
    conversationId: storeConversationId,
  } = useChatStore();

  // Load conversation on mount/param change
  useEffect(() => {
    loadConversations(); // Always refresh list
    if (conversationId) {
      if (conversationId !== storeConversationId) {
        loadConversation(conversationId);
      }
    } else {
      // If at /chat (no ID), reset
      if (storeConversationId) resetChat();
    }
  }, [
    conversationId,
    loadConversation,
    resetChat,
    storeConversationId,
    loadConversations,
  ]);

  // Auto-focus input
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.getElementById("chat-input");
      input?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [conversationId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLength = useRef(0);

  // Placeholder logic
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPlaceholder = PLACEHOLDERS[placeholderIndex];

  // Scroll Handling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    // If user is near bottom (within 100px), enable auto-scroll
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useLayoutEffect(() => {
    // Only scroll if message count increased AND (it's my message OR I was near bottom)
    const newCount = messages.length;
    const oldCount = prevMessagesLength.current;

    if (newCount > oldCount) {
      const lastMsg = messages[newCount - 1];
      const isMyMessage = lastMsg.role === "user";

      if (isMyMessage || shouldAutoScroll) {
        scrollToBottom();
      }
    }
    prevMessagesLength.current = newCount;
  }, [messages, shouldAutoScroll]);

  const handleSendMessage = async (text: string) => {
    // If we are already in a chat, we stay there.
    // If we are sending a message from generic /chat, we want to capture the NEW ID and navigate.

    // We cast the return type because we know we updated the store action
    const newId = (await sendMessage(text)) as unknown as string | null;

    if (!conversationId && newId) {
      navigate(`/chat/${newId}`, { replace: true });
    }
  };

  return (
    <Layout>
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          position: "relative",
          backgroundColor: "var(--color-bg)",
        }}
      >
        {/* Header simple y fijo */}
        <header
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--color-border)",
            background: "rgba(17, 24, 39, 0.8)",
            backdropFilter: "blur(16px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // Centramos el título como punto focal
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: 700,
                background: "var(--grad-main)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
              }}
            >
              WADI
            </h2>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-soft)",
                margin: 0,
              }}
            >
              Del caos al plan
            </p>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Empty State */}
          {messages.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100%",
                gap: "2rem",
                marginTop: "-2rem",
                textAlign: "center",
                padding: "5rem 1rem",
              }}
            >
              <h1
                style={{
                  fontSize: "1.875rem", // text-3xl
                  fontWeight: "bold",
                  color: "var(--color-text-main)",
                  margin: 0,
                }}
              >
                WADI no charla. Ordena.
              </h1>
              <p
                style={{
                  marginTop: "1rem",
                  color: "var(--color-text-soft)",
                  maxWidth: "28rem",
                  fontSize: "1rem",
                  lineHeight: "1.5",
                }}
              >
                Decime directamente qué querés resolver. Si no hay objetivo, no
                hay nada que pensar.
              </p>
            </div>
          )}

          {/* Bubbles */}
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  className="chat-bubble"
                  style={{
                    maxWidth: "80%",
                    padding: "1rem 1.25rem",
                    borderRadius: "1.25rem",
                    borderTopRightRadius: isUser ? "0.25rem" : "1.25rem",
                    borderTopLeftRadius: isUser ? "1.25rem" : "0.25rem",
                    background: isUser
                      ? "var(--color-primary)"
                      : "var(--color-surface)",
                    color: isUser ? "#FFF" : "var(--color-text-main)",
                    boxShadow: isUser
                      ? "0 4px 12px rgba(139, 92, 246, 0.25)"
                      : "var(--shadow-sm)",
                    lineHeight: "1.6",
                    fontSize: "var(--text-base)",
                    border: isUser ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "var(--color-surface-soft)",
                  borderRadius: "2rem",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-soft)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "var(--color-primary)",
                    borderRadius: "50%",
                    animation: "pulse 1s infinite",
                  }}
                ></div>
                Ordenando tus ideas...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "1rem",
            background: "rgba(17, 24, 39, 0.8)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--color-border)",
            marginBottom: "env(keyboard-inset-height, 0px)", // Handle software keyboard
          }}
        >
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={currentPlaceholder}
          />
          <div
            style={{
              textAlign: "center",
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--color-text-soft)",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <span>WADI puede fallar. Usalo como copiloto.</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
