const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const JWT_SECRET = process.env.JWT_SECRET || "roxiler_secret_jwt_key_default";

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, address: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found or deleted" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

// Optional authentication: attaches user if token is present and valid, otherwise proceeds as guest
async function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, address: true, role: true },
    });
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore error for optional auth
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  JWT_SECRET,
};
