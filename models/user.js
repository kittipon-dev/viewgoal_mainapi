const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
    user_id: Number,
    name: String,
    img:String,
    note:String,
    birthday: String,
    sex: String,
    image_profile: String,
    mes: String,
    followers: Number,
    tag: Object,
    like:Number,
    camera_me: Object,
    point:Number,
    activity:Array
})
const userModel = mongoose.model('user', userSchema)
module.exports = userModel