import React, { useState } from "react";
import { Store, Key, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PasswordModal } from "./PasswordModal";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!user) return null;

  const roleLabels = {
    ADMIN: "Administrator",
    STORE_OWNER: "Store Owner",
    USER: "Normal User",
  };

  const roleClasses = {
    ADMIN: "admin",
    STORE_OWNER: "store_owner",
    USER: "user",
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-brand">
          <div className="brand-icon">
            <Store size={20} />
          </div>
          <span>StoreRate</span>
        </div>

        <div className="nav-actions">
          <div className="user-badge">
            <User size={16} color="#94a3b8" />
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{user.name}</span>
            <span className={`role-tag ${roleClasses[user.role]}`}>
              {roleLabels[user.role] || user.role}
            </span>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setIsPasswordModalOpen(true)}
            title="Update Password"
          >
            <Key size={15} />
            <span style={{ display: "none", sm: "inline" }}>Password</span>
          </button>

          <button className="btn btn-danger" onClick={logout} title="Log Out">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}
