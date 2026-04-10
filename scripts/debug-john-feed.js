require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const UserModel = require("../src/models/user");
const ConnectionRequestModel = require("../src/models/connectionRequest");
const { USER_SAFE_DATA } = require("../src/utils/constants");

const JOHN_ID = "69aeaa5e3c818d1cb09a3bf5";

async function main() {
  await mongoose.connect(process.env.DB_URL);
  const johnId = new mongoose.Types.ObjectId(JOHN_ID);
  const loggedInUser = await UserModel.findById(johnId);
  console.log("John exists:", !!loggedInUser, loggedInUser?.emailId);

  const connections = await ConnectionRequestModel.find({
    $or: [{ fromUserId: johnId }, { toUserId: johnId }],
  }).select("fromUserId toUserId");

  console.log("Connection rows involving John:", connections.length);
  const hide = new Set();
  connections.forEach((r) => {
    hide.add(r.fromUserId.toString());
    hide.add(r.toUserId.toString());
  });
  console.log("hideUsersFromFeed size:", hide.size, [...hide]);

  const hideArr = Array.from(hide);
  const q = {
    $and: [
      { _id: { $nin: hideArr } },
      { _id: { $ne: loggedInUser._id } },
    ],
  };
  const users = await UserModel.find(q).select(USER_SAFE_DATA).limit(10);
  console.log("Feed query result count:", users.length);
  users.forEach((u) => console.log(" -", u.emailId || u.firstName));

  const totalUsers = await UserModel.countDocuments({});
  console.log("Total users in DB:", totalUsers);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
