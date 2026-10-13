import React, { useState, useEffect } from "react";
import { Store, Star, Users, ArrowUpDown, Calendar, Mail, MapPin } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { StarRating } from "../components/StarRating";

export function StoreOwnerDashboard() {
  const { addToast } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchDashboard = async () => {
    try {
      const res = await api.stores.getOwnerDashboard();
      setDashboardData(res);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading your store dashboard...</p>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.store) {
    return (
      <div className="container">
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <Store size={48} color="#94a3b8" style={{ margin: "0 auto 1rem auto" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>No Store Assigned</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Your account does not have a registered store assigned yet. Please contact a System Administrator.
          </p>
        </div>
      </div>
    );
  }

  const { store, ratings } = dashboardData;

  // Sorted ratings
  const sortedRatings = [...ratings].sort((a, b) => {
    let valA, valB;
    if (sortBy === "userName") {
      valA = a.user.name;
      valB = b.user.name;
    } else if (sortBy === "userEmail") {
      valA = a.user.email;
      valB = b.user.email;
    } else if (sortBy === "rating") {
      valA = a.rating;
      valB = b.rating;
    } else {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    }

    const multiplier = sortOrder === "desc" ? -1 : 1;
    if (typeof valA === "number" && typeof valB === "number") {
      return (valA - valB) * multiplier;
    }
    return String(valA).localeCompare(String(valB)) * multiplier;
  });

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Store Owner Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Review store performance, customer feedback, and submitted ratings
        </p>
      </div>

      {/* Store Overview Card */}
      <div
        className="glass-panel"
        style={{
          padding: "1.75rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div className="brand-icon" style={{ width: "32px", height: "32px" }}>
              <Store size={18} />
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>{store.name}</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Mail size={14} /> {store.email}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MapPin size={14} color="#6366f1" /> {store.address}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fbbf24" }}>
              {store.overallRating > 0 ? store.overallRating.toFixed(1) : "0.0"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Average Rating
            </div>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#34d399" }}>
              {store.totalRatings}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Total Reviews
            </div>
          </div>
        </div>
      </div>

      {/* Raters Table */}
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Customer Reviews & Ratings</h3>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Showing {sortedRatings.length} rating{sortedRatings.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="table-wrapper">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort("userName")}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    Customer Name <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort("userEmail")}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    Email <ArrowUpDown size={13} />
                  </div>
                </th>
                <th>Address</th>
                <th className="sortable" onClick={() => handleSort("rating")}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    Rating <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort("createdAt")}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    Date <ArrowUpDown size={13} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRatings.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                    No customer ratings submitted for this store yet.
                  </td>
                </tr>
              ) : (
                sortedRatings.map((r) => (
                  <tr key={r.ratingId}>
                    <td style={{ fontWeight: 600 }}>{r.user.name}</td>
                    <td style={{ color: "var(--text-muted)" }}>{r.user.email}</td>
                    <td style={{ maxWidth: "250px" }}>{r.user.address}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <StarRating value={r.rating} />
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Calendar size={13} />
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
