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
    crystallizeProject, // New action
  } = useChatStore();

  const { initAmbientHum, audioState, playCrystallizeSound } = useScouter();

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

  // --- CRYSTALLIZE LOGIC ---
  const [isCrystallizeOpen, setCrystallizeOpen] = useState(false);
  const [crystallizeData, setCrystallizeData] = useState({
    name: "",
    description: "",
  });
  const [isCrystallizing, setIsCrystallizing] = useState(false);

  const openCrystallizeModal = (content: string) => {
    setCrystallizeData({ name: "", description: content });
    setCrystallizeOpen(true);
  };

  const handleCrystallizeConfirm = async () => {
    setIsCrystallizing(true);
    const success = await crystallizeProject(
      crystallizeData.name,
      crystallizeData.description
    );
    setIsCrystallizing(false);
    if (success) {
      playCrystallizeSound();
      setCrystallizeOpen(false);
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
              <h1 className="text-3xl font-regular font-['Outfit'] text-[var(--wadi-text)] mb-2">
                ¿En qué puedo ayudarte hoy?
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mt-4">
                {[
                  "Ayúdame con mi proyecto",
                  "Planificar mi semana",
                  "Analizar una idea",
                  "Explicame un concepto",
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      // Optimistically populate input or just send it?
                      // Standard behavior is usually sending it or populating.
                      // Since we don't have easy access to setInput from here without prop drilling or store,
                      // we will send it directly via sendMessage logic available in ChatPage.
                      handleSendMessage(suggestion, []);
                    }}
                    className="px-4 py-3 bg-[var(--wadi-surface)] border border-[var(--wadi-border)] hover:border-[var(--wadi-primary)] text-[var(--wadi-text)] rounded-lg text-sm text-left transition-colors hover:bg-[var(--wadi-surface)]/80"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
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
                  {/* ACTION BAR (WADI ONLY) */}
                  {!isUser && (
                    <div className="absolute -top-5 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      {/* Copy */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                        }}
                        className="text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] p-1 hover:bg-[var(--wadi-surface)] rounded"
                        title="Copiar"
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
                      {/* Regenerate (Fake for now, just sends 'regenerate' intent or we could impl real logic later) */}
                      <button
                        onClick={() => {
                          /* Logic to regenerate would go here, maybe delete last msg and resend prev user msg? For now just visual */
                        }}
                        className="text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] p-1 hover:bg-[var(--wadi-surface)] rounded"
                        title="Regenerar (WIP)"
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
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                          <path d="M21 3v5h-5"></path>
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                          <path d="M8 16H3v5"></path>
                        </svg>
                      </button>
                      {/* Thumbs Up/Down (Visual) */}
                      <button
                        className="text-[var(--wadi-text-muted)] hover:text-[var(--wadi-success)] p-1"
                        title="Buen dato"
                      >
                        👍
                      </button>
                      <button
                        className="text-[var(--wadi-text-muted)] hover:text-[var(--wadi-alert)] p-1"
                        title="Cualquiera"
                      >
                        👎
                      </button>
                    </div>
                  )}

                  {/* COPY BUTTON FOR MESSAGES - HOVER ONLY (USER) */}
                  {isUser && (
                    <button
                      onClick={() => {
                        if (msg.content) {
                          navigator.clipboard.writeText(msg.content);
                        }
                      }}
                      className="absolute -top-3 -left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--wadi-surface)] border border-[var(--wadi-primary)] text-[var(--wadi-primary)] p-1 hover:bg-[var(--wadi-primary)] hover:text-white"
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
                  {/* CRYSTALLIZE BUTTON (WADI ONLY) */}
                  {!isUser && (
                    <div className="absolute -bottom-5 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                      <button
                        onClick={() => openCrystallizeModal(msg.content)}
                        className="text-[10px] text-[#A78BFA] hover:text-white font-mono-wadi bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20 px-2 py-0.5 rounded border border-[#A78BFA]/30 transition-colors backdrop-blur-sm"
                      >
                        [CRISTALIZAR]
                      </button>
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

      {/* CRYSTALLIZE MODAL */}
      {isCrystallizeOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[90%] max-w-[500px] border border-[var(--wadi-primary)] bg-[var(--wadi-bg)] p-6 shadow-[0_0_30px_rgba(var(--wadi-primary-rgb),0.2)]">
            <h2 className="text-[var(--wadi-primary)] font-mono-wadi text-lg mb-4">
              [CRISTALIZAR_IDEA]
            </h2>
            <div className="text-[var(--wadi-text-secondary)] text-xs mb-4 font-mono-wadi">
              ¿Pasamos esto a limpio? WADI generará un nombre técnico si lo
              dejás vacío.
            </div>

            <label className="block text-[var(--wadi-text)] text-xs font-mono-wadi mb-2">
              NOMBRE DEL PROYECTO
            </label>
            <input
              value={crystallizeData.name}
              onChange={(e) =>
                setCrystallizeData({ ...crystallizeData, name: e.target.value })
              }
              placeholder="E.j: SISTEMA_LOGÍSTICA_V1 (Opcional)"
              className="w-full bg-[var(--wadi-surface)] border border-[var(--wadi-border)] text-[var(--wadi-text)] p-3 mb-4 font-mono-wadi text-sm focus:border-[var(--wadi-primary)] outline-none placeholder:text-gray-700"
            />

            <label className="block text-[var(--wadi-text)] text-xs font-mono-wadi mb-2">
              DESCRIPCIÓN / REQUERIMIENTOS
            </label>
            <textarea
              value={crystallizeData.description}
              onChange={(e) =>
                setCrystallizeData({
                  ...crystallizeData,
                  description: e.target.value,
                })
              }
              className="w-full h-32 bg-[var(--wadi-surface)] border border-[var(--wadi-border)] text-[var(--wadi-text)] p-3 mb-6 font-mono-wadi text-xs resize-none focus:border-[var(--wadi-primary)] outline-none custom-scrollbar"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCrystallizeOpen(false)}
                className="text-[var(--wadi-text-secondary)] hover:text-[var(--wadi-text)] text-xs font-mono-wadi uppercase px-3 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrystallizeConfirm}
                disabled={isCrystallizing}
                className="bg-[var(--wadi-primary)] text-black px-4 py-2 text-xs font-bold font-mono-wadi uppercase hover:bg-white transition-colors disabled:opacity-50 hover:shadow-[0_0_15px_rgba(var(--wadi-primary-rgb),0.6)]"
              >
                {isCrystallizing ? "CRISTALIZANDO..." : "CONFIRMAR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
