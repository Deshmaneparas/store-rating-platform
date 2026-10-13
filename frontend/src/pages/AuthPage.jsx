import React, { useState } from "react";
import { Store, LogIn, UserPlus, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const { login, signup, addToast } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  // Validation checkers for registration
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordLen = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isPasswordValid = isPasswordLen && hasUppercase && hasSpecial;

  const isSignupValid = isNameValid && isAddressValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!isSignupValid) return;
        await signup({ name, email, address, password });
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick fill helper
  const handleDemoFill = (demoRole) => {
    setIsLogin(true);
    if (demoRole === "admin") {
      setEmail("admin@roxiler.com");
      setPassword("Admin@12345");
    } else if (demoRole === "owner") {
      setEmail("owner@freshmart.com");
      setPassword("Owner@12345");
    } else if (demoRole === "user") {
      setEmail("user@example.com");
      setPassword("User@12345");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "radial-gradient(ellipse at top, #1e1b4b, #0f172a 70%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "460px" }}>
        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            className="brand-icon"
            style={{ width: "52px", height: "52px", margin: "0 auto 1rem auto" }}
          >
            <Store size={28} />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            StoreRate Platform
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            {isLogin
              ? "Single login portal for Administrators, Store Owners & Users"
              : "Register as a Normal User to start reviewing stores"}
          </p>
        </div>

        {/* Main card */}
        <div className="glass-panel" style={{ padding: "2rem" }}>
          {/* Tab buttons */}
          <div className="nav-tabs" style={{ marginBottom: "1.75rem" }}>
            <button
              type="button"
              className={`tab-btn ${isLogin ? "active" : ""}`}
              style={{ flex: 1, textAlign: "center" }}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`tab-btn ${!isLogin ? "active" : ""}`}
              style={{ flex: 1, textAlign: "center" }}
              onClick={() => setIsLogin(false)}
            >
              Register (User)
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <div className="form-label">
                    <span>Full Name</span>
                    <span className="char-counter">
                      {name.length}/60 (min 20)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter full name (20 - 60 characters)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {name.length > 0 && !isNameValid && (
                    <div className="input-hint error">
                      Name must be between 20 and 60 characters.
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="form-label">
                    <span>Address</span>
                    <span className="char-counter">
                      {address.length}/400
                    </span>
                  </div>
                  <textarea
                    className="form-textarea"
                    placeholder="Residential address (max 400 characters)"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                  {address.length > 400 && (
                    <div className="input-hint error">
                      Address exceeds 400 characters maximum.
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Validation indicators shown during registration */}
            {!isLogin && (
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.5)",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  marginBottom: "1.25rem",
                  fontSize: "0.8rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: isPasswordLen ? "#34d399" : "#94a3b8",
                  }}
                >
                  {isPasswordLen ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  <span>8 to 16 characters long</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: hasUppercase ? "#34d399" : "#94a3b8",
                  }}
                >
                  {hasUppercase ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: hasSpecial ? "#34d399" : "#94a3b8",
                  }}
                >
                  {hasSpecial ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  <span>At least one special character (!@#$%^&*...)</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.75rem" }}
              disabled={loading || (!isLogin && !isSignupValid)}
            >
              {loading ? (
                "Processing..."
              ) : isLogin ? (
                <>
                  <LogIn size={16} /> Sign In
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Create Account
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#94a3b8",
                marginBottom: "0.75rem",
              }}
            >
              Quick Demo Logins (Click to autofill)
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                onClick={() => handleDemoFill("admin")}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                onClick={() => handleDemoFill("owner")}
              >
                Store Owner
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                onClick={() => handleDemoFill("user")}
              >
                Normal User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
