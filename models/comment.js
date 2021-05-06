const { Int32 } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const commentSchema = new Schema({
  idcam: String,
  user_id:Number,
  comment: String
})
const commentModel = mongoose.model('comment', commentSchema)
module.exports = commentModel