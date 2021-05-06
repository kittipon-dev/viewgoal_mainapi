const mongoose = require('mongoose')
const Schema = mongoose.Schema
const configSchema = new Schema({
    user_id: Number,
})
const configModel = mongoose.model('config', configSchema)
module.exports = configModel