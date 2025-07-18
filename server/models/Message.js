// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", default: null },
    content: { type: String, required: false },
    imageUrl: { type: String, required: false }, // ✅ Add this
    type: { type: String, enum: ["text", "image"], default: "text" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
