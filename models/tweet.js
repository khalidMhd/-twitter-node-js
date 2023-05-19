const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tweetSchema = new Schema({
  isTweet: {type: Boolean, default: true},
  content: { type: String, trim: true, default: null },
  imageURL: { type: String, trim: true, default: null },
  postedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reTweet: { type: Schema.Types.ObjectId, ref: "Tweet", default: null },
  poll: { type: Schema.Types.ObjectId, ref: "Poll", default: null },
  reTweetCount: [{ type: Schema.Types.ObjectId, ref: "User" }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      text: String,
      postedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
  isComment: {type: Boolean, default: true},
  isActive: {type: Boolean, default: true},
  scheduleAt: {type: String},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

exports.tweetModel = mongoose.model("Tweet", tweetSchema);
