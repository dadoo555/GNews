const express = require('express')
const app = express()
const connection = require('./db/setup').connection


const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator')
// const { json } = require('body-parser')
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

let atuaisNoticias = []
app.get('/', (req,res) => {

    let sqlQuery = `SELECT url_path, card_size, title, subtitle, path 
                    FROM news 
                    JOIN pictures 
                        ON pictures.news_id = news.news_id
                    JOIN index_homepage
                        ON index_homepage.news_id = news.news_id
                    ORDER BY
                        index_homepage.index_id DESC`
    connection.query(sqlQuery, (err,result, fields) =>{ 
        if (err) throw err;
        atuaisNoticias = result
        
        let keys = Object.keys(atuaisNoticias)
        res.render('index', {
            chavesNoticias: keys, 
            listaNoticias: atuaisNoticias,
        })
    })

})

// ........................ Single News page ........................................

app.get('/news/:newsID', (req,res) => {
    
    let noticiaPedida = []
    let sqlQuery = `SELECT url_path, title, subtitle, text, date, locality, description, path, name AS author_name 
                    FROM news 
                    JOIN pictures 
                        ON pictures.news_id = news.news_id
                    JOIN authors
                        ON news.author_id = authors.author_id
                    WHERE url_path = '${req.params.newsID}'`
    console.log(req.params.newsID)
    
    connection.query(sqlQuery, (err,result, fields) =>{ 
        if (err) throw err;
        noticiaPedida = result[0]

        res.render('news', {
            dadosNoticia: noticiaPedida
        })
    })
    

})

// ........................ Login validation Const ........................................


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
        // tem erro
        res.redirect('/login?error=UserOrPassword')
        return
    }

    // Comparar com a db
    let sqlQuery = `SELECT author_id, name, password FROM authors
                     WHERE name = '${req.body.username}'`

    connection.query(sqlQuery, (err,results, field) => {
        if (err) throw err;

        // Caso o usuario nao exista
        if (typeof results[0] == 'undefined'){
            console.log('Usuario inexistente')
            res.redirect('/login?error=Username')
            return
        }

        //Verificar a senha 
        if (results[0].password == req.body.password) {
            
            //USUARIO E SENHA CERTA
            console.log('Senha correta: ' + results[0].password + ' html: ' + req.body.password)
            req.session.user = {
                id: results[0].author_id, 
                name: results[0].name
            }
            res.redirect('/administration/overview') 

        } else {
            //SENHA ERRADA
            console.log('Senha errada: ' + results[0].password + ' HTML: ' + req.body.password )
            const wrongPassword = true
            res.redirect('/login?error=Password')
        }
    })
})




// !!!!   IMPLEMENTAR  !!!! ............................................................
app.get('/sports', (req,res) => {
    res.send('esportes')

})

app.listen(80)


