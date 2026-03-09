const express = require("express");
const requestRouter = express.Router();
const UserModel = require("../models/user");
// const ConnectionRequestModel = require("../models/connectionRequest");

requestRouter.post("sendConnectionRequest", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found or Invalid userId" });
    }
    
  } catch (error) {
    console.error("Error in request/send/interested:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = requestRouter;
