// ........................ Check Session ........................................

const checkUser = (req, res, next) =>{
    next()
    // if (req.session.user){
    //     next()
    // }else{
    //     res.redirect('/login')
    // }
}

// ........................ Session ........................................

const cookieParser = require('cookie-parser')
const sessions = require('express-session')
const oneDay = 1000 * 60 * 60 * 24
const sessionHandler = sessions({
    secret: 'vheuivheriuhviuhiubjhbshdkgewyud',
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
})




module.exports = {checkUser, sessionHandler, cookieParser}