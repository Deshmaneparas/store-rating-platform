import React, { useState, useEffect } from "react";
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  ArrowUpDown,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { StarRating } from "../components/StarRating";

export function AdminDashboard() {
  const { addToast } = useAuth();

  // Statistics
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  // Active tab: 'stores' or 'users'
  const [activeTab, setActiveTab] = useState("stores");

  // Stores data & filters
  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState("");
  const [storeSortBy, setStoreSortBy] = useState("name");
  const [storeSortOrder, setStoreSortOrder] = useState("asc");
  const [storeNameFilter, setStoreNameFilter] = useState("");
  const [storeEmailFilter, setStoreEmailFilter] = useState("");
  const [storeAddressFilter, setStoreAddressFilter] = useState("");
  const [showStoreFilters, setShowStoreFilters] = useState(false);

  // Users data & filters
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userNameFilter, setUserNameFilter] = useState("");
  const [userEmailFilter, setUserEmailFilter] = useState("");
  const [userAddressFilter, setUserAddressFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userSortBy, setUserSortBy] = useState("name");
  const [userSortOrder, setUserSortOrder] = useState("asc");
  const [showUserFilters, setShowUserFilters] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);

  // Form states for Add User
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("USER");
  const [submittingUser, setSubmittingUser] = useState(false);

  // Form states for Add Store
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreEmail, setNewStoreEmail] = useState("");
  const [newStoreAddress, setNewStoreAddress] = useState("");
  const [newStoreOwnerId, setNewStoreOwnerId] = useState("");
  const [submittingStore, setSubmittingStore] = useState(false);

  // Load stats
  const fetchStats = async () => {
    try {
      const res = await api.admin.getStats();
      setStats(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Load stores
  const fetchStores = async () => {
    try {
      const res = await api.admin.getStores({
        search: storeSearch,
        name: storeNameFilter,
        email: storeEmailFilter,
        address: storeAddressFilter,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder,
      });
      setStores(res);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  // Load users
  const fetchUsers = async () => {
    try {
      const res = await api.admin.getUsers({
        search: userSearch,
        name: userNameFilter,
        email: userEmailFilter,
        address: userAddressFilter,
        role: userRoleFilter,
        sortBy: userSortBy,
        sortOrder: userSortOrder,
      });
      setUsers(res);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchStats(), fetchStores(), fetchUsers()]);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    fetchStores();
  }, [storeSearch, storeNameFilter, storeEmailFilter, storeAddressFilter, storeSortBy, storeSortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [userSearch, userNameFilter, userEmailFilter, userAddressFilter, userRoleFilter, userSortBy, userSortOrder]);

  // Sorting toggles
  const handleStoreSort = (field) => {
    if (storeSortBy === field) {
      setStoreSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setStoreSortBy(field);
      setStoreSortOrder("asc");
    }
  };

  const handleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setUserSortBy(field);
      setUserSortOrder("asc");
    }
  };

  // Add User validation checks
  const isUserNameValid = newUserName.trim().length >= 20 && newUserName.trim().length <= 60;
  const isUserAddressValid = newUserAddress.trim().length > 0 && newUserAddress.trim().length <= 400;
  const isUserEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserEmail.trim());
  const isUserPasswordLen = newUserPassword.length >= 8 && newUserPassword.length <= 16;
  const isUserPasswordUpper = /[A-Z]/.test(newUserPassword);
  const isUserPasswordSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newUserPassword);
  const isUserPasswordValid = isUserPasswordLen && isUserPasswordUpper && isUserPasswordSpecial;
  const isAddUserFormValid =
    isUserNameValid && isUserAddressValid && isUserEmailValid && isUserPasswordValid;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!isAddUserFormValid) return;

    setSubmittingUser(true);
    try {
      await api.admin.createUser({
        name: newUserName,
        email: newUserEmail,
        address: newUserAddress,
        password: newUserPassword,
        role: newUserRole,
      });
      addToast("User created successfully!");
      setShowAddUserModal(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserAddress("");
      setNewUserPassword("");
      setNewUserRole("USER");
      fetchUsers();
      fetchStats();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmittingUser(false);
    }
  };

  // Add Store validation checks
  const isStoreNameValid = newStoreName.trim().length >= 20 && newStoreName.trim().length <= 60;
  const isStoreAddressValid = newStoreAddress.trim().length > 0 && newStoreAddress.trim().length <= 400;
  const isStoreEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStoreEmail.trim());
  const isAddStoreFormValid = isStoreNameValid && isStoreAddressValid && isStoreEmailValid;

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!isAddStoreFormValid) return;

    setSubmittingStore(true);
    try {
      await api.admin.createStore({
        name: newStoreName,
        email: newStoreEmail,
        address: newStoreAddress,
        ownerId: newStoreOwnerId || null,
      });
      addToast("Store created successfully!");
      setShowAddStoreModal(false);
      setNewStoreName("");
      setNewStoreEmail("");
      setNewStoreAddress("");
      setNewStoreOwnerId("");
      fetchStores();
      fetchStats();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmittingStore(false);
    }
  };

  // Find store owners to select when creating store
  const storeOwners = users.filter((u) => u.role === "STORE_OWNER");

  return (
    <div className="container">
      {/* Top Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          System Administrator Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Platform oversight, store management, and user governance
        </p>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-users">
            <Users size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-stores">
            <Store size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.totalStores}</div>
            <div className="stat-label">Registered Stores</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-ratings">
            <Star size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.totalRatings}</div>
            <div className="stat-label">Submitted Ratings</div>
          </div>
        </div>
      </div>

      {/* Tabs & Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div className="nav-tabs" style={{ marginBottom: 0 }}>
          <button
            className={`tab-btn ${activeTab === "stores" ? "active" : ""}`}
            onClick={() => setActiveTab("stores")}
          >
            Stores Directory ({stores.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users Directory ({users.length})
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-secondary" onClick={() => setShowAddStoreModal(true)}>
            <Plus size={16} /> Add Store
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* STORES TAB */}
      {activeTab === "stores" && (
        <>
          <div className="toolbar" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Quick search stores by name, email, or address..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className={`btn ${showStoreFilters ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setShowStoreFilters(!showStoreFilters)}
                style={{ fontSize: "0.85rem", padding: "0.55rem 0.95rem" }}
              >
                <Filter size={15} /> Filters
              </button>

              {(storeNameFilter || storeEmailFilter || storeAddressFilter) && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setStoreNameFilter("");
                    setStoreEmailFilter("");
                    setStoreAddressFilter("");
                  }}
                  style={{ fontSize: "0.8rem", padding: "0.5rem 0.8rem" }}
                >
                  <X size={14} /> Clear Filters
                </button>
              )}
            </div>

            {showStoreFilters && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                    Filter by Store Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. FreshMart"
                    value={storeNameFilter}
                    onChange={(e) => setStoreNameFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                    Filter by Store Email
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. contact@"
                    value={storeEmailFilter}
                    onChange={(e) => setStoreEmailFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                    Filter by Store Address
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Commercial Blvd"
                    value={storeAddressFilter}
                    onChange={(e) => setStoreAddressFilter(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="table-wrapper">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleStoreSort("name")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        Store Name <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleStoreSort("email")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        Email <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleStoreSort("address")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        Address <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleStoreSort("rating")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        Overall Rating <ArrowUpDown size={13} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                        No stores found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    stores.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td style={{ color: "var(--text-muted)" }}>{s.email}</td>
                        <td style={{ maxWidth: "280px" }}>{s.address}</td>
                        <td>
                          <StarRating value={s.rating} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <>
          <div className="toolbar" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Quick search users by name, email, or address..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <select
                  className="form-select"
                  style={{ width: "auto" }}
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>

              <button
                type="button"
                className={`btn ${showUserFilters ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setShowUserFilters(!showUserFilters)}
                style={{ fontSize: "0.85rem", padding: "0.55rem 0.95rem" }}
              >
                <Filter size={15} /> Filters
              </button>

              {(userNameFilter || userEmailFilter || userAddressFilter || userRoleFilter !== "ALL") && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setUserNameFilter("");
                    setUserEmailFilter("");
                    setUserAddressFilter("");
                    setUserRoleFilter("ALL");
                  }}
                  style={{ fontSize: "0.8rem", padding: "0.5rem 0.8rem" }}
                >
                  <X size={14} /> Clear Filters
                </button>
              )}
            </div>

            {showUserFilters && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                    Filter by Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Paras"
                    value={userNameFilter}
                    onChange={(e) => setUserNameFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                    Filter by Email
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. user@example"
                    value={userEmailFilter}
                    onChange={(e) => setUserEmailFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                    Filter by Address
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Greenfield"
                    value={userAddressFilter}
                    onChange={(e) => setUserAddressFilter(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="table-wrapper">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleUserSort("name")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        Name <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleUserSort("email")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        Email <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleUserSort("address")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        Address <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleUserSort("role")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        Role <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleUserSort("rating")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        Store Owner Rating <ArrowUpDown size={13} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                        <td style={{ maxWidth: "260px" }}>{u.address}</td>
                        <td>
                          <span
                            className={`role-tag ${
                              u.role === "ADMIN"
                                ? "admin"
                                : u.role === "STORE_OWNER"
                                ? "store_owner"
                                : "user"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.role === "STORE_OWNER" ? (
                            u.rating !== null ? (
                              <div>
                                <StarRating value={u.rating} />
                                {u.storeName && (
                                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                                    {u.storeName}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: "#64748b", fontSize: "0.85rem" }}>No Store Linked</span>
                            )
                          ) : (
                            <span style={{ color: "#64748b" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Create New User</span>
              <button
                onClick={() => setShowAddUserModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <div className="form-label">
                    <span>Full Name</span>
                    <span className="char-counter">{newUserName.length}/60 (min 20)</span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter full name (20 - 60 chars)"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                  />
                  {newUserName.length > 0 && !isUserNameValid && (
                    <div className="input-hint error">Must be 20 to 60 characters.</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                  >
                    <option value="USER">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <div className="form-label">
                    <span>Address</span>
                    <span className="char-counter">{newUserAddress.length}/400</span>
                  </div>
                  <textarea
                    className="form-textarea"
                    placeholder="Full residential or business address (max 400 chars)"
                    rows={2}
                    value={newUserAddress}
                    onChange={(e) => setNewUserAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temporary Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter secure initial password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Validation checklist */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.4)",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
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
                      color: isUserPasswordLen ? "#34d399" : "#94a3b8",
                    }}
                  >
                    {isUserPasswordLen ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span>8 to 16 characters</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      color: isUserPasswordUpper ? "#34d399" : "#94a3b8",
                    }}
                  >
                    {isUserPasswordUpper ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span>At least 1 uppercase letter (A-Z)</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      color: isUserPasswordSpecial ? "#34d399" : "#94a3b8",
                    }}
                  >
                    {isUserPasswordSpecial ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span>At least 1 special character (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isAddUserFormValid || submittingUser}
                >
                  {submittingUser ? "Creating..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STORE MODAL */}
      {showAddStoreModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Register New Store</span>
              <button
                onClick={() => setShowAddStoreModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateStore}>
              <div className="modal-body">
                <div className="form-group">
                  <div className="form-label">
                    <span>Store Name</span>
                    <span className="char-counter">{newStoreName.length}/60 (min 20)</span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Metro Electronics Superstore"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    required
                  />
                  {newStoreName.length > 0 && !isStoreNameValid && (
                    <div className="input-hint error">Must be 20 to 60 characters.</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Store Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="contact@storename.com"
                    value={newStoreEmail}
                    onChange={(e) => setNewStoreEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="form-label">
                    <span>Store Address</span>
                    <span className="char-counter">{newStoreAddress.length}/400</span>
                  </div>
                  <textarea
                    className="form-textarea"
                    placeholder="Physical store address (max 400 characters)"
                    rows={2}
                    value={newStoreAddress}
                    onChange={(e) => setNewStoreAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Store Owner (Optional)</label>
                  <select
                    className="form-select"
                    value={newStoreOwnerId}
                    onChange={(e) => setNewStoreOwnerId(e.target.value)}
                  >
                    <option value="">None (Unassigned)</option>
                    {storeOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddStoreModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isAddStoreFormValid || submittingStore}
                >
                  {submittingStore ? "Creating..." : "Save Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
