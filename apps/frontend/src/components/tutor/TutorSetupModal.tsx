import { useState } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { useChatStore } from "../../store/chatStore";

interface TutorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorSetupModal({ isOpen, onClose }: TutorSetupModalProps) {
  const startTutorConversation = useChatStore(
    (state) => state.startTutorConversation
  );

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<
    "principiante" | "intermedio" | "avanzado"
  >("principiante");
  const [targetTime, setTargetTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    await startTutorConversation({ topic, level, targetTime });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Modo Tutor 📚">
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        <Input
          label="¿Qué querés aprender?"
          placeholder="Ej: React, Finanzas Personales, Guitarra..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
            }}
          >
            Tu nivel actual
          </label>
          <select
            value={level}
            onChange={(e) =>
              setLevel(
                e.target.value as "principiante" | "intermedio" | "avanzado"
              )
            }
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-app)",
              color: "var(--text-primary)",
            }}
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>

        <Input
          label="Tiempo disponible / Meta"
          placeholder="Ej: 2 semanas, 1 hora por día..."
          value={targetTime}
          onChange={(e) => setTargetTime(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!topic.trim()}>
            Empezar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
