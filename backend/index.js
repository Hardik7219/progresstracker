const express = require('express')
const app = express()
const users = require('./models/user.Model')


app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.get('/',(req,res)=>{
    console.log('running')
    res.send("hello")
})


app.post('/create', async (req,res)=>{
    console.log('work!');
})
app.listen(3000)