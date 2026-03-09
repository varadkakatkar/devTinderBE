const express = require('express');
const profileRouter = express.Router();
const UserModel = require("../models/user");
const { verifyToken } = require("../middleware/auth");
const { profileEditData } = require("../utils/checkValidations");


profileRouter.get("/profile/view", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error in profile:", error.message);
    res.status(500).json({ error: error.message });
  }
});

profileRouter.patch("/profile/edit", verifyToken, async (req, res) => {
try {
  const isEditAllowed = profileEditData(req);
  if (!isEditAllowed) {
    throw new Error("Invalid fields");
  }
  const loggedInUser = req.user;
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      loggedInUser[key] = req.body[key];
    }
  });
  await loggedInUser.save();
  res.status(200).json({ message: "Profile updated successfully", loggedInUser });
} catch (error) {
  console.error("Error in profile/edit:", error.message);
  res.status(500).json({ error: error.message });
}
});
module.exports = profileRouter;
