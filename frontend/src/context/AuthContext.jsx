import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("roxiler_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("roxiler_token");
      if (token) {
        try {
          const res = await api.auth.getMe();
          setUser(res.user);
          localStorage.setItem("roxiler_user", JSON.stringify(res.user));
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    localStorage.setItem("roxiler_token", res.token);
    localStorage.setItem("roxiler_user", JSON.stringify(res.user));
    setUser(res.user);
    addToast(`Welcome back, ${res.user.name}!`);
    return res.user;
  };

  const signup = async (userData) => {
    const res = await api.auth.signup(userData);
    localStorage.setItem("roxiler_token", res.token);
    localStorage.setItem("roxiler_user", JSON.stringify(res.user));
    setUser(res.user);
    addToast("Account created successfully!");
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem("roxiler_token");
    localStorage.removeItem("roxiler_user");
    setUser(null);
    addToast("Logged out successfully.", "success");
  };

  const updatePassword = async (oldPassword, newPassword) => {
    const res = await api.auth.updatePassword({ oldPassword, newPassword });
    addToast(res.message || "Password updated successfully!");
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updatePassword,
        addToast,
      }}
    >
      {children}
      {/* Toast container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
