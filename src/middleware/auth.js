const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const UserModel = require("../models/user");
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined. Set it in .env");
}

const adminAuth = async (req, res, next) => {
  console.log("Admin auth getting is checked");
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(401)
      .json({ error: "Unauthorized Token is not present, please login again" });
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;
  req.user = await UserModel.findById(decoded.userId); // this is the user object
  console.log("User:-----------------------------------", req.user);
  console.log("User ID:-----------------------------------", req.userId);
  if (!req.user) {
    return res
      .status(401)
      .json({ error: "User not found, please login again" });
  }
  next();
};

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  console.log("User auth getting is checked");
  if (!token) {
    return res
      .status(401)
      .json({ error: "Unauthorized Token is not present, please login again" });
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;
  req.user = await UserModel.findById(decoded.userId); // this is the user object
  console.log("User:-----------------------------------", req.user);
  console.log("User ID:-----------------------------------", req.userId);
  if (!req.user) {
    return res
      .status(401)
      .json({ error: "User not found, please login again" });
  }
  next();
};

function getTokenFromRequest(req) {
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  const auth = req.headers.authorization;
  if (auth && typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

const verifyToken = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized Token is not present" });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = await UserModel.findById(decoded.userId); // this is the user object
    console.log("User:-----------------------------------", req.user);
    console.log("User ID:-----------------------------------", req.userId);
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }
    next();
  } catch (error) {
    console.error("Error in verifyToken:", error.message);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  adminAuth,
  userAuth,
  verifyToken,
};
