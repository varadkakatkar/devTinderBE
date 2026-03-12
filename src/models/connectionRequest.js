const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // this is the reference to the User model
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // this is the reference to the User model
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "{VALUE} not supported, invalid status",
      },
      required: true,
    },
  },
  { timestamps: true },
);

connectionRequestSchema.pre("save", async function () {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You cannot send request to yourself");
  }
});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// const ConnectionRequest
const connectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

module.exports = connectionRequestModel;
