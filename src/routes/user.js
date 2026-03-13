const express = require("express");
const userRouter = express.Router();
const UserModel = require("../models/user");
const ConnectionRequestModel = require("../models/connectionRequest");
const { verifyToken } = require("../middleware/auth");
const { USER_SAFE_DATA } = require("../utils/constants");

userRouter.get("/user/requests/received", verifyToken, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const requests = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", "firstName lastName photoUrl emailId");
    res
      .status(200)
      .json({ message: "Requests fetched successfully", data: requests });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});


userRouter.get("/user/connections", verifyToken, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connections = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" },
            ],
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);

        const data = connections.map(connection => {
            const otherUser = connection.fromUserId._id.equals(loggedInUser._id)
                ? connection.toUserId
                : connection.fromUserId;
            return {
                _id: otherUser._id,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                photoUrl: otherUser.photoUrl,
                emailId: otherUser.emailId,
                about: otherUser.about,
                skills: otherUser.skills,
                age: otherUser.age,
                gender: otherUser.gender,
            };
        });
        res.status(200).json({ message: "Connections fetched successfully", data: data });

        
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


module.exports = userRouter;
