const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, minlength: 5, trim: true },
  imageURL: { type: String, trim: true, default: null },
  fcmToken: { type: String, default: "" },
  cellNo: { type: String, trim: true, default: "" },
  lastLoginIp: { type: String, trim: true, default: "" },
  location: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  device: { type: String, trim: true, default: "" },
  phone: { type: String, trim: true, default: "" },
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  education: { type: String, trim: true, default: "" },
  accStatus: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  resetToken: { type: String, default: "" },
  bio: { type: String, default: "" },
  expireToken: { type: Date },
  updatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

exports.userModel = mongoose.model("User", userSchema);
