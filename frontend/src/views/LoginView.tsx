import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import "../styles/Auth.css";

const LoginView = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      const result = await loginUser({ email, password });

      if (result.token) {
        alert("Login successful");
        navigate("/workspace");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error logging in");
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
          <h2>Member Login</h2>

          <label className="auth-label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label className="auth-label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "login"}
          </button>

          <div className="auth-footer-row">
            <span className="auth-footer-link" onClick={() => navigate("/register")}>
              Create account
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginView;
