import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import type { AxiosError } from "axios";
import "./AppStyles.css"; // ✅ Use single CSS file

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!name.trim()) newErrors.name = "Name is required";
    else if (name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (confirmPassword !== password) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      await axios.post("/auth/register", { name, email, password });
      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (err: any) {
      setErrors({ 
        form: err.response?.data?.message || "Signup failed. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-body">
      <div className="signup-card">
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Join our community today</p>

        {errors.form && (
          <div className="signup-error">
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {errors.password ? (
              <span className="field-error">{errors.password}</span>
            ) : (
              <span className="field-hint">Must be at least 6 characters</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading ? (
              <span className="button-content">
                <span className="spinner"></span>
                Creating account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>

          <p className="signup-footer">
            Already have an account?{' '}
            <button
              onClick={() => navigate("/login")}
              className="signup-link"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;