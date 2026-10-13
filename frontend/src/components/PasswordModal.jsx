import React, { useState } from "react";
import { Lock, X, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function PasswordModal({ isOpen, onClose }) {
  const { updatePassword, addToast } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Real-time validation checks
  const isLenValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const isMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isFormValid = isLenValid && hasUppercase && hasSpecial && isMatch && oldPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      await updatePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Lock size={18} color="#6366f1" />
            <span className="modal-title">Update Password</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            {/* Validation Checklist */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.4)",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: isLenValid ? "#34d399" : "#94a3b8" }}>
                {isLenValid ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                <span>8 to 16 characters long</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: hasUppercase ? "#34d399" : "#94a3b8" }}>
                {hasUppercase ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: hasSpecial ? "#34d399" : "#94a3b8" }}>
                {hasSpecial ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                <span>At least one special character (!@#$%^&*...)</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword.length > 0 && !isMatch && (
                <div className="input-hint error">Passwords do not match.</div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!isFormValid || loading}>
              {loading ? "Updating..." : "Save Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
