/**
 * Mark connection requests as accepted so GET /user/connections returns people.
 *
 * Usage:
 *   node scripts/accept-connection-requests.js <userObjectId>
 *   node scripts/accept-connection-requests.js <userObjectId> --dry-run
 *
 * Updates every document with status "interested" where the user is fromUserId OR toUserId.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const ConnectionRequestModel = require("../src/models/connectionRequest");

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const idArg = args.find((a) => a !== "--dry-run");
  return { userId: idArg, dryRun };
}

async function main() {
  const { userId, dryRun } = parseArgs();
  if (!userId) {
    console.error(
      "Missing user id.\nExample: node scripts/accept-connection-requests.js 69aeaa5e3c818d1cb09a3bf5",
    );
    process.exit(1);
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error("Invalid ObjectId:", userId);
    process.exit(1);
  }
  if (!process.env.DB_URL) {
    throw new Error("DB_URL missing in .env");
  }

  await mongoose.connect(process.env.DB_URL);
  const uid = new mongoose.Types.ObjectId(userId);

  const filter = {
    status: "interested",
    $or: [{ fromUserId: uid }, { toUserId: uid }],
  };

  const toUpdate = await ConnectionRequestModel.find(filter)
    .select("_id fromUserId toUserId status")
    .lean();

  console.log("Matching documents:", toUpdate.length);
  toUpdate.forEach((d) => {
    console.log(
      `  ${d._id}  ${d.fromUserId} -> ${d.toUserId}  (${d.status})`,
    );
  });

  if (dryRun) {
    console.log("--dry-run: no writes performed.");
    await mongoose.disconnect();
    return;
  }

  const result = await ConnectionRequestModel.updateMany(filter, {
    $set: { status: "accepted" },
  });
  console.log("Updated:", result.modifiedCount, "matched:", result.matchedCount);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
