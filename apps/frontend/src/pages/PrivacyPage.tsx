import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
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
          Política de Privacidad de WADI
        </h1>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            1. Datos que procesamos
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Procesamos el contenido de las conversaciones que mantienes con WADI
            para generar respuestas. También recopilamos datos técnicos básicos
            necesarios para el funcionamiento del servicio, como dirección IP y
            tipo de navegador, únicamente con fines de seguridad y diagnóstico.
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
            2. Uso de la información
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Utilizamos la información para:
          </p>
          <ul
            style={{
              lineHeight: 1.6,
              color: "#4B5563",
              listStyleType: "disc",
              paddingLeft: "1.5rem",
              marginTop: "0.5rem",
            }}
          >
            <li>Proveer y mantener el servicio.</li>
            <li>Generar respuestas contextualizadas a tus consultas.</li>
            <li>Mejorar la calidad de nuestro modelo y herramientas.</li>
            <li>
              Guardar el historial de tus proyectos para que puedas retomarlos.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            3. Compartición de datos
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            No vendemos tus datos personales. Compartimos información
            estrictamente necesaria con proveedores de infraestructura (como
            servicios de hosting y proveedores de modelos de lenguaje) que
            operan bajo acuerdos de confidencialidad y seguridad.
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
            4. Derechos del usuario
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Tienes derecho a acceder a tus datos y solicitar su eliminación.
            Dado que actualmente operamos en fase beta, puedes contactarnos
            directamente para ejercer estos derechos.
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
            5. Contacto
          </h2>
          <p style={{ lineHeight: 1.6, color: "#4B5563" }}>
            Si tienes dudas sobre nuestra política de privacidad, puedes
            escribirnos a:{" "}
            <a
              href="mailto:contacto@wadi.app"
              style={{ color: "#7C6CFF", fontWeight: 600 }}
            >
              contacto@wadi.app
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
