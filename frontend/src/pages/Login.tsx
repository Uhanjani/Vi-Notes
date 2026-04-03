import { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await loginUser({ email, password });

      if (res.token) {
        alert("Login successful");
        navigate("/");
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error logging in");
    }
  };

 return (
  <div className="container">
    <div className="auth-box">
      <h2>Welcome Back </h2>
      <label> Email</label>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label> Password</label>
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      <p>
        Don’t have an account?{" "}
        <span onClick={() => navigate("/register")}>
          Register
        </span>
      </p>
    </div>
  </div>
);
};

export default Login;
