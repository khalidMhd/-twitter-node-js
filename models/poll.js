const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
  },
  optionsOne: {
    pollIndex: { type: Number, default: 0 },
    text: {
      type: String,
      default: null,
    },
    votes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  optionsTwo: {
    pollIndex: { type: Number, default: 1 },
    text: {
      type: String,
      default: null,
    },
    votes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  optionsThree: {
    pollIndex: { type: Number, default: 2 },

    text: {
      type: String,
      default: null,
    },
    votes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  optionsFour: {
    pollIndex: { type: Number, default: 3 },
    text: {
      type: String,
      default: null,
    },
    votes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  isActive: { type: Boolean, default: true },
  scheduleAt: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

exports.pollModel = mongoose.model("Poll", pollSchema);
