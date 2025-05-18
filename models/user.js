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

UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/utilisateurs/${this._id}`;
});

UserSchema.statics = {
    emailUsed(email){
        return this.findOne({email: email}).then(
            result => {
                console.log(result)
                if(result) throw new Error("Email déjà utilisé")
            }
        )
    },

    usernameUsed(username){
        return this.findOne({name: username}).then(
            result => {
                console.log(result)
                if(result) throw new Error("Username déjà utilisé")
            }
        )
    }
}

module.exports = mongoose.model("User", UserSchema);
