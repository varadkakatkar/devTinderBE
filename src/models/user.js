const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // age: {
    //     type: Number,
    //     required: true
    // },
    // gender: {
    //     type: String,
    //     required: true
    // },
    // location: {
    //     type: String,
    //     required: true
    // },
    // profilePicture: {
    //     type: String,
    //     required: true
    // },
  
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;

