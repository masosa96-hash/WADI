import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* Y2K Inline Styles / Constants */
const COLORS = {
  bgLight: "#f4f4f4",
  accentPink: "#ff00ff", // Fuchsia
  accentLime: "#ccff00", // Lime
  accentCyan: "#00ffff", // Cyan
  glassWhite: "rgba(255, 255, 255, 0.4)",
  glassBorder: "rgba(255, 255, 255, 0.6)",
  textDark: "#222",
  textGray: "#666",
};

const GRADIENTS = {
  main: "linear-gradient(135deg, #ff00ff 0%, #7928ca 100%)",
  secondary: "linear-gradient(135deg, #00ffff 0%, #ccff00 100%)",
  card: "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%)",
  metal: "linear-gradient(180deg, #ffffff 0%, #e0e0e0 50%, #b0b0b0 100%)",
};

const STYLES = {
  container: {
    fontFamily: "'Inter', sans-serif", // Assuming Inter or system font
    color: COLORS.textDark,
    backgroundColor: COLORS.bgLight,
    minHeight: "100vh",
    overflowX: "hidden" as const,
  },
  heroSection: {
    background: GRADIENTS.main,
    color: "#fff",
    padding: "6rem 2rem 4rem",
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "4rem",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  heroContent: {
    maxWidth: "500px",
    zIndex: 2,
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  titleH1: {
    fontSize: "3.5rem",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    textShadow: "0px 0px 10px rgba(255,255,255,0.5)",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    lineHeight: 1.5,
    opacity: 0.9,
    fontWeight: 500,
  },
  btnPrimary: {
    background: COLORS.accentLime,
    color: "#000",
    border: "2px solid #fff",
    padding: "0.75rem 2rem",
    borderRadius: "999px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(204, 255, 0, 0.6)",
    transition: "transform 0.2s",
    textDecoration: "none",
    display: "inline-block",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    border: "2px solid rgba(255,255,255,0.5)",
    padding: "0.75rem 2rem",
    borderRadius: "999px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    backdropFilter: "blur(5px)",
    textDecoration: "none",
    display: "inline-block",
  },
  windowFrame: {
    background: "rgba(255, 255, 255, 0.85)",
    borderRadius: "12px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.6)",
    width: "100%",
    maxWidth: "450px",
    overflow: "hidden" as const,
    zIndex: 2,
    backdropFilter: "blur(10px)",
  },
  windowHeader: {
    background: "linear-gradient(to right, #e0e0e0, #ffffff)",
    padding: "0.5rem 1rem",
    display: "flex",
    gap: "0.4rem",
    borderBottom: "1px solid #ccc",
  },
  windowDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#ccc",
    border: "1px solid #999",
  },
  section: {
    padding: "5rem 2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: 700,
    textAlign: "center" as const,
    marginBottom: "3rem",
    background: GRADIENTS.main,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },
  glassCard: {
    background: GRADIENTS.card,
    border: `1px solid ${COLORS.glassBorder}`,
    borderRadius: "20px",
    padding: "2rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "1rem",
    justifyContent: "center",
  },
  chip: {
    background: "rgba(255,255,255,0.5)",
    border: `1px solid ${COLORS.accentCyan}`,
    padding: "0.5rem 1.5rem",
    borderRadius: "50px",
    fontSize: "0.9rem",
    fontWeight: 600,
    boxShadow: "0 0 10px rgba(0, 255, 255, 0.2)",
  },
  useCaseCard: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "16px",
    padding: "1.5rem",
    position: "relative" as const,
    boxShadow: "4px 4px 0px rgba(0,0,0,0.1)",
  },
  mp3Header: {
    background: "#eee",
    borderRadius: "8px 8px 0 0",
    height: "20px",
    marginBottom: "1rem",
    marginTop: "-1.5rem",
    marginLeft: "-1.5rem",
    marginRight: "-1.5rem",
    borderBottom: "1px solid #ddd",
    display: "flex",
    alignItems: "center",
    padding: "0 0.5rem",
    fontSize: "0.6rem",
    color: "#999",
  },
  mockUISection: {
    background: "#f0f0f0",
    padding: "5rem 2rem",
  },
  ctaSection: {
    background: GRADIENTS.secondary,
    padding: "6rem 2rem",
    textAlign: "center" as const,
    color: "#000",
  },
  ctaTitle: {
    fontSize: "3rem",
    fontWeight: 800,
    marginBottom: "1rem",
    color: "#222",
  },
  footer: {
    background: "#111",
    color: "#888",
    padding: "3rem 2rem",
    textAlign: "center" as const,
    fontSize: "0.9rem",
  },
};

export default function LandingPage() {
  const navigate = useNavigate();

  // Handling responsiveness for grid
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigateApp = () => {
    navigate("/chat");
  };

  return (
    <div style={STYLES.container}>
      {/* 3.1 HERO SECTION */}
      <section style={STYLES.heroSection}>
        {/* Background blobs/glows could be added here as absolute divs */}

        <div style={STYLES.heroContent}>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.5rem",
              letterSpacing: "2px",
            }}
          >
            WADI
          </div>
          <h1 style={STYLES.titleH1}>
            Del caos
            <br />
            al plan.
          </h1>
          <p style={STYLES.heroSubtitle}>
            WADI es tu workspace de IA que transforma ideas sueltas en proyectos
            claros, planes accionables y aprendizaje guiado.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              style={STYLES.btnPrimary}
              onClick={handleNavigateApp}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Probar WADI ahora →
            </button>
            <button
              style={STYLES.btnSecondary}
              onClick={() => {
                document
                  .getElementById("mockUI")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Ver demo
            </button>
          </div>
        </div>

        {/* Mockup Window */}
        <div style={STYLES.windowFrame}>
          <div style={STYLES.windowHeader}>
            <div style={{ ...STYLES.windowDot, background: "#ff5f56" }}></div>
            <div style={{ ...STYLES.windowDot, background: "#ffbd2e" }}></div>
            <div style={{ ...STYLES.windowDot, background: "#27c93f" }}></div>
            <span
              style={{ fontSize: "0.7rem", color: "#666", marginLeft: "auto" }}
            >
              WADI Chat v3.0
            </span>
          </div>
          <div
            style={{
              padding: "1.5rem",
              background: "rgba(255,255,255,0.9)",
              minHeight: "250px",
              fontSize: "0.9rem",
            }}
          >
            <div
              style={{
                marginBottom: "1rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  background: COLORS.accentPink,
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px 12px 0 12px",
                  maxWidth: "80%",
                }}
              >
                Tengo una idea de negocio pero no sé por dónde empezar.
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  background: GRADIENTS.main,
                  borderRadius: "50%",
                }}
              ></div>
              <div
                style={{
                  background: "#f0f0f0",
                  padding: "1rem",
                  borderRadius: "0 12px 12px 12px",
                  maxWidth: "85%",
                  color: "#333",
                }}
              >
                <p style={{ margin: 0, marginBottom: "0.5rem" }}>
                  ¡Genial! Transformemos ese caos en un plan. 🚀
                </p>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>
                  Activemos el <strong>Modo Negocios</strong>. ¿De qué trata tu
                  idea? ¿Es un producto o servicio para Argentina?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.2 CÓMO TE AYUDA WADI */}
      <section style={STYLES.section}>
        <h2 style={STYLES.sectionTitle}>Cómo te ayuda WADI</h2>
        <div style={STYLES.cardGrid}>
          {/* Card 1 */}
          <div style={STYLES.glassCard}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📅</div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
              Planificador personal
            </h3>
            <p style={{ lineHeight: 1.6, color: COLORS.textGray }}>
              Convierte objetivos vagos en hojas de ruta paso a paso. Definí
              tiempos, hitos y recursos necesarios.
            </p>
          </div>
          {/* Card 2 */}
          <div style={STYLES.glassCard}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🧠</div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
              Coach creativo
            </h3>
            <p style={{ lineHeight: 1.6, color: COLORS.textGray }}>
              Brainstorming infinito. WADI mejora tus ideas, sugiere enfoques
              alternativos y desbloquea tu creatividad.
            </p>
          </div>
          {/* Card 3 */}
          <div style={STYLES.glassCard}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📊</div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
              Panel de proyectos
            </h3>
            <p style={{ lineHeight: 1.6, color: COLORS.textGray }}>
              Centralizá tus aventuras. Guardá cada conversación relevante en un
              proyecto organizado para no perder nada.
            </p>
          </div>
        </div>
      </section>

      {/* 3.3 EL CEREBRO DE WADI */}
      <section style={{ ...STYLES.section, background: "#fff" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ ...STYLES.sectionTitle, textAlign: "left" }}>
              El cerebro de WADI
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.8,
                color: "#444",
                marginBottom: "1.5rem",
              }}
            >
              WADI no es un chat cualquiera. Se adapta a quién sos y qué
              necesitás en cada momento. Recuerda tus preferencias de tono,
              idioma y estilo.
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {[
                "🎭 Modos: General, Experto Técnico, Negocios, Tutor.",
                "💾 Memoria de contexto y preferencias.",
                "🌐 Multi-idioma y multi-stack.",
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: COLORS.accentPink }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={STYLES.chipContainer}>
            {[
              "Aprendizaje personalizado",
              "Gestión de proyectos",
              "Análisis & visualizaciones",
              "Marketing & Growth",
              "Tech & Dev",
              "Productivity",
            ].map((chip) => (
              <div key={chip} style={STYLES.chip}>
                {chip}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.4 CASOS DE USO */}
      <section style={STYLES.section}>
        <h2 style={STYLES.sectionTitle}>Casos de uso</h2>
        <div style={STYLES.cardGrid}>
          {[
            {
              title: "Emprendedor",
              steps: ["Idea", "Validación", "Plan de Negocio"],
            },
            { title: "Freelancer", steps: ["Propuesta", "Gestión", "Entrega"] },
            {
              title: "Creativo",
              steps: ["Inspiración", "Boceto", "Refinamiento"],
            },
            {
              title: "Estudiante",
              steps: ["Tema", "Plan de estudio", "Repaso"],
            },
          ].map((useCase) => (
            <div key={useCase.title} style={STYLES.useCaseCard}>
              <div style={STYLES.mp3Header}>PLAYER - WADI v1</div>
              <h4
                style={{
                  margin: "0 0 1rem",
                  fontSize: "1.2rem",
                  color: COLORS.accentPink,
                }}
              >
                {useCase.title}
              </h4>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {useCase.steps.map((step, i) => (
                  <span
                    key={step}
                    style={{
                      fontSize: "0.75rem",
                      background: "#eee",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      color: "#555",
                    }}
                  >
                    {i + 1}. {step}
                  </span>
                ))}
              </div>
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#ddd",
                  }}
                ></div>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#ddd",
                  }}
                ></div>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#ddd",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3.5 CONOCÉ LA INTERFAZ */}
      <section id="mockUI" style={STYLES.mockUISection}>
        <h2 style={STYLES.sectionTitle}>Conocé la interfaz</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          {/* Mock Window 1 */}
          <div
            style={{
              ...STYLES.windowFrame,
              maxWidth: "800px",
              height: "400px",
              background: "white",
              display: "flex",
              border: "1px solid #ccc",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                width: "20%",
                background: "#f9f9f9",
                borderRight: "1px solid #eee",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  background: "#e0e0e0",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              ></div>
              <div
                style={{
                  width: "80%",
                  height: "10px",
                  background: "#e0e0e0",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              ></div>
              <div
                style={{
                  width: "60%",
                  height: "10px",
                  background: "#e0e0e0",
                  borderRadius: "4px",
                }}
              ></div>
            </div>
            <div
              style={{
                flex: 1,
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  alignSelf: "flex-end",
                  width: "40%",
                  height: "40px",
                  background: COLORS.accentLime,
                  borderRadius: "12px 12px 0 12px",
                  marginBottom: "1rem",
                }}
              ></div>
              <div
                style={{
                  alignSelf: "flex-start",
                  width: "50%",
                  height: "80px",
                  background: "#f0f0f0",
                  borderRadius: "0 12px 12px 12px",
                }}
              ></div>
              <div
                style={{
                  marginTop: "auto",
                  width: "100%",
                  height: "50px",
                  border: "1px solid #ddd",
                  borderRadius: "25px",
                }}
              ></div>
            </div>
          </div>

          <p style={{ textAlign: "center", color: COLORS.textGray }}>
            Interfaz limpia, minimalista y enfocada en tu flujo de trabajo.
          </p>
        </div>
      </section>

      {/* 3.6 CTA FINAL */}
      <section style={STYLES.ctaSection}>
        <h2 style={STYLES.ctaTitle}>¿Listo para ordenar tu caos?</h2>
        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "2rem",
            maxWidth: "600px",
            margin: "0 auto 2rem",
          }}
        >
          Unite a WADI y comenzá a construir tus proyectos hoy mismo.
        </p>
        <button
          style={{
            ...STYLES.btnPrimary,
            background: "#000",
            color: "#fff",
            boxShadow: "0 0 20px rgba(0,0,0,0.4)",
          }}
          onClick={handleNavigateApp}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Crear mi espacio WADI
        </button>
      </section>

      {/* 3.7 FOOTER */}
      <footer style={STYLES.footer}>
        <div
          style={{
            fontWeight: 800,
            fontSize: "1.5rem",
            letterSpacing: "2px",
            color: "white",
            marginBottom: "1rem",
          }}
        >
          WADI
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <span style={{ cursor: "pointer" }}>Contacto</span>
          <span style={{ cursor: "pointer" }}>Términos</span>
          <span style={{ cursor: "pointer" }}>Privacidad</span>
        </div>
        <div>WADI · Agentic Workspace · Del caos al plan. © 2024</div>
      </footer>
    </div>
  );
}
