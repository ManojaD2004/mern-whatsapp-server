const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  message: String,
  name: String,
  dp: String,
  timestamp: String,
  channelId: String,
  memberId: String,
});

const channelSchema = mongoose.Schema({
  channelName: String,
  channelId: String,
  channelImageUrl: String, 
});

const memberSchema = mongoose.Schema({
  memberId: String,
  memberName: String,
  memberImg: String,
  channels: Array,
});

module.exports = {
  Messages: mongoose.model("Messages", messageSchema),
  Channels: mongoose.model("Channels", channelSchema),
  Members: mongoose.model("Members", memberSchema),
};
