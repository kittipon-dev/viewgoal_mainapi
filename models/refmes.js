const mongoose = require('mongoose')
//require('mongoose-double')(mongoose);
const Schema = mongoose.Schema
//var SchemaTypes = mongoose.Schema.Types;
const refmesSchema = new Schema({
  user_id_1: String,
  user_id_2: String,
  reference: String
})
const refmesModel = mongoose.model('refmes', refmesSchema)
module.exports = refmesModel