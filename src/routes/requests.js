const express = require("express");
const requestRouter = express.Router();
const UserModel = require("../models/user");
const ConnectionRequestModel = require("../models/connectionRequest");
const { verifyToken } = require("../middleware/auth");

requestRouter.post(
  "/request/send/:status/:toUserId",
  verifyToken,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // Check if toUser exists
      const toUser = await UserModel.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ error: "To user not found" });
      }

      // Check if fromUser exists
      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // Check if the request already exists
      const existingRequest = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingRequest) {
        return res.status(400).json({ error: "Request already exists" });
      }

      const connectoionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectoionRequest.save();
      res.status(200).json({
        message: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
        data,
      });
    } catch (error) {
      console.error("Error in request/send:", error.message);
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = requestRouter;
