/**
 * Inspect connectionrequests for GET /user/connections behavior.
 *
 * Usage:
 *   node scripts/debug-connections-for-user.js <userObjectId>
 *
 * Prints: all rows involving the user (any status), then the exact API query (accepted only).
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const ConnectionRequestModel = require("../src/models/connectionRequest");

async function main() {
  const userId = process.argv[2];
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    console.error(
      "Pass a valid user ObjectId (the account you log in with).\nExample: node scripts/debug-connections-for-user.js 69aeaa5e3c818d1cb09a3bf5",
    );
    process.exit(1);
  }
  if (!process.env.DB_URL) {
    throw new Error("DB_URL missing in .env");
  }

  await mongoose.connect(process.env.DB_URL);
  const uri = process.env.DB_URL.replace(/\/\/([^:]+):[^@]+@/, "//$1:***@");
  console.log("Using DB_URL host (redacted):", uri.slice(0, 120) + (uri.length > 120 ? "..." : ""));
  console.log("Collection:", ConnectionRequestModel.collection.collectionName);

  const uid = new mongoose.Types.ObjectId(userId);

  const involved = await ConnectionRequestModel.find({
    $or: [{ fromUserId: uid }, { toUserId: uid }],
  })
    .select("fromUserId toUserId status")
    .lean();

  console.log("\nAll requests involving this user:", involved.length);
  const byStatus = {};
  involved.forEach((d) => {
    byStatus[d.status] = (byStatus[d.status] || 0) + 1;
  });
  console.log("By status:", byStatus);
  involved.forEach((d) =>
    console.log(`  ${d._id}  ${d.fromUserId} -> ${d.toUserId}  ${d.status}`),
  );

  const likeApi = await ConnectionRequestModel.find({
    $or: [
      { fromUserId: uid, status: "accepted" },
      { toUserId: uid, status: "accepted" },
    ],
  })
    .select("fromUserId toUserId status")
    .lean();

  console.log(
    "\nRows matching GET /user/connections query (accepted only):",
    likeApi.length,
  );
  likeApi.forEach((d) =>
    console.log(`  ${d._id}  ${d.fromUserId} -> ${d.toUserId}  ${d.status}`),
  );

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
