const express = require('express')
const User = require('./userModel')
const auth = require('./auth')
const { findById, updateOne, findByIdAndUpdate } = require('./userModel')
require('./db/mongoose')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

//In case of maintenance:- 
// app.use((req,res,next)=>{
//     res.status(503).send({"message":"The service is currently unavailable. Please come back later!"})
// })


app.post('/users/signup',async(req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

app.post('/users/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(404).send()
    }
})

app.get('/users/readProfile', auth ,async(req,res)=>{
    res.send(req.user)

})

app.patch('/users/update/:id',async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        user.password = req.body.password
        if(!user)
        {
            return res.status(404).send()
        }
        await user.save()
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

app.post('/users/logout', auth ,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{return token.token!=req.token})
        await req.user.save()
        res.status(200).send({message:'Logged Out Successfully!'})
    }catch(e){
        res.status(400).send(e)
    }
})

app.post('/users/logoutALL', auth ,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send({message:'Logged Out Successfully!'})
    }catch(e){
        res.status(400).send(e)
    }
})

app.delete('/users/delete', auth ,async(req,res)=>{
    try{
        const user = await User.findByIdAndDelete(req.user._id)
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

app.listen(port,()=>{
    console.log('Server is up on port '+ port)
})