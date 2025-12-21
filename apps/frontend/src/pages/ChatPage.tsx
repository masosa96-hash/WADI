import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useChatStore, type Attachment } from "../store/chatStore";
import { useScouter } from "../hooks/useScouter";

import { TerminalInput } from "../components/ui/TerminalInput";
import { Scouter } from "../components/ui/Scouter";
import { DecisionWall } from "../components/auditor/DecisionWall";
import { AuditorHeader } from "../components/auditor/AuditorHeader";
import { DataDeconstructor } from "../components/auditor/DataDeconstructor";

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const {
    messages,
    isLoading,
    sendMessage,
    loadConversations,
    resetChat,
    loadConversation,
    hasStarted,
    conversationId: storeConversationId,
    activeFocus,
  } = useChatStore();

  const { initAmbientHum, audioState } = useScouter();

  const lastMessage = messages[messages.length - 1];
  const isLastMessageUser = lastMessage?.role === "user";
  const hasForceDecision =
    lastMessage?.content?.includes("[FORCE_DECISION]") ||
    lastMessage?.content?.includes("[CHECK_DE_LUCIDEZ]");

  // Derived state - no need for useEffect/useState syncing
  const isDecisionBlocked = !!(
    lastMessage &&
    !isLastMessageUser &&
    hasForceDecision
  );
  const decisionBlockContent = isDecisionBlocked ? lastMessage.content : null;

  // Load conversation on mount/param change
  useEffect(() => {
    loadConversations();
    if (conversationId) {
      if (conversationId !== storeConversationId) {
        loadConversation(conversationId);
      }
    } else {
      if (storeConversationId) resetChat();
    }
  }, [
    conversationId,
    loadConversation,
    resetChat,
    storeConversationId,
    loadConversations,
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLength = useRef(0);

  // Scroll Handling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useLayoutEffect(() => {
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

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    const newId = (await sendMessage(text, attachments)) as unknown as
      | string
      | null;
    if (!conversationId && newId) {
      navigate(`/chat/${newId}`, { replace: true });
    }
  };

  return (
    <Layout>
      {/* ATOMIC COMPONENTS */}
      <Scouter isDecisionBlocked={isDecisionBlocked} />
      {isDecisionBlocked && (
        <DecisionWall messageContent={decisionBlockContent || undefined} />
      )}

      <div className="flex flex-col h-full max-w-[1000px] mx-auto relative bg-[var(--wadi-bg)] overflow-hidden">
        <AuditorHeader />

        {/* Audio Suspended Check */}
        {audioState === "suspended" && (
          <button
            onClick={initAmbientHum}
            className="absolute top-4 right-4 z-50 px-3 py-1 bg-[var(--wadi-alert)]/10 border border-[var(--wadi-alert)]/50 text-[var(--wadi-alert)] text-[10px] font-mono-wadi uppercase tracking-widest hover:bg-[var(--wadi-alert)]/20 transition-colors animate-pulse"
          >
            [ACTIVAR AUDIO]
          </button>
        )}

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-8 md:p-8 flex flex-col gap-6 scroll-smooth"
        >
          {/* EMPTY STATE - WADI OS */}
          {!hasStarted && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center px-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative group">
                <div className="absolute inset-0 bg-[var(--wadi-primary)] blur-[50px] opacity-20 rounded-full"></div>
                {/* BIG EYE LOGO */}
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[var(--wadi-primary)] relative z-10 drop-shadow-2xl"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    fill="currentColor"
                    className="animate-pulse"
                  />
                  <path
                    d="M12 2V4M12 20V22M2 12H4M20 12H22"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              <div className="space-y-4 max-w-md">
                <h1 className="text-4xl font-bold font-['Outfit'] tracking-tight text-white mb-0">
                  WADI
                </h1>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--wadi-primary)] to-transparent mx-auto"></div>
                <p className="text-[var(--wadi-primary)] font-mono-wadi text-sm tracking-[0.2em] uppercase">
                  AUDITORÍA DE CAOS ACTIVA
                </p>
                <button
                  onClick={() => {
                    useChatStore.setState((state) => ({
                      messages: [
                        ...state.messages,
                        {
                          id: crypto.randomUUID(),
                          role: "assistant",
                          content:
                            "¿Encontraste una grieta en el búnker? Reportala rápido antes de que se inunde todo.\n\n[REPORTE_AUTOMÁTICO]: mailto:masos@example.com?subject=WADI_BUG_REPORT\n(Copiá y pegá si no abre el cliente de correo)",
                          created_at: new Date().toISOString(),
                        },
                      ],
                    }));
                  }}
                  className="mt-4 text-[10px] text-[var(--wadi-text-muted)] hover:text-[var(--wadi-alert)] uppercase tracking-widest border border-transparent hover:border-[var(--wadi-alert)]/30 px-2 py-1 transition-all"
                >
                  [REPORTE_DE_FALLO]
                </button>
              </div>

              <button
                onClick={() => document.querySelector("input")?.focus()}
                className="mt-8 px-8 py-3 bg-[var(--wadi-surface)] border border-[var(--wadi-primary)]/30 text-[var(--wadi-primary)] font-mono-wadi text-xs tracking-[0.2em] hover:bg-[var(--wadi-primary)] hover:text-white transition-all duration-300 uppercase shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
              >
                [ABRIR CANAL]
              </button>
            </div>
          )}

          {/* Bubbles */}
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            // Logic to deconstruct message if it contains the tag
            const content = msg.content || "";
            let deconstructionData = null;
            let beforeText = content;
            let afterText = "";

            if (!isUser && content.includes("[DECONSTRUCT_START]")) {
              try {
                const startTag = "[DECONSTRUCT_START]";
                const endTag = "[DECONSTRUCT_END]";
                const startIndex = content.indexOf(startTag);
                const endIndex = content.indexOf(endTag);

                if (startIndex !== -1 && endIndex !== -1) {
                  const jsonString = content
                    .substring(startIndex + startTag.length, endIndex)
                    .replace(/```json|```/g, "")
                    .trim();
                  deconstructionData = JSON.parse(jsonString);

                  beforeText = content.substring(0, startIndex).trim();
                  afterText = content
                    .substring(endIndex + endTag.length)
                    .trim();
                }
              } catch (e) {
                console.error("Failed to parse deconstruction data", e);
                // Fallback to showing everything if parse fails
                beforeText = content;
              }
            }

            return (
              <div
                key={msg.id}
                className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    isUser ? "bubble-user" : "bubble-wadi group relative"
                  }
                >
                  {/* COPY BUTTON FOR MESSAGES - HOVER ONLY */}
                  {!isUser && (
                    <button
                      onClick={() => {
                        if (msg.content) {
                          navigator.clipboard.writeText(msg.content);
                          // Optional visual feedback could be handled with local state,
                          // but for simplicity and speed (per user request for tactical feel),
                          // we can just rely on the action working.
                          // Or adding a tiny temporary state if needed.
                        }
                      }}
                      className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--wadi-surface)] border border-[var(--wadi-primary)] text-[var(--wadi-primary)] p-1 hover:bg-[var(--wadi-primary)] hover:text-white"
                      title="Copiar Mensaje"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  )}

                  {deconstructionData ? (
                    <div className="flex flex-col gap-4">
                      {beforeText && (
                        <div className="whitespace-pre-wrap">{beforeText}</div>
                      )}

                      <DataDeconstructor data={deconstructionData} />

                      {afterText && (
                        <div className="whitespace-pre-wrap">{afterText}</div>
                      )}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}

                  {/* Attachments Display */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.attachments.map(
                        (att: string | Attachment, idx: number) => {
                          const url = typeof att === "string" ? att : att.url;
                          const name =
                            typeof att === "string" ? "Archivo" : att.name;
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                            name
                          );

                          if (isImage) {
                            return (
                              <img
                                key={idx}
                                src={url}
                                alt={name}
                                className="max-w-full h-auto rounded-sm border border-[var(--wadi-border)] max-h-60 mt-2 opacity-90 hover:opacity-100 transition-opacity"
                              />
                            );
                          }
                          return (
                            <a
                              key={idx}
                              href={url}
                              download={name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline opacity-70 hover:opacity-100 mt-1 block font-mono-wadi"
                            >
                              📄 {name}
                            </a>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* TERMINAL INPUT */}
        <TerminalInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isDecisionBlocked={isDecisionBlocked}
          activeFocus={activeFocus}
        />
      </div>
      {/* GLOBAL FOOTER STATUS - AUDIO CHECK */}
      {audioState === "suspended" && (
        <div
          onClick={() => document.body.click()}
          className="fixed bottom-1 right-1 z-[100] text-[9px] font-mono-wadi text-[var(--wadi-text-secondary)] opacity-50 hover:opacity-100 cursor-pointer select-none bg-black/50 px-2 rounded-tl-md border-t border-l border-[var(--wadi-border)]"
        >
          [SISTEMAS_SENSORIALES_OFF: CLIC PARA ACTIVAR]
        </div>
      )}
    </Layout>
  );
}
