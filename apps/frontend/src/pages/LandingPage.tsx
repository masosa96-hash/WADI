import { useNavigate, Link } from "react-router-dom";
import { useChatStore } from "../store/chatStore";

export default function LandingPage() {
  const navigate = useNavigate();
  const { setPreset, resetChat } = useChatStore();

  const handleStart = () => {
    resetChat();
    navigate("/chat");
  };

  const handleCardClick = (
    preset: "tech" | "biz" | "learning" | "productivity" | "reflexivo"
  ) => {
    setPreset(preset);
    navigate("/chat");
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        color: "var(--color-text-main)",
        backgroundColor: "var(--color-bg)",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* 1. HERO SECTION */}
      <section
        style={{
          padding: "8rem 2rem 4rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "2rem",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: "800px", zIndex: 2 }}>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 10vw, 6rem)", // Smaller min for mobile
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
              background: "var(--grad-main)", // CSS var
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Del caos
            <br />
            <span
              style={{
                color: "var(--color-text-main)",
                WebkitTextFillColor: "var(--color-text-main)",
              }}
            >
              al plan.
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              lineHeight: 1.6,
              color: "var(--color-text-soft)",
              maxWidth: "600px",
              margin: "0 auto 2.5rem",
              fontWeight: 500,
            }}
          >
            Ordená lo que tenés en la cabeza. Sin vueltas.
          </p>

          <button
            onClick={handleStart}
            style={{
              background: "var(--color-text-main)",
              color: "#FFFFFF",
              border: "none",
              padding: "1rem 3rem",
              borderRadius: "9999px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "var(--shadow-lg)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "var(--shadow-soft)";
              e.currentTarget.style.background = "#1F2937";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              e.currentTarget.style.background = "var(--color-text-main)";
            }}
          >
            Empezar
          </button>
        </div>
      </section>

      {/* 2. OPCIONES DE ENTRADA (MÁS VERBOS, MENOS PRODUCTO) */}
      <section
        style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "3rem",
            color: "var(--color-text-main)",
          }}
        >
          ¿Por dónde arrancamos?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
          }}
        >
          {[
            {
              emoji: "🎯",
              title: "Aprender algo nuevo",
              desc: "Explicaciones a tu medida. Decime qué no entendés y lo desarmamos.",
              preset: "learning",
            },
            {
              emoji: "🚀",
              title: "Aterrizar un proyecto",
              desc: "De 'tengo una idea' a 'estos son los pasos'. Estructura y realidad.",
              preset: "productivity",
            },
            {
              emoji: "📊",
              title: "Analizar datos",
              desc: "Tirá los números y vemos qué significan de verdad.",
              preset: "biz",
            },
            {
              emoji: "⚡",
              title: "Crecer y Vender",
              desc: "Estrategias que no sean humo. Mensajes claros y acción.",
              preset: "biz",
            },
            {
              emoji: "💻",
              title: "Programar / Debuggear",
              desc: "Código limpio. Si no anda, lo arreglamos. Sin llorar.",
              preset: "tech",
            },
            {
              emoji: "⏳",
              title: "Organizar el día",
              desc: "Priorizar lo que importa y descartar el ruido. Foco.",
              preset: "productivity",
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() =>
                handleCardClick(
                  item.preset as
                    | "tech"
                    | "biz"
                    | "learning"
                    | "productivity"
                    | "reflexivo"
                )
              }
              style={{
                background: "var(--color-surface)",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                cursor: "pointer",
                textAlign: "left",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              <div style={{ fontSize: "2rem" }}>{item.emoji}</div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--color-text-main)",
                  margin: 0,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-text-soft)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 3. INTERFAZ DISEÑADA PARA EL FOCO */}
      <section style={{ padding: "6rem 2rem", background: "var(--color-bg)" }}>
        <div
          style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              marginBottom: "0.5rem",
              color: "var(--color-text-main)",
            }}
          >
            Interfaz diseñada para el foco
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--color-text-soft)",
              marginBottom: "3rem",
              maxWidth: "700px",
              marginInline: "auto",
              lineHeight: 1.6,
            }}
          >
            Una vista de chat limpia, sin distracciones, con tipografía clara y
            espacio suficiente para leer y escribir tranquilo.
          </p>

          {/* Chat Mockup */}
          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: "24px",
              boxShadow: "var(--shadow-soft)",
              padding: "2rem",
              maxWidth: "700px",
              margin: "3rem auto 0",
              border: "1px solid rgba(0,0,0,0.05)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Fake Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#EF4444",
                  }}
                />
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#F59E0B",
                  }}
                />
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#10B981",
                  }}
                />
              </div>
              <div
                style={{
                  background: "var(--color-surface-soft)",
                  color: "var(--color-primary)",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Modo Negocios
              </div>
            </div>

            {/* Chat Area */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                textAlign: "left",
              }}
            >
              {/* AI Message */}
              <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
                <div
                  style={{
                    background: "var(--color-surface-soft)",
                    padding: "1rem 1.5rem",
                    borderRadius: "1.5rem",
                    borderTopLeftRadius: "4px",
                    color: "var(--color-text-main)",
                    lineHeight: 1.5,
                  }}
                >
                  ¡Hola! ¿En qué proyecto querés que trabajemos hoy?
                </div>
              </div>

              {/* User Message */}
              <div style={{ alignSelf: "flex-end", maxWidth: "80%" }}>
                <div
                  style={{
                    background: "var(--color-primary)",
                    color: "#fff",
                    padding: "1rem 1.5rem",
                    borderRadius: "1.5rem",
                    borderBottomRightRadius: "4px",
                    lineHeight: 1.5,
                    boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)",
                  }}
                >
                  Quiero estructurar una idea para una app de finanzas
                  personales.
                </div>
              </div>

              {/* AI Message Reply */}
              <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
                <div
                  style={{
                    background: "var(--color-surface-soft)",
                    padding: "1rem 1.5rem",
                    borderRadius: "1.5rem",
                    borderTopLeftRadius: "4px",
                    color: "var(--color-text-main)",
                    lineHeight: 1.5,
                  }}
                >
                  ¡Excelente! Empecemos definiendo el usuario ideal. ¿A quién te
                  imaginás usándola?
                </div>
              </div>
            </div>

            {/* Fake Input */}
            <div style={{ marginTop: "2rem", position: "relative" }}>
              <div
                style={{
                  width: "100%",
                  height: "56px",
                  background: "var(--color-bg)",
                  borderRadius: "999px",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 1.5rem",
                  color: "#9CA3AF",
                }}
              >
                Escribí algo para empezar...
              </div>
              <div
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "8px",
                  width: "40px",
                  height: "40px",
                  background: "var(--color-text-main)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ↑
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer
        style={{
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          padding: "4rem 2rem",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "var(--color-text-soft)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          {/* Brand */}
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "var(--color-text-main)",
            }}
          >
            WADI
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: "2rem", fontWeight: 500 }}>
            <Link
              to="/terminos"
              style={{
                color: "var(--color-text-main)",
                textDecoration: "none",
              }}
            >
              Términos
            </Link>
            <Link
              to="/privacidad"
              style={{
                color: "var(--color-text-main)",
                textDecoration: "none",
              }}
            >
              Privacidad
            </Link>
          </div>

          {/* Copyright */}
          <div style={{ opacity: 0.7, marginTop: "1rem" }}>
            © 2025 WADI · Agentic Workspace. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
