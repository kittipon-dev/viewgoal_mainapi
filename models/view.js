const { Int32 } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const viewSchema = new Schema({
  idcam: String,
  user_id:Number,
  time: String
})
const viewModel = mongoose.model('view', viewSchema)
module.exports = viewModel