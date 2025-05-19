// models/Redirect.js
const mongoose = require('mongoose');

const redirectSchema = new mongoose.Schema({
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model('Redirect', redirectSchema);
