const prisma = require("../prisma");
const { validateRating } = require("../utils/validators");

// POST /api/ratings
// Submit or modify rating (1 to 5) for a store by an authenticated user
async function submitOrUpdateRating(req, res) {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    if (!storeId) {
      return res.status(400).json({ message: "storeId is required." });
    }

    if (!validateRating(rating)) {
      return res.status(400).json({
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    // Verify that store exists
    const store = await prisma.store.findUnique({
      where: { id: Number(storeId) },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    // Upsert rating (create or update if already submitted)
    const savedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: Number(userId),
          storeId: Number(storeId),
        },
      },
      update: {
        rating: Number(rating),
      },
      create: {
        userId: Number(userId),
        storeId: Number(storeId),
        rating: Number(rating),
      },
    });

    // Recompute store average
    const allRatings = await prisma.rating.findMany({
      where: { storeId: Number(storeId) },
    });

    const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const overallRating = Number((sum / allRatings.length).toFixed(1));

    return res.json({
      message: "Rating submitted successfully.",
      rating: savedRating.rating,
      overallRating,
      totalRatings: allRatings.length,
    });
  } catch (error) {
    console.error("Submit rating error:", error);
    return res.status(500).json({ message: "Server error while submitting rating." });
  }
}

module.exports = {
  submitOrUpdateRating,
};
