const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const { JWT_SECRET } = require("../middleware/auth");
const {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
} = require("../utils/validators");

// POST /api/auth/signup (Normal user registration)
async function signup(req, res) {
  try {
    const { name, email, address, password } = req.body;

    // Form Validations
    if (!validateName(name)) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters long.",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
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

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address.trim(),
        password: hashedPassword,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
}

// POST /api/auth/login (Unified login system for all roles)
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        ownedStores: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const ownedStore = user.ownedStores.length > 0 ? user.ownedStores[0] : null;

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        store: ownedStore ? { id: ownedStore.id, name: ownedStore.name } : null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
}

// PUT /api/auth/update-password
async function updatePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required." });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be 8-16 characters long and include at least one uppercase letter and one special character.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({ message: "Server error while updating password" });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        ownedStores: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const ownedStore = user.ownedStores.length > 0 ? user.ownedStores[0] : null;

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        store: ownedStore ? { id: ownedStore.id, name: ownedStore.name } : null,
      },
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  signup,
  login,
  updatePassword,
  getMe,
};
