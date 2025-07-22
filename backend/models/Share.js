const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d', // Automatically delete after 7 days
  },
});

module.exports = mongoose.model('Share', ShareSchema);
