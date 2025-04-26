const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  phone: { type: String, default: "" }, 
  isAdmin: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  profileImage: { type: String, default: '' },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: [] }] 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
