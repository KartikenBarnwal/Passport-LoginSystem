const express = require('express')
const User = require('./userModel')
const auth = require('./auth')
const path = require('path')
const methodOverride = require('method-override')
var nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs')

require('./db/mongoose')

const app = express()
const port = process.env.PORT || 3000

// app.use(express.json())
const publicDirPath=path.join(__dirname,'../public')
const viewsPath=path.join(__dirname,'../views')

app.set('view engine', 'ejs')
app.set('views',viewsPath)

app.use(express.urlencoded({extended:false}))
app.use(methodOverride('_method'))

//In case of maintenance:- 
// app.use((req,res,next)=>{
//     res.status(503).send({"message":"The service is currently unavailable. Please come back later!"})
// })


app.get('',(req,res)=>{
    res.render('index')
    console.log('ok')
    // res.send({message:'ok'})
})
app.use(express.static(publicDirPath))

app.get('/login',(req,res)=>{
    res.render('login')
})


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

app.get('/forgotPass',(req,res)=>{
    res.render('forgotPass')
})

app.post('/users/update/:id',async(req,res)=>{
    try{
        // console.log(req.body)
        const user = await User.findOne({_id:req.params.id}).lean()
        // const decode = await bcrypt.compare(req.params.pass,req.body.otp)
        if(1)
        {
            // res.render('changePass')
            res.send({message: 'Authenticated'})
            console.log('hmm')
        }
        else
        {
            res.send({message:'error'})
        }

    }catch(e){
        res.status(400).send(e)
    }
})

app.post('/users/update',async(req,res)=>{
    try{
        const user = await User.findOne({email:req.body.email});
        if(!user)
        {
            return res.send({message:"Email ID not registered!"})
        }
        // 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
        const otp = Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString()
        const pass = await bcrypt.hash(otp,8)
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'vishalkrb123@gmail.com',
              pass: 'vishal'
            }
          });

          var mailOptions = {
            from: 'vishalkrb123@gmail.com',
            to: 'prahlad@gmail.com',
            subject: 'Verification Email',
            text: `Hello, ${user.name}! Please verify with the following OTP`,
            html:'<h1>'+otp+'</h1>'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              const updatedUser = {...user, pass: pass}
              res.render('otp',{user:updatedUser})

            }
          });

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

// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey('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');
// const msg = {
//   to: 'vishalkrb123@gmail.com',
//   from: 'kartikenkrb@gmail.com',
//   subject: 'Sending with Twilio SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
// sgMail.send(msg);
// console.log('check   ')