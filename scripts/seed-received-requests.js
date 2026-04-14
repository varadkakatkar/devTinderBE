/**
 * Seed connection requests so GET /user/requests/received returns rows for a user.
 * That route only returns docs where you are toUserId and status is "interested".
 *
 * Usage:
 *   node scripts/seed-received-requests.js
 *   node scripts/seed-received-requests.js you@example.com
 *
 * Creates up to 2 "interested" requests from other users -> receiver (skips duplicates).
 * If the DB has no other users, creates minimal sender accounts (emails under @devtinder.seed).
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserModel = require("../src/models/user");
const ConnectionRequestModel = require("../src/models/connectionRequest");

const DEFAULT_RECEIVER_EMAIL =
  process.env.SEED_RECEIVER_EMAIL || "john.doe12@example.com";
const SEED_PASSWORD =
  process.env.SEED_DUMMY_PASSWORD || "DummySeed123!";
const WANT = 2;

async function ensureSenderUser(emailId, label) {
  let u = await UserModel.findOne({ emailId });
  if (u) return u;
  const password = await bcrypt.hash(SEED_PASSWORD, 10);
  u = await UserModel.create({
    firstName: label,
    lastName: "Seed",
    emailId,
    password,
    age: 22,
    gender: "other",
    about: "Auto-created for /user/requests/received seed data.",
    skills: [],
    photoUrl:
      "https://cdn.vectorstock.com/i/500p/50/29/user-icon-male-person-symbol-profile-avatar-vector-20715029.jpg",
  });
  console.log("Created sender user:", emailId, u._id.toString());
  return u;
}

async function main() {
  if (!process.env.DB_URL) {
    throw new Error("DB_URL missing in .env");
  }

  const receiverEmail = (
    process.argv[2] ||
    process.env.SEED_RECEIVER_EMAIL ||
    DEFAULT_RECEIVER_EMAIL
  )
    .toLowerCase()
    .trim();

  await mongoose.connect(process.env.DB_URL);

  const receiver = await UserModel.findOne({ emailId: receiverEmail });
  if (!receiver) {
    console.error(
      "Receiver not found for email:",
      receiverEmail,
      "\nCreate that user first or pass another email: node scripts/seed-received-requests.js other@email.com",
    );
    process.exit(1);
  }

  const existingSenders = await ConnectionRequestModel.find({
    toUserId: receiver._id,
    status: "interested",
  }).distinct("fromUserId");

  const excludeIds = [receiver._id, ...existingSenders];
  const pool = await UserModel.find({
    _id: { $nin: excludeIds },
  })
    .limit(WANT * 2)
    .select("_id emailId firstName");

  const senders = [];
  for (const u of pool) {
    if (senders.length >= WANT) break;
    senders.push(u);
  }

  let n = 0;
  while (senders.length < WANT) {
    n += 1;
    const email = `seed.received.sender${n}.${Date.now()}@devtinder.seed`;
    senders.push(await ensureSenderUser(email, `Req${n}`));
  }

  let created = 0;
  let skipped = 0;
  for (const sender of senders.slice(0, WANT)) {
    try {
      await ConnectionRequestModel.create({
        fromUserId: sender._id,
        toUserId: receiver._id,
        status: "interested",
      });
      console.log(
        "Interested request:",
        sender.emailId || sender._id,
        "->",
        receiverEmail,
      );
      created += 1;
    } catch (e) {
      if (e.code === 11000) {
        console.log("Skip duplicate:", sender._id.toString(), "->", receiverEmail);
        skipped += 1;
      } else {
        throw e;
      }
    }
  }

  const total = await ConnectionRequestModel.countDocuments({
    toUserId: receiver._id,
    status: "interested",
  });

  console.log("\nDone. new rows:", created, "skipped (dup):", skipped);
  console.log(
    "Total interested received for",
    receiverEmail + ":",
    total,
  );
  console.log(
    "Log in as that user and call GET /user/requests/received (password for new senders:",
    SEED_PASSWORD + ").",
  );

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
