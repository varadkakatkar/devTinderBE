/**
 * Inserts users from data/dummy-feed.json (password required by schema).
 * Idempotent: skips emails that already exist.
 *
 * Optional: SEED_DUMMY_PASSWORD in .env (default: DummySeed123!)
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserModel = require("../src/models/user");

const DUMMY_FEED_PATH = path.join(__dirname, "..", "data", "dummy-feed.json");
const DEFAULT_PLAIN_PASSWORD =
  process.env.SEED_DUMMY_PASSWORD || "DummySeed123!";

async function main() {
  if (!process.env.DB_URL) {
    throw new Error("DB_URL missing in .env");
  }

  const raw = fs.readFileSync(DUMMY_FEED_PATH, "utf8");
  const { data } = JSON.parse(raw);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("dummy-feed.json has no data[]");
  }

  await mongoose.connect(process.env.DB_URL);
  const passwordHash = await bcrypt.hash(DEFAULT_PLAIN_PASSWORD, 10);

  let created = 0;
  let skipped = 0;

  for (const row of data) {
    const emailId = String(row.emailId).toLowerCase().trim();
    const exists = await UserModel.findOne({ emailId });
    if (exists) {
      console.log("Skip (exists):", emailId);
      skipped += 1;
      continue;
    }

    const doc = {
      firstName: row.firstName,
      lastName: row.lastName ?? undefined,
      emailId,
      password: passwordHash,
      age: row.age,
      gender: row.gender,
      photoUrl: row.photoUrl,
      about: row.about,
      skills: Array.isArray(row.skills) ? row.skills : [],
    };

    if (row._id && mongoose.Types.ObjectId.isValid(row._id)) {
      doc._id = new mongoose.Types.ObjectId(row._id);
    }

    await UserModel.create(doc);
    console.log("Created:", emailId, doc._id?.toString() ?? "");
    created += 1;
  }

  console.log("\nDone. created:", created, "skipped:", skipped);
  console.log(
    "Login for any new dummy user: password =",
    DEFAULT_PLAIN_PASSWORD === process.env.SEED_DUMMY_PASSWORD
      ? "(from SEED_DUMMY_PASSWORD)"
      : DEFAULT_PLAIN_PASSWORD,
  );

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
