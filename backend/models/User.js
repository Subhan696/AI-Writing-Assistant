const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // All users now have full access
  isPro: {
    type: Boolean,
    default: true, // All users are now effectively 'Pro'
  },
  // Removed usage tracking fields as they're no longer needed
});

module.exports = mongoose.model('User', UserSchema);