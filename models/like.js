const { Int32 } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const likeSchema = new Schema({
  idcam: String,
  user_id:Number,
  time: String
})
const likeModel = mongoose.model('like', likeSchema)
module.exports = likeModel