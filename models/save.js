const { Int32 } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const saveSchema = new Schema({
  idcam: String,
  user_id: Number,
  title: String,
  time: String
})
const saveModel = mongoose.model('save', saveSchema)
module.exports = saveModel