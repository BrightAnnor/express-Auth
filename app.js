const express = require('express');
const dotenv = require('dotenv');
//configuration
dotenv.config();
const dbConnect = require('./dbConnect')
const User = require('./user');
const bcrypt = require('bcrypt');
const { where } = require('sequelize');
const expressSession = require('express-session')


const port = process.env.PORT || 5858
const APP_SECRET = process.env.APP_SECRET
const app = express();

// setting sessions to keep track of user
app.use(expressSession({
    secret:APP_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{}
}))

app.use(express.urlencoded({extended:false}))

app.get("/", (req,res)=>{
    res.send('its working')
})
//creating an account
app.post('/register',async (req,res)=>{
   try {
     //accessing user input
     const {user_name,password} = req.body
     const hashPassword = await bcrypt.hash(password,10)
     //putting data in the database
   const result = await User.create({user_name,'password':hashPassword})
   if(result)
     return res.send('User created successfully')
 
     res.send('unable to create User')
   } catch (e) {
    res.send('Unable to handle request currently,try again.')
    
   }
})

//login into an account
app.post('/login',async(req,res)=>{
   try {
    const {user_name,password} = req.body
    // determin if data is available based on the user name  
   const result = await User.findOne({where:{'user_name':user_name}})
   if(!result) return res.send('Invalid Credentials,try again')

   const userCorrectPassword = result.password
    //compare the hashPass with the current password
    const isPasswordCorrect = await bcrypt.compare(password,userCorrectPassword)
    if(!isPasswordCorrect)
    return res.send('Invalid Credentials, try again')

    req.session.user = result.id
    res.send('Login successfully')
    
    
    
   } catch (error) {
    console.log(error)
    
   }
})

//middleware to protect the home page
const isUserAuthenticated = (req,res,next)=>{
    if(req.session.user)
        return next()
    res.send('Kindly Login,first')
}
//user home page
app.get('/home-page',isUserAuthenticated,async (req,res)=>{
    try {
        const userID = req.session.user
        const userInfo = await User.findOne({where:{id:userID}})
        res.send(`Welcome ${userInfo.user_name}`)
    } catch (error) {
        res.send('Unable to Handle request')
    }
})

const startServer = ()=>{
    try {
        app.listen(port,()=>{

            console.log(`server runing on http://localhost:${port}`)
            dbConnect.authenticate();
        })
    } catch (e) {
        console.log(e)
    }
}

startServer()