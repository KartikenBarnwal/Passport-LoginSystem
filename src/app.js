require('dotenv').config()
const express = require('express')
const User = require('./userModel')
const auth = require('./auth')
const path = require('path')
const methodOverride = require('method-override')
var nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs')
const profileRouter = require('../routes/profileRouter')

require('./db/mongoose')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
const publicDirPath=path.join(__dirname,'../public')
const viewsPath=path.join(__dirname,'../views')

app.set('view engine', 'ejs')
app.set('views',viewsPath)

app.use(express.urlencoded({extended:false}))
app.use(methodOverride('_method'))
app.use('/profile',profileRouter)

var cookieParser = require('cookie-parser')
app.use(cookieParser())

// app.use(function (req, res, next) {
//     var cookie = req.cookies.jwtToken;
//     if (!cookie) {
//       res.cookie('jwtToken', theJwtTokenValue, { maxAge: 900000, httpOnly: true });
//     } else {
//       console.log('lets check that this is a valid cookie');
//       // send cookie along to the validation functions...
//     }
//     next();
//   });
//In case of maintenance:- 
// app.use((req,res,next)=>{
//     res.status(503).send({"message":"The service is currently unavailable. Please come back later!"})
// })


app.get('/',(req,res)=>{
    res.render('index')
    console.log('ok')
})
app.use(express.static(publicDirPath))
app.use('/profile',profileRouter)

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/users/update',async(req,res)=>{
    try{
        res.render('otp')
    }catch(e)
    {
        console.log(e)
    }
})

app.post('/users/signup',async(req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.redirect('/login')
    }catch(e){
        res.status(400).send(e)
    }
})

app.post('/users/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        if(user==null)
        {
            return res.send({message:'Authentication Failed!'})
        }
        const token = await user.generateAuthToken()
        
        //setting up cookie for the client!
        res.cookie('jwt', token, {
            httpOnly: false,
            maxAge: 24*60*60*1000,
            secure: false
        })

        // res.send({user,token})
        res.redirect('/profile/'+user._id)
    }catch(e){
        res.status(404).send()
    }
})

app.get('/forgotPass',(req,res)=>{
    res.render('forgotPass')
})

app.post('/users/update/:id',async(req,res)=>{
    try{
        const user = await User.findOne({_id:req.params.id})
        const decode = await bcrypt.compare(req.body.otp,user.pass)
        console.log(decode)

        if(decode)
        {
            res.render('changePass',{user})
        }
        else
        {
            res.send({message:'error'})
        }

    }catch(e){
        res.status(400).send(e)
    }
})

app.post('/users/updatePassword/:id',async(req,res)=>{
    try{
        const user = await User.findOne({_id:req.params.id})
        user.password = req.body.password
        user.pass = '0'
        await user.save()
        res.redirect('/login')
        
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
        const otp = Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString()+Math.floor(Math.random()*10).toString()
        const pass = await bcrypt.hash(otp,8)
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD
            }
          });

          var mailOptions = {
            from:  process.env.EMAIL,
            to: user.email,
            subject: 'Verification Email',
            text: `Hello, ${user.name}! Please verify with the following OTP`,
            html:'<h1>'+otp+'</h1>'
          };
          
          transporter.sendMail(mailOptions, async function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              const updatedUser = {...user, pass: pass}
              user.pass = pass
              await user.save()
              res.render('otp',{user})
            // res.redirect('/users/update/'+user._id)

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
        console.log('Logged Out Successfully!')
        res.redirect('/login')
    }catch(e){
        res.status(400).send(e)
    }
})

app.post('/users/logoutAll', auth ,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.redirect('/login')
    }catch(e){
        res.status(400).send(e)
    }
})

app.delete('/users/delete', auth ,async(req,res)=>{
    try{
        const user = await User.findByIdAndDelete(req.user._id)
        res.redirect('/')
    }catch(e){
        res.status(400).send(e)
    }
})

app.listen(port,()=>{
    console.log('Server is up on port '+ port)
})
