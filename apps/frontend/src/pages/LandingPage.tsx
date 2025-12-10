import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigateApp = () => navigate("/chat");
  const handleNavigateProjects = () => navigate("/projects");

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
      {/* HERO SECTION */}
      <section
        style={{
          background: "var(--grad-surface)", // Subtle light/dark gradient
          padding: "6rem 2rem 4rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "4rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.5rem",
              letterSpacing: "2px",
              background: "var(--grad-main)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            WADI
          </div>
          <h1
            style={{
              fontSize: "clamp(3rem, 5vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-text-main)",
            }}
          >
            Del caos
            <br />
            <span style={{ color: "var(--color-primary)" }}>al plan.</span>
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              lineHeight: 1.5,
              color: "var(--color-text-soft)",
              fontWeight: 500,
            }}
          >
            WADI es tu workspace de IA que transforma ideas sueltas en proyectos
            claros, planes accionables y aprendizaje guiado.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={handleNavigateApp}
              style={{
                background: "var(--color-primary)",
                color: "#fff",
                border: "none",
                padding: "0.75rem 2rem",
                borderRadius: "999px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "var(--shadow-lg)",
                transition: "transform 0.2s, background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.backgroundColor =
                  "var(--color-primary-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "var(--color-primary)";
              }}
            >
              Probar WADI ahora →
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("mockUI")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                background: "transparent",
                color: "var(--color-text-main)",
                border: "2px solid var(--color-border)",
                padding: "0.75rem 2rem",
                borderRadius: "999px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.color = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-main)";
              }}
            >
              Ver demo
            </button>
          </div>
        </div>

        {/* Mockup Window */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.5)",
            width: "100%",
            maxWidth: "450px",
            overflow: "hidden",
            zIndex: 2,
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.8)",
              padding: "0.75rem 1rem",
              display: "flex",
              gap: "0.5rem",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ff5f56",
              }}
            ></div>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ffbd2e",
              }}
            ></div>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#27c93f",
              }}
            ></div>
            <span
              style={{
                fontSize: "0.7rem",
                color: "#999",
                marginLeft: "auto",
                fontWeight: 600,
              }}
            >
              WADI Chat v3.0
            </span>
          </div>
          <div
            style={{
              padding: "1.5rem",
              background: "rgba(255,255,255,0.5)",
              minHeight: "280px",
              fontSize: "0.9rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  padding: "0.8rem 1.2rem",
                  borderRadius: "16px 16px 4px 16px",
                  maxWidth: "85%",
                  boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
                }}
              >
                Tengo una idea de negocio pero no sé por dónde empezar. 🤯
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.8rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "var(--grad-main)",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              ></div>
              <div
                style={{
                  background: "#fff",
                  padding: "1rem",
                  borderRadius: "4px 16px 16px 16px",
                  maxWidth: "90%",
                  color: "#333",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <p style={{ margin: 0, marginBottom: "0.5rem" }}>
                  ¡Genial! Transformemos ese caos en un plan. 🚀
                </p>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                  Activemos el <strong>Modo Negocios</strong>. ¿De qué trata tu
                  idea? ¿Es un producto o servicio para Argentina?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTIONS: HELP */}
      <section
        style={{ padding: "5rem 2rem", maxWidth: "1200px", margin: "0 auto" }}
      >
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "3rem",
            background: "var(--grad-main)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            width: "fit-content",
            marginInline: "auto",
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
              icon: "📅",
              title: "Planificador",
              text: "Convierte objetivos vagos en hojas de ruta paso a paso. Definí tiempos, hitos y recursos necesarios.",
            },
            {
              icon: "🧠",
              title: "Coach Creativo",
              text: "Brainstorming infinito. WADI mejora tus ideas, sugiere enfoques alternativos y desbloquea tu creatividad.",
            },
            {
              icon: "📊",
              title: "Proyectos",
              text: "Centralizá tus aventuras. Guardá cada conversación relevante en un proyecto organizado.",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "var(--shadow-sm)",
                transition: "transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                {item.icon}
              </div>
              <h3
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  lineHeight: 1.6,
                  color: "var(--color-text-soft)",
                  margin: 0,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BRAIN */}
      <section
        style={{
          padding: "5rem 2rem",
          background: "var(--color-surface-soft)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: "2.2rem", marginBottom: "1.5rem" }}>
              El cerebro de WADI
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.8,
                color: "var(--color-text-soft)",
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
                "💾 Memoria de contexto y preferencias de usuario.",
                "🌐 Multi-idioma y soporte multi-stack.",
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "1rem",
                    fontWeight: 500,
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--color-secondary)",
                    }}
                  ></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            {[
              "Aprendizaje personalizado",
              "Gestión de proyectos",
              "Análisis de datos",
              "Marketing & Growth",
              "Tech & Code",
              "Productividad",
            ].map((chip) => (
              <div
                key={chip}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "50px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--color-text-soft)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOCK UI */}
      <section
        id="mockUI"
        style={{ padding: "5rem 2rem", background: "var(--color-bg)" }}
      >
        <div
          style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}
        >
          <h2 style={{ fontSize: "2rem", marginBottom: "3rem" }}>
            Interfaz diseñada para el foco
          </h2>

          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: "12px",
              boxShadow: "0 20px 60px -10px rgba(0,0,0,0.1)",
              border: "1px solid var(--color-border)",
              aspectRatio: isMobile ? "auto" : "16/9",
              height: isMobile ? "300px" : "auto",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Abstract UI representation */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: "250px",
                borderRight: "1px solid var(--color-border)",
                background: "var(--color-surface-soft)",
                display: isMobile ? "none" : "block",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "270px",
                right: "20px",
                height: "40px",
                background: "var(--color-surface-soft)",
                borderRadius: "8px",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: "30px",
                left: isMobile ? "20px" : "270px",
                right: "30px",
                height: "60px",
                border: "2px solid var(--color-border)",
                borderRadius: "30px",
              }}
            ></div>
          </div>
          <p style={{ marginTop: "2rem", color: "var(--color-text-soft)" }}>
            Simple. Potente. Sin distracciones.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "var(--grad-main)",
          padding: "6rem 2rem",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            marginBottom: "1rem",
            color: "#fff",
          }}
        >
          ¿Listo para ordenar tu caos?
        </h2>
        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "2.5rem",
            maxWidth: "600px",
            marginInline: "auto",
            opacity: 0.9,
          }}
        >
          Unite a WADI y comenzá a construir tus proyectos hoy mismo.
        </p>
        <button
          onClick={handleNavigateProjects}
          style={{
            background: "#fff",
            color: "#000",
            border: "none",
            padding: "1rem 3rem",
            borderRadius: "999px",
            fontSize: "1.1rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Crear mi espacio WADI
        </button>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#020617",
          color: "#94A3B8",
          padding: "4rem 2rem",
          textAlign: "center",
          fontSize: "0.9rem",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: "1.5rem",
            color: "#fff",
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
          <span>Contacto</span>
          <span>Términos</span>
          <span>Privacidad</span>
        </div>
        <div>© 2025 WADI · Agentic Workspace.</div>
      </footer>
    </div>
  );
}
