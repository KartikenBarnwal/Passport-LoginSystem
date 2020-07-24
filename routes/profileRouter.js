const express = require('express')
const router = express.Router()
const User = require('../src/userModel')

router.get('/:id', async(req,res)=>{
    const user = await User.findOne({_id:req.params.id})
    // console.log(user)
    res.render('profile',{user})
})

module.exports = router