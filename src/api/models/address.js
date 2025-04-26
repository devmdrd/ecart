const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  houseNameOrNo: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true }
});

module.exports = mongoose.model('Address', addressSchema);
