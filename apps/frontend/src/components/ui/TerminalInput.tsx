import { useState, useEffect, useRef } from "react";
import { type Attachment } from "../../store/chatStore";
import { Button } from "./Button";
import { useScouter } from "../../hooks/useScouter";

interface TerminalInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => Promise<void>;
  isLoading: boolean;
  isDecisionBlocked?: boolean;
}

const PLACEHOLDERS_NORMAL = [
  "> Ingrese comando...",
  "> Reporte situación...",
  "> Defina objetivo...",
];
const PLACEHOLDERS_BLOCKED = [
  "BLOQUEO ACTIVO // ELEGÍ UNA OPCIÓN",
  "DECISIÓN REQUERIDA IMMEDIATA",
];

export function TerminalInput({
  onSendMessage,
  isLoading,
  isDecisionBlocked = false,
}: TerminalInputProps) {
  const [input, setInput] = useState("");
  // Local state for selected files (not yet uploaded/processed)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { playScanSound } = useScouter();

  // Dynamic Placeholder Logic
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS_NORMAL[0]);

  useEffect(() => {
    const targetPlaceholders = isDecisionBlocked
      ? PLACEHOLDERS_BLOCKED
      : PLACEHOLDERS_NORMAL;
    let i = 0;
    const interval = setInterval(() => {
      setPlaceholder(targetPlaceholders[i]);
      i = (i + 1) % targetPlaceholders.length;
    }, 3000);
    return () => clearInterval(interval);
  }, [isDecisionBlocked]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    let finalPrompt = input;
    const finalAttachments: Attachment[] = [];

    // Process "Evidence"
    if (selectedFile) {
      const isText =
        selectedFile.type.startsWith("text/") ||
        selectedFile.name.endsWith(".md") ||
        selectedFile.name.endsWith(".csv") ||
        selectedFile.name.endsWith(".json");

      // Note: PDF natively cannot be read as text without libraries.
      // We will treat PDF as a base64 attachment (Standard behaviour).

      if (isText) {
        try {
          const textContent = await selectedFile.text();
          finalPrompt += `\n\n[CONTENIDO_EVIDENCIA_ADJUNTA]\n[ARCHIVO: ${selectedFile.name}]\n---\n${textContent}\n---`;
        } catch (err) {
          console.error("Error reading text file", err);
          finalPrompt += `\n\n[ERROR_LEYENDO_EVIDENCIA: ${selectedFile.name}]`;
        }
      } else {
        // Convert Image/PDF/Other to Base64 DataURI for attachment
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });

          finalAttachments.push({
            url: base64, // DataURI
            name: selectedFile.name,
            type: selectedFile.type,
          });
        } catch (err) {
          console.error("Error converting file to base64", err);
        }
      }
    }

    await onSendMessage(finalPrompt, finalAttachments);

    // Clear State
    setInput("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Scouter Feedback
    playScanSound();

    setSelectedFile(file);
    // Reset input value to allow re-selecting same file if needed (after clear) is handled by state logic usually,
    // but good practice to clear ref if we want to ensure change event fires again if cleared.
  };

  return (
    <form
      onSubmit={handleSend}
      className="w-full max-w-4xl mx-auto flex flex-col gap-2 relative"
    >
      {/* Evidence Preview Badge */}
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

        {/* CLIP BUTTON */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-none text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] mb-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          {/* Simple Plus Icon */}
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

        {/* TEXT INPUT */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className={`
                w-full bg-transparent border-b text-base py-2 px-2 font-mono-wadi focus:outline-none transition-all
                ${
                  isDecisionBlocked
                    ? "border-[var(--wadi-alert)] text-[var(--wadi-alert)] placeholder:text-[var(--wadi-alert)]/50"
                    : "border-[var(--wadi-border)] text-[var(--wadi-text)] placeholder:text-[var(--wadi-text-muted)] focus:border-[var(--wadi-primary)]"
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
          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <span className="animate-pulse text-[var(--wadi-primary)] text-xs font-mono-wadi">
                PROCESANDO...
              </span>
            </div>
          )}
        </div>

        {/* SEND BUTTON */}
        <Button
          type="submit"
          variant="ghost"
          disabled={(!input.trim() && !selectedFile) || isLoading}
          className="rounded-none text-[var(--wadi-primary)] hover:bg-[var(--wadi-primary)] hover:text-white mb-1 px-4 font-mono-wadi"
        >
          EXE
        </Button>
      </div>
    </form>
  );
}
