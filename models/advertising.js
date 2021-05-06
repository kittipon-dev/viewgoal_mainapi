const { Int32 } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const advertisingSchema = new Schema({
  date: String,
  ref: String,
  topic: String,
  urlimg: String,
  txt: String,
  use_point: Number
})
const advertisingModel = mongoose.model('advertising', advertisingSchema)
module.exports = advertisingModel