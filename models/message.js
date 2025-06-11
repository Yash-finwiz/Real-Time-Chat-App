const mongoose = require("mongoose");

// Message Schema
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
}, 
{ timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
