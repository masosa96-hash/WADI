import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
// Importamos un logo placeholder si no hay uno definido, o usamos texto
// import logo from "../assets/logo.svg";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuthStore();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Por favor completá todos los campos.");
      return;
    }

    try {
      if (isRegistering) {
        // Registro
        const { error } = await signUp(email, password);
        if (error) throw error;
        // Si no hay error, podríamos redirigir o mostrar un mensaje
        // A veces Supabase requiere confirmar email.
        navigate("/projects");
      } else {
        // Login
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/projects");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-app)", // Usa el fondo oscuro global
        color: "var(--text-primary)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          background: "var(--bg-panel)",
          borderRadius: "16px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)", // Sombra elegante
          border: "1px solid var(--border-color)",
          textAlign: "center",
        }}
      >
        {/* LOGO / BRAND */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
              margin: 0,
            }}
          >
            WADI
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            {isRegistering ? "Creá tu cuenta" : "Bienvenido de nuevo"}
          </p>
        </div>

        {/* ERROR */}
        {errorMsg && (
          <div
            style={{
              background: "rgba(255, 80, 80, 0.1)",
              border: "1px solid rgba(255, 80, 80, 0.3)",
              color: "#ff6b6b",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div style={{ textAlign: "left" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--bg-element)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              className="focus:border-accent" // Si tienes clases de utilidad, o style inline
            />
          </div>

          <div style={{ textAlign: "left" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--bg-element)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "1rem",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "1rem",
              padding: "12px",
              background: loading ? "var(--bg-element)" : "var(--text-primary)", // Blanco/Contraste fuerte
              color: loading ? "var(--text-tertiary)" : "var(--bg-app)", // Texto invertido
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.1s, opacity 0.2s",
            }}
          >
            {loading
              ? "Procesando..."
              : isRegistering
                ? "Registrarse"
                : "Continuar"}
          </button>
        </form>

        {/* TOGGLE LOGIN/REGISTER */}
        <div
          style={{
            marginTop: "1.5rem",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
          }}
        >
          {isRegistering ? "¿Ya tenés cuenta? " : "¿No tenés cuenta? "}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-color, #4facfe)", // Fallback azul si no hay accent
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              padding: 0,
            }}
          >
            {isRegistering ? "Iniciar Sesión" : "Registrate"}
          </button>
        </div>
      </div>
    </div>
  );
}
