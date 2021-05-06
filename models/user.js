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
    following: Array,
    followers: Array,
    likeme:Array,
    tag: Object,
    favorite:Array,
    like:Array,
    view:Array,
    camera_me: Object,
    point:Number,
    activity:Array
})
const userModel = mongoose.model('user', userSchema)
module.exports = userModel