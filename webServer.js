const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')
const urlEncodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs')
app.use(express.static('public'))

// .......... Routes .........
const adminRoute = require('./routes/administration')
app.use('/administration', adminRoute)

// .......... Session ........
const {sessionHandler, cookieParser} = require('./lib')
app.use(sessionHandler)
app.use(cookieParser())

// .......... Homepage ........
const website = require('./controllers/website/news')
app.get('/', website.loadHomepage)
app.get('/news/:newsID', website.loadSingleNews)

// ........... Login ..........
const administration = require('./controllers/administration/login')
app.get('/login', administration.loadLogin)
app.post('/login', urlEncodedParser, [
    check('username', 'Username not valid').exists().isLength({min: 3}),
    check('password', 'Password not valid').isLength({min:3})
], administration.tryLogin)

//........... Error page .......
app.get('/error', (req,res)=>{
    res.render('error', {
        message: req.query.msg
    })
})

app.listen(80)


