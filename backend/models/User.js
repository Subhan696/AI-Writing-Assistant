const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  isPro: { type: Boolean, default: false },
  lastUsedDate: { type: Date, default: null },
  dailyUsageCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema); 