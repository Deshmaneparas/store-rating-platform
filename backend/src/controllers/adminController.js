const bcrypt = require("bcryptjs");
const prisma = require("../prisma");
const {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
} = require("../utils/validators");

// GET /api/admin/dashboard-stats
async function getDashboardStats(req, res) {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return res.json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: "Server error fetching stats" });
  }
}

// POST /api/admin/users
async function createUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    if (!validateName(name)) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters long.",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (!validateAddress(address)) {
      return res.status(400).json({
        message: "Address is required and must not exceed 400 characters.",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters long and include at least one uppercase letter and one special character.",
      });
    }

    const validRoles = ["ADMIN", "USER", "STORE_OWNER"];
    const assignedRole = role && validRoles.includes(role.toUpperCase())
      ? role.toUpperCase()
      : "USER";

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        address: address.trim(),
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ message: "Server error creating user" });
  }
}

// POST /api/admin/stores
async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!validateName(name)) {
      return res.status(400).json({
        message: "Store name must be between 20 and 60 characters long.",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address for the store." });
    }

    if (!validateAddress(address)) {
      return res.status(400).json({
        message: "Store address is required and must not exceed 400 characters.",
      });
    }

    let parsedOwnerId = null;
    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: Number(ownerId) },
      });
      if (!owner) {
        return res.status(400).json({ message: "Specified owner user does not exist." });
      }
      parsedOwnerId = owner.id;
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address.trim(),
        ownerId: parsedOwnerId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      message: "Store created successfully",
      store,
    });
  } catch (error) {
    console.error("Create store error:", error);
    return res.status(500).json({ message: "Server error creating store" });
  }
}

// GET /api/admin/users
// Supports filtering by name, email, address, role
// Supports sorting by name, email, address, role, rating
async function getUsers(req, res) {
  try {
    const { search, name, email, address, role, sortBy = "name", sortOrder = "asc" } = req.query;

    const where = {};

    const andConditions = [];

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search.trim(), mode: "insensitive" } },
          { email: { contains: search.trim(), mode: "insensitive" } },
          { address: { contains: search.trim(), mode: "insensitive" } },
        ],
      });
    }

    if (name) {
      andConditions.push({ name: { contains: name.trim(), mode: "insensitive" } });
    }
    if (email) {
      andConditions.push({ email: { contains: email.trim(), mode: "insensitive" } });
    }
    if (address) {
      andConditions.push({ address: { contains: address.trim(), mode: "insensitive" } });
    }
    if (role && role !== "ALL") {
      andConditions.push({ role: role.toUpperCase() });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { rating: true },
            },
          },
        },
      },
    });

    // Compute store rating for store owners
    const formattedUsers = users.map((u) => {
      let storeRating = null;
      let storeName = null;
      if (u.role === "STORE_OWNER" && u.ownedStores.length > 0) {
        const store = u.ownedStores[0];
        storeName = store.name;
        if (store.ratings.length > 0) {
          const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
          storeRating = Number((sum / store.ratings.length).toFixed(1));
        } else {
          storeRating = 0;
        }
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        createdAt: u.createdAt,
        storeName,
        rating: storeRating,
      };
    });

    // In-memory sorting to accommodate dynamic computed fields like rating
    const orderMultiplier = sortOrder.toLowerCase() === "desc" ? -1 : 1;
    formattedUsers.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";

      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * orderMultiplier;
      }
      return String(valA).localeCompare(String(valB)) * orderMultiplier;
    });

    return res.json(formattedUsers);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ message: "Server error fetching users" });
  }
}

// GET /api/admin/stores
// Supports filtering by name, email, address
// Supports sorting by name, email, address, rating
async function getStores(req, res) {
  try {
    const { search, name, email, address, sortBy = "name", sortOrder = "asc" } = req.query;

    const where = {};
    const andConditions = [];

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search.trim(), mode: "insensitive" } },
          { email: { contains: search.trim(), mode: "insensitive" } },
          { address: { contains: search.trim(), mode: "insensitive" } },
        ],
      });
    }

    if (name) {
      andConditions.push({ name: { contains: name.trim(), mode: "insensitive" } });
    }
    if (email) {
      andConditions.push({ email: { contains: email.trim(), mode: "insensitive" } });
    }
    if (address) {
      andConditions.push({ address: { contains: address.trim(), mode: "insensitive" } });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
      },
    });

    const formattedStores = stores.map((s) => {
      let overallRating = 0;
      if (s.ratings.length > 0) {
        const sum = s.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        overallRating = Number((sum / s.ratings.length).toFixed(1));
      }

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        owner: s.owner,
        totalRatings: s.ratings.length,
        rating: overallRating,
      };
    });

    const orderMultiplier = sortOrder.toLowerCase() === "desc" ? -1 : 1;
    formattedStores.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";

      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * orderMultiplier;
      }
      return String(valA).localeCompare(String(valB)) * orderMultiplier;
    });

    return res.json(formattedStores);
  } catch (error) {
    console.error("Get admin stores error:", error);
    return res.status(500).json({ message: "Server error fetching stores" });
  }
}

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores,
};
