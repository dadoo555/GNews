const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')
const urlEncodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs')
app.use('/news/public', express.static('public'))

// .......... Routes .........
const adminRoute = require('./routes/administration')
app.use('/news/administration', adminRoute)

// .......... Session ........
const {sessionHandler, cookieParser} = require('./lib')
app.use(sessionHandler)
app.use(cookieParser())

// .......... Homepage ........
const website = require('./controllers/website/news')
app.get('/news/', website.loadHomepage)
app.get('/news/news/:newsID', website.loadSingleNews)

// ........... Login ..........
const administration = require('./controllers/administration/login')
app.get('/news/login', administration.loadLogin)
app.post('/news/login', urlEncodedParser, [
    check('username', 'Username not valid').exists().isLength({min: 3}),
    check('password', 'Password not valid').isLength({min:3})
], administration.tryLogin)

//........... Error page .......
app.get('/news/error', (req,res)=>{
    res.render('error', {
        message: req.query.msg
    })
})

app.listen(3001)


