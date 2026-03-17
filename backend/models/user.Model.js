const { User } = require('lucide-react')
const mongoose = require('mongoose')

mongoose.connect('mongodb://admin:hardik7219@localhost:27017/my?authSource=admin')

const userSchema = mongoose.Schema({
    userName : String,
    email : String,
    password: String,
    partner :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    analys: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'analys'
    }
})

module.exports  =  mongoose.model("user",userSchema)