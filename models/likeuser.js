const mongoose = require('mongoose')
const Schema = mongoose.Schema
const likeuserSchema = new Schema({
  user_id:Number,
  l_user_id:Number,
  time: String
})
const likeuserModel = mongoose.model('likeuser', likeuserSchema)
module.exports = likeuserModel