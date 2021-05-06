const mongoose = require('mongoose')
//require('mongoose-double')(mongoose);
const Schema = mongoose.Schema
//var SchemaTypes = mongoose.Schema.Types;

const messengerSchema = new Schema({
  reference: String,
  data: Array,
  time: String
})
const messengerModel = mongoose.model('messenger', messengerSchema)
module.exports = messengerModel