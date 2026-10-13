import React from "react";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { AuthPage } from "./pages/AuthPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UserDashboard } from "./pages/UserDashboard";
import { StoreOwnerDashboard } from "./pages/StoreOwnerDashboard";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-app)",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(99, 102, 241, 0.2)",
              borderTopColor: "var(--color-primary)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem auto",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span>Loading StoreRate Platform...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {user.role === "ADMIN" && <AdminDashboard />}
        {user.role === "STORE_OWNER" && <StoreOwnerDashboard />}
        {user.role === "USER" && <UserDashboard />}
      </main>
    </div>
  );
}
