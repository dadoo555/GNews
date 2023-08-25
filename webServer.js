const express = require('express')
const app = express()

const dbSetup = require('./db/setup')
const connection = dbSetup.connection

const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator')
const urlEncodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs')
app.use(express.static('public'))

// ........................ Routes ........................................

const adminRoute = require('./routes/administration')
app.use('/administration', adminRoute)

// ........................ Session ........................................

const sessionHandler = require('./lib').sessionHandler
const cookieParser = require('./lib').cookieParser

app.use(sessionHandler)
app.use(cookieParser())

// ........................ Homepage ........................................

app.get('/', (req,res) => {

    let sqlQuery = `SELECT url_path, card_size, title, subtitle, path FROM news 
                    JOIN pictures ON pictures.news_id = news.news_id
                    JOIN index_homepage ON index_homepage.news_id = news.news_id
                    ORDER BY index_homepage.index_id DESC`
    connection.promise().query(sqlQuery).then((result)=>{
        let [news] = result
        let keys = Object.keys(news)
        res.render('index', {
            keysNews: keys, 
            newsList: news,
        })
    }).catch((err)=>{
        res.status(500).redirect(`/error?msg=${err}`)
    })
})

// ........................ Single News page ........................................

app.get('/news/:newsID', (req,res) => {

    let sqlQuery = `SELECT url_path, title, subtitle, text, date, locality, description, path, name AS author_name 
                    FROM news 
                    JOIN pictures ON pictures.news_id = news.news_id
                    JOIN authors ON news.author_id = authors.author_id
                    WHERE url_path = '${req.params.newsID}'`
    connection.promise().query(sqlQuery).then((result)=>{
        let [singleNews] = result[0]
        res.status(200).render('news', {
            newsData: singleNews
        })
    }).catch((err)=>{
        res.status(500).redirect(`/error?msg=${err}`)
    })
})

// ........................ Login ........................................

app.get('/login', (req,res) => {
    res.render('login', {
        errName: req.query.error
    })
})

const usernameValidator = check('username', 'Username not valid')
        .exists()
        .isLength({min: 3})

const passwordValidator = check('password', 'Password not valid')
        .isLength({min:3})
const validation = [ usernameValidator,passwordValidator]


app.post('/login', urlEncodedParser, validation, (req,res) => {
    
    // Validar preenchimento
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.redirect('/login?error=BlankFields')
        return
    }

    // Comparar com a db
    let sqlQuery = `SELECT author_id, name, password FROM authors WHERE name = '${req.body.username}'`

    connection.promise().query(sqlQuery).then((results)=>{
        const [data] = results

        // ...No user...
        if (!data[0]){
            res.redirect('/login?error=Username')
            return
        }

        const {author_id, name, password} = data[0]

        //...Password check...
        if (password == req.body.password) {
            //User and password right
            req.session.user = {
                id: author_id, 
                name: name
            }
            res.redirect('/administration/overview') 

        } else {
            //Wrong password
            res.redirect('/login?error=Password')
        }


    }).catch((err)=>{
        res.status(500).redirect(`/error?msg=${err}`)
    })
})


app.get('/error', (req,res)=>{
    res.render('error', {
        message: req.query.msg
    })
})

// !!!!   IMPLEMENTAR  !!!! ............................................................
app.get('/sports', (req,res) => {
    res.send('esportes')

})

app.listen(80)


