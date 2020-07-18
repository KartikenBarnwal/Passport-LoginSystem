const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_Connect,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex:true
})