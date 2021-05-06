const { Int32 } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const loginSchema = new Schema({
  user_id: Number,
  username: String,
  password: String
})
const loginModel = mongoose.model('login', loginSchema)
module.exports = loginModel