import React, { useState, useEffect } from "react";
import { Search, ArrowUpDown, Star, Store, MapPin, Mail, X } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { StarRating } from "../components/StarRating";

export function UserDashboard() {
  const { addToast } = useAuth();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);

  // Rating modal state
  const [selectedStore, setSelectedStore] = useState(null);
  const [userRatingInput, setUserRatingInput] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchStores = async () => {
    try {
      const res = await api.stores.getStores({
        search,
        sortBy,
        sortOrder,
      });
      setStores(res);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setUserRatingInput(store.userSubmittedRating || 5);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    setSubmittingRating(true);
    try {
      const res = await api.ratings.submitRating({
        storeId: selectedStore.id,
        rating: userRatingInput,
      });
      addToast(res.message || "Rating saved!");
      setSelectedStore(null);
      fetchStores();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Registered Stores & Ratings
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Explore registered stores, view overall customer ratings, and submit or update your reviews
        </p>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="toolbar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Search stores by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Sort by:</span>
          <button
            type="button"
            className={`btn btn-secondary ${sortBy === "name" ? "active" : ""}`}
            style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem" }}
            onClick={() => handleSort("name")}
          >
            Name <ArrowUpDown size={12} />
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${sortBy === "overallRating" ? "active" : ""}`}
            style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem" }}
            onClick={() => handleSort("overallRating")}
          >
            Overall Rating <ArrowUpDown size={12} />
          </button>
        </div>
      </div>

      {/* Stores Table */}
      <div className="table-wrapper">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort("name")}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    Store Name <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort("address")}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    Address <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort("overallRating")}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    Overall Rating <ArrowUpDown size={13} />
                  </div>
                </th>
                <th>My Submitted Rating</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                    {loading ? "Loading stores..." : "No stores found matching your search."}
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{store.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "2px" }}>
                        <Mail size={12} /> {store.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", maxWidth: "320px", fontSize: "0.85rem" }}>
                        <MapPin size={14} color="#6366f1" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>{store.address}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <StarRating value={store.overallRating} />
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          ({store.totalRatings} {store.totalRatings === 1 ? "review" : "reviews"})
                        </div>
                      </div>
                    </td>
                    <td>
                      {store.userSubmittedRating ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Star size={16} fill="#f59e0b" color="#f59e0b" />
                          <span style={{ fontWeight: 700, color: "#fbbf24" }}>
                            {store.userSubmittedRating} / 5
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Not rated yet</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className={`btn ${store.userSubmittedRating ? "btn-secondary" : "btn-primary"}`}
                        style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}
                        onClick={() => openRatingModal(store)}
                      >
                        <Star size={14} />
                        {store.userSubmittedRating ? "Modify Rating" : "Submit Rating"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RATING SUBMISSION MODAL */}
      {selectedStore && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">
                {selectedStore.userSubmittedRating ? "Modify Store Rating" : "Rate This Store"}
              </span>
              <button
                onClick={() => setSelectedStore(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRatingSubmit}>
              <div className="modal-body" style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                  {selectedStore.name}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                  {selectedStore.address}
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "0.75rem" }}>
                    Select your rating (1 to 5 stars):
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <StarRating
                      value={userRatingInput}
                      onChange={(r) => setUserRatingInput(r)}
                      interactive={true}
                      size={32}
                      showBadge={false}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "0.75rem",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#fbbf24",
                    }}
                  >
                    {userRatingInput} Star{userRatingInput > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedStore(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingRating}>
                  {submittingRating
                    ? "Submitting..."
                    : selectedStore.userSubmittedRating
                    ? "Update Rating"
                    : "Submit Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
