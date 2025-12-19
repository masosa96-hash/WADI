import { useState, useEffect, useRef } from "react";
import { useChatStore, type Attachment } from "../../store/chatStore";
import { Button } from "./Button";

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
  const { uploadFile, isUploading } = useChatStore();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if ((!input.trim() && attachments.length === 0) || isLoading || isUploading)
      return;

    await onSendMessage(input, attachments);
    setInput("");
    setAttachments([]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const attachment = await uploadFile(file);
      if (attachment) setAttachments((prev) => [...prev, attachment]);
    } catch (err) {
      console.error(err);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form
      onSubmit={handleSend}
      className="w-full max-w-4xl mx-auto flex flex-col gap-2 relative"
    >
      {/* Attachments Preview - Minimalist Chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="bg-[var(--wadi-surface)] border border-[var(--wadi-border)] px-2 py-1 text-xs text-[var(--wadi-text-muted)] font-mono-wadi flex items-center gap-2"
            >
              <span>
                FILE:{" "}
                {att.name.length > 15
                  ? att.name.substring(0, 12) + "..."
                  : att.name}
              </span>
              <button
                type="button"
                onClick={() =>
                  setAttachments((prev) => prev.filter((a) => a !== att))
                }
                className="hover:text-[var(--wadi-alert)]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-0 bg-[var(--wadi-bg)]/90 backdrop-blur-md border-t border-[var(--wadi-border)] pt-2 pb-6 px-4 md:px-0 sticky bottom-0 z-40">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,.txt,.md,.pdf,.csv"
        />

        {/* CLIP BUTTON */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-none text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] mb-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isUploading}
        >
          <span className="text-xl">+</span>
        </Button>

        {/* TEXT INPUT */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading || isUploading}
            className={`
                            w-full bg-transparent border-b text-base py-2 px-2 font-mono-wadi focus:outline-none transition-all
                            ${
                              isDecisionBlocked
                                ? "border-[var(--wadi-alert)] text-[var(--wadi-alert)] placeholder:text-[var(--wadi-alert)]/50"
                                : "border-[var(--wadi-border)] text-[var(--wadi-text)] placeholder:text-[var(--wadi-text-muted)] focus:border-[var(--wadi-primary)]"
                            }
                        `}
            autoComplete="off"
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
          disabled={!input.trim() && attachments.length === 0}
          className="rounded-none text-[var(--wadi-primary)] hover:bg-[var(--wadi-primary)] hover:text-white mb-1 px-4 font-mono-wadi"
        >
          EXE
        </Button>
      </div>
    </form>
  );
}
