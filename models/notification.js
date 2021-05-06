const mongoose = require('mongoose')
//require('mongoose-double')(mongoose);
const Schema = mongoose.Schema
//var SchemaTypes = mongoose.Schema.Types;

const notificationSchema = new Schema({
  type: String,
  t_user_id: String,
  r_user_id: String,
  refid: String,
  txt: String,
  time: String
})
const notificationModel = mongoose.model('notification', notificationSchema)
module.exports = notificationModel