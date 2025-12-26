import { useState, useEffect, useRef } from "react";
import { useChatStore, type Attachment } from "../../store/chatStore";
import { Button } from "./Button";
import { useScouter } from "../../hooks/useScouter";

interface TerminalInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => Promise<void>;
  isLoading: boolean;
  isDecisionBlocked?: boolean;
  activeFocus?: string | null;
}

export function TerminalInput({
  onSendMessage,
  isLoading,
  isDecisionBlocked = false,
  activeFocus,
}: TerminalInputProps) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { playScanSound } = useScouter();

  // FOCUS LAW: Keep input focused always
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, input, selectedFile]); // Re-focus on any change/loading end

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    let finalPrompt = input;
    const finalAttachments: Attachment[] = [];

    // OPTIMISTIC UPDATE: Clear UI immediately
    const prevInput = input; // backup in case of error (optional, but good practice)
    setInput("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Force focus back immediately
    if (inputRef.current) inputRef.current.focus();

    if (selectedFile) {
      const isText =
        selectedFile.type.startsWith("text/") ||
        selectedFile.name.endsWith(".md") ||
        selectedFile.name.endsWith(".csv") ||
        selectedFile.name.endsWith(".json");

      if (isText) {
        try {
          const textContent = await selectedFile.text();
          finalPrompt += `\n\n[CONTENIDO_EVIDENCIA_ADJUNTA]\n[ARCHIVO: ${selectedFile.name}]\n---\n${textContent}\n---`;
        } catch (err) {
          console.error("Error reading text file", err);
          finalPrompt += `\n\n[ERROR_LEYENDO_EVIDENCIA: ${selectedFile.name}]`;
        }
      } else {
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });

          finalAttachments.push({
            url: base64,
            name: selectedFile.name,
            type: selectedFile.type,
          });
        } catch (err) {
          console.error("Error converting file to base64", err);
        }
      }
    }

    try {
      await onSendMessage(finalPrompt, finalAttachments);
    } catch (err) {
      // Restore if failed (optional, but clean)
      console.error("Send failed", err);
      setInput(prevInput);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tamaño (4MB)
    if (file.size > 4 * 1024 * 1024) {
      useChatStore.getState().triggerVisualAlert();
      // Opcional: Feedback visual temporal en el placeholder

      return;
    }

    playScanSound();
    setSelectedFile(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 relative">
      <form
        onSubmit={handleSend}
        className="w-full flex flex-col gap-2 relative"
      >
        {selectedFile && (
          <div className="px-2">
            <div className="inline-flex items-center gap-3 bg-[var(--wadi-surface)] border border-[var(--wadi-primary)] px-3 py-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)] animate-in slide-in-from-bottom-2 fade-in duration-300">
              <span className="text-[var(--wadi-primary)] font-mono-wadi text-xs tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--wadi-primary)] animate-pulse rounded-full"></span>
                [EVIDENCIA_CARGADA: {selectedFile.name}]
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-[var(--wadi-text-muted)] hover:text-[var(--wadi-alert)] ml-2 transition-colors font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-0 bg-[var(--wadi-bg)]/90 backdrop-blur-md border-t border-[var(--wadi-border)] pt-2 pb-6 px-4 md:px-0 sticky bottom-0 z-40">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.txt,.md,.pdf,.csv,.json"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-none text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] mb-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeFocus
                  ? "[PRUEBA DE VIDA REQUERIDA: SUBÍ EVIDENCIA]"
                  : "Escribí algo real..."
              }
              disabled={isLoading || !!activeFocus}
              className={`
                  w-full bg-[var(--wadi-surface)] border border-[var(--wadi-border)] text-[var(--wadi-text)]
                  text-sm px-4 py-3 rounded-xl
                  focus:outline-none focus:ring-1 focus:ring-[var(--wadi-primary)] focus:border-[var(--wadi-primary)]
                  transition-all shadow-sm
                  ${
                    isDecisionBlocked
                      ? "border-[var(--wadi-alert)] text-[var(--wadi-alert)] placeholder:text-[var(--wadi-alert)]/50 focus:ring-[var(--wadi-alert)]"
                      : ""
                  }
              `}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <Button
            type="submit"
            variant="ghost"
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className="rounded-none text-[var(--wadi-primary)] hover:bg-[var(--wadi-primary)] hover:text-white mb-1 px-4 font-mono-wadi"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
          </Button>
        </div>
      </form>

      {!!activeFocus && (
        <div className="mt-2 flex justify-center sticky bottom-0 z-50 bg-[var(--wadi-bg)] pb-2">
          <button
            onClick={() => useChatStore.getState().admitFailure()}
            className="text-[10px] text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] hover:bg-[var(--wadi-primary)]/10 border border-transparent hover:border-[var(--wadi-primary)]/30 px-2 py-1 transition-all uppercase tracking-widest"
          >
            [SOLTAR_Y_RECALIBRAR]
          </button>
        </div>
      )}
    </div>
  );
}
