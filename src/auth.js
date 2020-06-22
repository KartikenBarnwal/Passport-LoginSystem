const jwt = require('jsonwebtoken')
const User = require('./userModel')

const auth = async(req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,'C)9"N^(`=,x<6+b$kKw#H/aEakB"G%~p')
        const user = await User.findOne({_id: decoded._id, "tokens.token":token})

        if(!user)
        {
            throw new Error()
        }

        req.user = user
        req.token = token
        next()

    }catch(e){
        res.status(401).send({error:'Please Authenticate!'})
    } 
}

module.exports = auth