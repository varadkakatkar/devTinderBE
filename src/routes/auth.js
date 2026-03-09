const express = require("express");
const authRouter = express.Router();
const UserModel = require("../models/user");
const bcrypt = require("bcrypt");
const { checkSignupValidations } = require("../utils/checkValidations");

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await UserModel.findOne({ emailId: RegExp(emailId, "i") });
    if (!user) {
      return res.status(404).json({ error: "User not found or Invalid email" });
    }
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    // const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, { expiresIn: "1h" });
    const token = await user.getJWT();
    console.log("token ", token);
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      httpOnly: true,
    });
    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ error: error.message });
  }
});

authRouter.post("/signup", checkSignupValidations, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    const { firstName, lastName, emailId, password, age, gender, photoUrl } =
      req.body;

    const user = new UserModel({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      age,
      gender,
      photoUrl,
    });
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = authRouter;
