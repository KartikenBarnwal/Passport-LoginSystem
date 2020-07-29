const jwt = require('jsonwebtoken')
const User = require('./userModel')

const auth = async(req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        // console.log(token)
        const decoded = jwt.verify(token,'C)9"N^(`=,x<6+b$kKw#H/aEakB"G%~p')
        const user = await User.findOne({_id: decoded._id, "tokens.token":token})
        console.log('ok')
        if(!user)
        {
            throw new Error()
        }

        req.user = user
        req.token = token
        console.log('hey')
        next()

    }catch(e){
        res.status(401).send({error:'Please Authenticate!'})
    } 
}

module.exports = auth