const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  age: { type: Number },
  mobile: { type: String },
  sex: { type: String, enum: ['male', 'female', 'other', ''] },
});

module.exports = mongoose.model('User', userSchema);
