const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  rollNumber: Number,
  password: Number,
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  }
});

module.exports = mongoose.model("User", UserSchema);
