const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  email: String,
});

module.exports = mongoose.model("Messages", messageSchema);
