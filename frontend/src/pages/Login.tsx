import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import type { AxiosError } from "axios";
import "./AppStyles.css"; // Use the unified styles

const Login: React.FC = () => {
  const { setToken, setUser } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/login", { email, password });

      console.log("Login response:", res.data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setToken(res.data.token);
      setUser(res.data.user);

      if (res.data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && (
          <div className="auth-error">
            <span className="auth-error-text">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <span className="button-content">
                <span className="spinner"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <p className="auth-footer">
            Don't have an account?{' '}
            <button
              onClick={() => navigate("/signup")}
              className="auth-link"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;