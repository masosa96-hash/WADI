import { useNavigate, Link } from "react-router-dom";

// Landing specific theme constants
const THEME = {
  primary: "#7C6CFF",
  gradHero: "linear-gradient(135deg, #7C6CFF 0%, #5FD6FF 100%)",
  gradCTA: "linear-gradient(135deg, #5FD6FF 0%, #7C6CFF 100%)",
  bg: "#F5F7FB",
  textMain: "#111827",
  textSecondary: "#4B5563",
  btnBg: "#111827",
  btnText: "#FFFFFF",
  cardShadow: "0 18px 60px rgba(15,23,42,0.18)",
};

export default function LandingPage() {
  const navigate = useNavigate();

  const handleStart = () => navigate("/chat");

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif", // Ensure Inter is loaded or available
        color: THEME.textMain,
        backgroundColor: THEME.bg,
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
              fontSize: "clamp(3.5rem, 8vw, 6rem)",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
              background: THEME.gradHero,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Del caos
            <br />
            <span
              style={{
                color: THEME.textMain,
                WebkitTextFillColor: THEME.textMain,
              }}
            >
              al plan.
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              lineHeight: 1.6,
              color: THEME.textSecondary,
              maxWidth: "600px",
              margin: "0 auto 2.5rem",
              fontWeight: 500,
            }}
          >
            WADI es tu <strong>workspace de IA</strong> que transforma ideas
            sueltas en proyectos claros, planes accionables y aprendizaje
            guiado.
          </p>

          <button
            onClick={handleStart}
            style={{
              background: THEME.btnBg,
              color: THEME.btnText,
              border: "none",
              padding: "1rem 3rem",
              borderRadius: "9999px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.15)";
              // Mild hover lighten effect
              e.currentTarget.style.background = "#1F2937";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
              e.currentTarget.style.background = THEME.btnBg;
            }}
          >
            Empezar
          </button>
        </div>
      </section>

      {/* 2. CÓMO TE AYUDA WADI (Feature Cards) */}
      <section
        style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "3rem",
            color: THEME.textMain,
          }}
        >
          Cómo te ayuda WADI
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {[
            {
              emoji: "🎯",
              title: "Aprendizaje personalizado",
              desc: "WADI adapta las explicaciones a tu nivel, recuerda tu contexto y te propone ejercicios a tu ritmo.",
            },
            {
              emoji: "🚀",
              title: "Gestión de proyectos",
              desc: "Convierte ideas sueltas en proyectos con objetivos, hitos y próximos pasos claros.",
            },
            {
              emoji: "📊",
              title: "Análisis de datos",
              desc: "Te ayuda a interpretar tablas, métricas y resultados para decidir con más seguridad.",
            },
            {
              emoji: "⚡",
              title: "Marketing & Growth",
              desc: "Genera campañas, mensajes y experimentos de crecimiento a partir de tu contexto real.",
            },
            {
              emoji: "💻",
              title: "Tech & Code",
              desc: "Te acompaña a debuggear, aprender lenguajes y diseñar soluciones paso a paso.",
            },
            {
              emoji: "⏳",
              title: "Productividad",
              desc: "Organiza tu día, prioriza tareas y te recuerda lo importante sin abrumarte.",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.03)";
              }}
            >
              <div style={{ fontSize: "2rem" }}>{item.emoji}</div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: THEME.textMain,
                  margin: 0,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "1rem",
                  color: THEME.textSecondary,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INTERFAZ DISEÑADA PARA EL FOCO */}
      <section style={{ padding: "6rem 2rem", background: "#F5F7FB" }}>
        <div
          style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              marginBottom: "0.5rem",
              color: THEME.textMain,
            }}
          >
            Interfaz diseñada para el foco
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              color: THEME.textSecondary,
              marginBottom: "3rem",
            }}
          >
            Un espacio de conversación limpio para pensar tranquilo. Sin paneles
            raros, solo vos y tus ideas.
          </p>

          {/* Chat Mockup */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              boxShadow: THEME.cardShadow,
              padding: "2rem",
              maxWidth: "700px",
              margin: "0 auto",
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
                  background: "#EEF2FF",
                  color: THEME.primary,
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
                    background: "#F3F4F6",
                    padding: "1rem 1.5rem",
                    borderRadius: "1.5rem",
                    borderTopLeftRadius: "4px",
                    color: THEME.textMain,
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
                    background: THEME.primary,
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
                    background: "#F3F4F6",
                    padding: "1rem 1.5rem",
                    borderRadius: "1.5rem",
                    borderTopLeftRadius: "4px",
                    color: THEME.textMain,
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
                  background: "#F9FAFB",
                  borderRadius: "999px",
                  border: "1px solid #E5E7EB",
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
                  background: THEME.textMain,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
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
          background: "#FFFFFF",
          borderTop: "1px solid #E5E7EB",
          padding: "4rem 2rem",
          textAlign: "center",
          fontSize: "0.9rem",
          color: THEME.textSecondary,
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
              color: THEME.textMain,
            }}
          >
            WADI
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: "2rem", fontWeight: 500 }}>
            <Link
              to="/terminos"
              style={{ color: THEME.textMain, textDecoration: "none" }}
            >
              Términos
            </Link>
            <Link
              to="/privacidad"
              style={{ color: THEME.textMain, textDecoration: "none" }}
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
