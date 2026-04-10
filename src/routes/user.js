const express = require("express");
const mongoose = require("mongoose");
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
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connections.map((connection) => {
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
    res
      .status(200)
      .json({ message: "Connections fetched successfully", data: data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

userRouter.get("/feed", verifyToken, async (req, res) => {
  try {
    // User should see all user cards except
    // 0. His own profile
    // 1. His connections
    // 2. Ignored Users
    // 3. Already sent connection requests
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    
    if(limit > 50){
      limit = 50;
    }

    const skip = (page - 1) * limit;
    const loggedInUser = req.user;

    // connection requests (sent + received );
    const connections = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();

    connections.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    // `{ _id: { $nin: [] } }` matches no documents in MongoDB.
    const hideIds = [...hideUsersFromFeed].map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    const feedFilter = {
      $and: [{ _id: { $ne: loggedInUser._id } }],
    };
    if (hideIds.length > 0) {
      feedFilter.$and.push({ _id: { $nin: hideIds } });
    }

    const users = await UserModel.find(feedFilter)
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({ message: "Users fetched successfully", data: users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = userRouter;
