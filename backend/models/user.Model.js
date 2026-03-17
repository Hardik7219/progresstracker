const mongoose = require('mongoose')

mongoose.connect('mongodb://admin:hardik7219@localhost:27017/my?authSource=admin')

const userSchema = mongoose.Schema({
    userName : String,
    email : String,
    password: String,
})

module.exports  =  mongoose.model("user",userSchema)