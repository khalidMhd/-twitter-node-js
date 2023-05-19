const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookmarkSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  tweet: { type: Schema.Types.ObjectId, ref: "Tweet" },
  createdAt: { type: Date, default: Date.now },
});

exports.bookmarkModel = mongoose.model("Bookmark", bookmarkSchema);
