require("dotenv").config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const APP_NAME = "devTinder";
const APP_VERSION = "1.0.0";

const DB_NAME = process.env.DB_NAME || "devTinder";
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const HOST = process.env.HOST || "http://localhost";
const DB_URL =
  process.env.DB_URL ||
  (DB_USER && DB_PASSWORD && DB_HOST
    ? `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`
    : null);

module.exports = {
  DB_URL,
  PORT,
  NODE_ENV,
  APP_NAME,
  APP_VERSION,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  HOST,
  GENDER_OPTIONS: ['male', 'female', 'other'],
  ALLOWED_UPDATE_FIELDS: ['firstName', 'lastName', 'password', 'age', 'gender', 'photoUrl', 'about', 'skills'],
};
