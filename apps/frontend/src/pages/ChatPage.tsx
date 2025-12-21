import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useChatStore, type Attachment } from "../store/chatStore";

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
                <div className={isUser ? "bubble-user" : "bubble-wadi"}>
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
    </Layout>
  );
}
