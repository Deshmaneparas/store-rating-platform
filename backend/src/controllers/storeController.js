const prisma = require("../prisma");

// GET /api/stores
// Public / Normal user store listing with search by name and address
// If user is authenticated, also includes userSubmittedRating
async function getStores(req, res) {
  try {
    const { search, name, address, sortBy = "name", sortOrder = "asc" } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { address: { contains: search.trim(), mode: "insensitive" } },
      ];
    } else {
      if (name) {
        where.name = { contains: name.trim(), mode: "insensitive" };
      }
      if (address) {
        where.address = { contains: address.trim(), mode: "insensitive" };
      }
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
          },
        },
      },
    });

    const formattedStores = stores.map((s) => {
      let overallRating = 0;
      if (s.ratings.length > 0) {
        const sum = s.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        overallRating = Number((sum / s.ratings.length).toFixed(1));
      }

      let userRating = null;
      if (currentUserId) {
        const found = s.ratings.find((r) => r.userId === currentUserId);
        if (found) {
          userRating = found.rating;
        }
      }

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        overallRating,
        totalRatings: s.ratings.length,
        userSubmittedRating: userRating,
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
    console.error("Get stores error:", error);
    return res.status(500).json({ message: "Server error fetching stores" });
  }
}

// GET /api/stores/owner-dashboard (For STORE_OWNER role)
async function getStoreOwnerDashboard(req, res) {
  try {
    const ownerId = req.user.id;

    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        message: "No store found assigned to your account. Please contact an Administrator.",
      });
    }

    let overallRating = 0;
    if (store.ratings.length > 0) {
      const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      overallRating = Number((sum / store.ratings.length).toFixed(1));
    }

    const ratingUsers = store.ratings.map((r) => ({
      ratingId: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: r.user,
    }));

    return res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        totalRatings: store.ratings.length,
      },
      ratings: ratingUsers,
    });
  } catch (error) {
    console.error("Store owner dashboard error:", error);
    return res.status(500).json({ message: "Server error fetching store dashboard" });
  }
}

module.exports = {
  getStores,
  getStoreOwnerDashboard,
};
