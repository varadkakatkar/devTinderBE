const mongoose = require("mongoose");
const { DB_URL } = require("../utils/constants");

const connectDB = async () => {
  if (!DB_URL) {
    throw new Error("DB_URL is not defined. Set it in .env or provide DB_USER, DB_PASSWORD, DB_HOST.");
  }
  await mongoose.connect(DB_URL);
};

module.exports = connectDB;
