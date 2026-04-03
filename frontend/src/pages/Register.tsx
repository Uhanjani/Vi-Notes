import { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css"

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await registerUser({ email, password });

      if (res.message === "User registered") {
        alert("Registered successfully");
        navigate("/login");
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error registering");
    }
  };

return (
  <div className="container">
    <div className="auth-box">
      <h2>Create Account </h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Create a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Register</button>

      <p>
        Already have an account?{" "}
        <span onClick={() => navigate("/login")}>
          Login
        </span>
      </p>
    </div>
  </div>
);
};

export default Register;
