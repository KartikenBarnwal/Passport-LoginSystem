const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const { request } = require('express')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error('Email not valid!')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        // maxlength:16,
        validate(value){
            if(validator.contains(value,this.name))
            {
                throw new Error('Password should not contain your name in it')
            }

        } 
    },
    pass:{
        type:String,
        default:0
    },
    date:{
        type:Date,
        default:Date.now()
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

userSchema.methods.toJSON = function(){
    var obj = this.toObject()

    delete obj._id
    delete obj.__v
    // delete obj.password
    return obj
} 

userSchema.methods.generateAuthToken = async function(){
    var token = jwt.sign({_id:this._id.toString()}, 'C)9"N^(`=,x<6+b$kKw#H/aEakB"G%~p',{expiresIn:'7 days'})
    this.tokens = this.tokens.concat({token})
    await this.save()
    return token
}

userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user)
    {
        throw new Error('Unable to Login!')
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch)
    {
        throw new Error('Unable to Login!')
    }

    return user
}

userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})






const User = mongoose.model('users',userSchema)

module.exports = User
