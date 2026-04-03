import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import "../styles/Auth.css";

const RegisterView = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Please fill in your email and password");
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser({ email, password });

      if (result.message === "User registered") {
        alert("Registered successfully");
        navigate("/login");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error registering");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--compact">
      <section className="auth-panel auth-panel--form auth-panel--solo">
        <div className="auth-card auth-card--compact">
          <div className="auth-avatar">VN</div>
          <p className="auth-kicker">Vi-Notes</p>
          <h2>Create Account</h2>

          <label className="auth-label" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label className="auth-label" htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            placeholder="Create a secure password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button onClick={handleRegister} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div className="auth-footer-row">
            <span className="auth-footer-link" onClick={() => navigate("/login")}>
              Back to login
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegisterView;
