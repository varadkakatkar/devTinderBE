const mongoose = require("mongoose");
const { GENDER_OPTIONS } = require("../utils/constants");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: 3,
      maxLength: 20,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!GENDER_OPTIONS.includes(value)) {
          throw new Error("Gender must be male, female or other");
        }
      },
    },
    photoUrl: {
      type: String,
    },
    about: {
      type: String,
      default: "This is default about for user",
    },
    skills: {
      type: [String],
    },

    // location: {
    //     type: String,
    //     required: true
    // },
    // profilePicture: {
    //     type: String,
    //     required: true
    // },
  },
  { timestamps: true },
);

userSchema.methods.getJWT = async function () {
  console.log("this ", this);
  const user = this;

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  return token;
};



userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  );

  return isPasswordValid;
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
