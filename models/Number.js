const mongoose = require('mongoose');

const numberSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Number', numberSchema);
