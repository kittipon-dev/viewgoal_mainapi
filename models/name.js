const mongoose = require('mongoose')
const Schema = mongoose.Schema
const nameSchema = new Schema({
  user_id:Number,
  nmae: String,
  time: String
})
const nameModel = mongoose.model('name', nameSchema)
module.exports = nameModel