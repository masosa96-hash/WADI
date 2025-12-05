import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { signIn, loading } = useAuthStore();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (!error) {
      navigate("/projects");
    } else {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />

        <button disabled={loading}>Ingresar</button>
      </form>
    </div>
  );
}
