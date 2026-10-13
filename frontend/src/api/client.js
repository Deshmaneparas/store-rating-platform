const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("roxiler_token");
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data && data.message ? data.message : "Request failed";
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    signup: (userData) => request("/auth/signup", { method: "POST", body: JSON.stringify(userData) }),
    getMe: () => request("/auth/me"),
    updatePassword: (passwords) => request("/auth/update-password", { method: "PUT", body: JSON.stringify(passwords) }),
  },
  admin: {
    getStats: () => request("/admin/dashboard-stats"),
    getUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/users?${query}`);
    },
    createUser: (userData) => request("/admin/users", { method: "POST", body: JSON.stringify(userData) }),
    getStores: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/stores?${query}`);
    },
    createStore: (storeData) => request("/admin/stores", { method: "POST", body: JSON.stringify(storeData) }),
  },
  stores: {
    getStores: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/stores?${query}`);
    },
    getOwnerDashboard: () => request("/stores/owner-dashboard"),
  },
  ratings: {
    submitRating: (ratingData) => request("/ratings", { method: "POST", body: JSON.stringify(ratingData) }),
  },
};
