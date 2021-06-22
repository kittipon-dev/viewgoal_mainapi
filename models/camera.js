const { Int32 } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const cameraSchema = new Schema({
  user_id: Number,
  title: String,
  url: String,
  location: Object,
  namecity: String,
  timeon: Object,
  status: Boolean,
  view: Number,
  like: Number,
  dID: String,
  subject: String
})
const cameraModel = mongoose.model('camera', cameraSchema)
module.exports = cameraModel