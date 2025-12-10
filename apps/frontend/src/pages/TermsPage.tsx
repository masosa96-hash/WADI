import { useNavigate } from "react-router-dom";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        color: "#111827",
        backgroundColor: "#F5F7FB",
        minHeight: "100vh",
        padding: "4rem 2rem",
      }}
    >
      <main
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#fff",
          padding: "2rem",
          borderRadius: "24px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            marginBottom: "2rem",
            background: "transparent",
            border: "none",
            color: "#7C6CFF",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Volver al inicio
        </button>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: "2rem",
            color: "#111827",
          }}
        >
          Términos de uso de WADI
        </h1>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            1. Uso del servicio
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            WADI es una herramienta de asistencia basada en inteligencia
            artificial diseñada para uso personal y gestión de proyectos. El
            usuario se compromete a no utilizar el servicio para fines ilegales,
            dañinos o que violen derechos de terceros.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            2. Contenido generado por IA
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            El contenido generado por WADI es orientativo. La inteligencia
            artificial puede cometer errores. El usuario es el único responsable
            de verificar la exactitud y adecuación de la información antes de
            tomar decisiones basadas en ella, especialmente en temas legales,
            médicos o financieros.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            3. Cuenta y acceso
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            El usuario es responsable de mantener la seguridad de sus
            credenciales de acceso. WADI no se hace responsable por accesos no
            autorizados derivados de negligencia en el cuidado de contraseñas.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            4. Limitación de responsabilidad
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            En la máxima medida permitida por la ley, WADI y sus desarrolladores
            no serán responsables por daños directos, indirectos o consecuentes
            que surjan del uso o la imposibilidad de uso del servicio.
          </p>
        </section>

        <section>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            5. Cambios en los términos
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Nos reservamos el derecho de modificar estos términos en cualquier
            momento. Notificaremos los cambios significativos actualizando la
            fecha de "última actualización" en esta página.
          </p>
          <p
            style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#6B7280" }}
          >
            Última actualización: Diciembre 2025
          </p>
        </section>
      </main>
    </div>
  );
}
