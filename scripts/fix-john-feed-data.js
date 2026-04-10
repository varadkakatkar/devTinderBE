/**
 * One-off: make john.doe12@example.com see feed cards with current /feed code
 * (avoids MongoDB $nin: [] by ensuring at least one connection row for John).
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const UserModel = require("../src/models/user");
const ConnectionRequestModel = require("../src/models/connectionRequest");

const JOHN_ID = "69aeaa5e3c818d1cb09a3bf5";
const SEED_EMAIL = "seed.feed.bridge@devtinder.local";

async function main() {
  if (!process.env.DB_URL) {
    throw new Error("DB_URL missing in .env");
  }
  await mongoose.connect(process.env.DB_URL);
  const johnId = new mongoose.Types.ObjectId(JOHN_ID);

  const john = await UserModel.findById(johnId);
  if (!john) {
    throw new Error(`No user with _id ${JOHN_ID}`);
  }

  const del = await ConnectionRequestModel.deleteMany({
    $or: [{ fromUserId: johnId }, { toUserId: johnId }],
  });
  console.log("Removed connection requests involving John:", del.deletedCount);

  let seed = await UserModel.findOne({ emailId: SEED_EMAIL });
  if (!seed) {
    seed = await UserModel.create({
      firstName: "Feed",
      lastName: "Bridge",
      emailId: SEED_EMAIL,
      password:
        "$2b$10$fw9qAJ2ft2sWaHP7jxFb8.kPMVH.STeTbpMf/Ggol9/z/LQLbo.Ca",
      age: 22,
      gender: "other",
      about: "Seed user so feed $nin is non-empty (safe to delete after code fix).",
      skills: [],
      photoUrl:
        "https://cdn.vectorstock.com/i/500p/50/29/user-icon-male-person-symbol-profile-avatar-vector-20715029.jpg",
    });
    console.log("Created seed user:", seed._id.toString());
  } else {
    console.log("Seed user already exists:", seed._id.toString());
  }

  try {
    await ConnectionRequestModel.create({
      fromUserId: johnId,
      toUserId: seed._id,
      status: "interested",
    });
    console.log("Created John -> seed connection request.");
  } catch (e) {
    if (e.code === 11000) {
      console.log("John -> seed request already exists.");
    } else {
      throw e;
    }
  }

  const others = await UserModel.countDocuments({ _id: { $ne: johnId } });
  const visible = await UserModel.countDocuments({
    _id: { $nin: [johnId, seed._id] },
  });
  console.log("Total other users (excl. John):", others);
  console.log(
    "Users John can see in feed (excl. John + seed; per app logic):",
    visible,
  );

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
