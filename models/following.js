const mongoose = require('mongoose')
const { startSession } = require('./advertising')
const Schema = mongoose.Schema
const followingSchema = new Schema({
  user_id: Number,
  f_user_id: Number,
  name: String,
  time: String
})
const followingModel = mongoose.model('following', followingSchema)
module.exports = followingModel