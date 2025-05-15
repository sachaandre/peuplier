const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const asyncHandler = require("express-async-handler");

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
    },
    pword: String,
    status: {
        type: String,
        enum: ["User", "Admin"],
        default: "User"
    }
});

module.exports = mongoose.model("User", UserSchema);
