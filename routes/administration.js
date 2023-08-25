const express = require('express')
const router = express.Router()

const dbSetup = require('../db/setup')
const connection = dbSetup.connection
const checkUser = require('../lib').checkUser

// ........................ Sessao ........................................

const sessionHandler = require('../lib').sessionHandler
const cookieParser = require('../lib').cookieParser
router.use(sessionHandler)
router.use(cookieParser())

// ........................ Validator Form ........................................

const bodyParser = require('body-parser')
router.use(bodyParser.json())
const { check, validationResult } = require('express-validator')
const urlEncodedParser = bodyParser.urlencoded({ extended: false })



// ........................ OverView ........................................

router.get('/overview', checkUser, (req,res)=> {
    
    let sqlQuery = `SELECT news.news_id AS id, url_path, title, subtitle, LEFT(text, 300) AS text, path FROM news 
                    JOIN pictures ON pictures.news_id = news.news_id
                    JOIN index_homepage ON index_homepage.news_id = news.news_id
                    ORDER BY index_homepage.index_id DESC` 
                        
    connection.query(sqlQuery, (err,result, fields) =>{ 
        if (err) throw err;
        noticias = result
        let keys = Object.keys(noticias)
        res.render('overview', {
            chavesNoticias: keys, 
            listaNoticias: noticias,
            user: req.session.user
        })
    })
})

// ........................ New post ........................................

router.get('/newpost', checkUser,(req, res)=>{
    
    const sqlQuery = "SELECT author_id, name FROM authors"
    connection.promise().query(sqlQuery).then((result)=>{
        const [dados] = result
        res.render('newpost', {
            authorsList: dados,
            erro: req.query.error,
            user: req.session.user
        })
    }).catch((err)=>{
        // console.log(err)
        // res.status(500)
        res.status(500).redirect(`/error?msg=${err}`)
    })
})

router.post('/newpost', urlEncodedParser, [
        
        check('data.title', 'title')
            .isLength({min: 3}),
        check('data.subtitle', 'subtitle')
            .isLength({min: 3}),
        check('data.locality', 'locality')
            .isLength({min: 3}),
        check('data.picture', 'picture')
            .isLength({min: 3}),
        check('data.picturedescription', 'picturedescription')
            .isLength({min: 3}),
        check('data.text').isLength({min: 10}),


    ], (req, res)=>{
        
        //.....Validation Error.............
        const errors = validationResult(req)
 
        if(!errors.isEmpty()){ 
            res.status(500).json({status: 'Error fields'})
            return
        }

        //....DB...........................
        let currentDate = new Date().toJSON().slice(0, 10);
        let {urlpath, cardsize, title, subtitle, text, locality, author, picture, picturedescription} = req.body.data
        const queryNews =   `INSERT INTO news (url_path, card_size, title, subtitle, text, date, locality, author_id)
                             VALUES ('${urlpath}','${cardsize}','${title}','${subtitle}','${text}','${currentDate}','${locality}','${author}')`
        const queryPictures =   `INSERT INTO pictures (description, path, news_id)
                                 VALUES ('${picturedescription}','${picture}',(SELECT news_id FROM news WHERE url_path='${urlpath}'));`
        const queryIndex = `INSERT INTO index_homepage (index_id, index_homepage.news_id)
                             VALUES ((SELECT MAX(index_id) + 1 FROM index_homepage i), 
                                    (SELECT news_id FROM news WHERE url_path='${urlpath}'));`

        connection.promise().query(queryNews).then(()=>{
            return connection.promise().query(queryPictures)
        }).then(()=>{
            return connection.promise().query(queryIndex)
        }).then(()=>{
            res.status(200).json({status: 'DB add news OK'})
        }).catch((err)=>{
            res.status(500).redirect(`/error?msg=${err}`)
        })
    })

// ........................ Delete post ........................................

router.post('/overview/:newsID/delete', (req,res)=>{
    const idNewsToRemove = req.params.newsID
    const queryPictures = `DELETE FROM pictures WHERE (pictures.news_id = '${idNewsToRemove}')`
    const queryIndex = `DELETE FROM index_homepage WHERE (index_homepage.news_id = '${idNewsToRemove}')`
    const queryNews = `DELETE FROM news WHERE (news.news_id='${idNewsToRemove}')`

    connection.promise().query(queryPictures).then(()=>{
        return connection.promise().query(queryIndex)
    }).then(()=>{
        return connection.promise().query(queryNews)
    }).then(()=>{
        res.status(200).json({status: 'Deleted'})
    }).catch((err)=>{
        res.status(500).json({status: err})
    })
})

// ........................ Update Order ........................................

router.post('/overview/saveOrder', (req,res)=>{
    let database = req.body.dados
    let promisesIndex = []

    database.forEach((id, index) => {

        const sqlQuery =`UPDATE index_homepage
                         SET index_id = '${index + 1}'
                         WHERE news_id = '${id}'`
        const p = connection.promise().query(sqlQuery)  
        promisesIndex.push(p)
    })

    Promise.all(promisesIndex).then(()=>{
        res.status(200).json({status: 'Update order OK'})
    }).catch(()=>{
        res.status(500).json({status: 'Error order'})
    })
})
    

// ........................ Edit News ........................................

router.get('/edit', checkUser, (req,res)=>{
    
    const queryNews =   `SELECT news.news_id, url_path, title, subtitle, card_size, text, date, locality, description, path, name AS author_name, authors.author_id 
                        FROM news JOIN pictures ON pictures.news_id = news.news_id
                        JOIN authors ON news.author_id = authors.author_id WHERE news.news_id = '${req.query.idNews}'`
    const queryAuthors = "SELECT author_id, name FROM authors"
    let newsData = []
    
    connection.promise().query(queryNews).then((results)=>{
        [newsData] = results
        return connection.promise().query(queryAuthors)
    }).then((results)=>{
        const [authorsList] = results
        res.render('editNews', {
            user: req.session.user,
            data: newsData,
            authorsList,
            erro: req.query.error
        })
    }).catch((erro)=>{
        res.status(500).json({status: 'error edit news'})
        console.log(erro)
    })
})

router.post('/edit', urlEncodedParser, [
    check('title', 'title')
        .isLength({min: 3}),
    check('subtitle', 'subtitle')
        .isLength({min: 3}),
    check('locality', 'locality')
        .isLength({min: 3}),
    check('picture', 'picture')
        .isLength({min: 3}),
    check('picture-description', 'picture-description')
        .isLength({min: 3}),
    check('text').isLength({min: 10}),

],(req,res)=>{

    // Caso tenha erro de preenchimento
    const errors = validationResult(req)
    if(!errors.isEmpty()){ 
        res.redirect(`/administration/edit?idNews=${req.body.id}&error=true`)
        return
    }

    //DB
    const sqlQuery = ``
    res.send('deu')

})


// ........................ Settings ........................................

router.get('/settings', checkUser ,(req, res)=>{
    res.render('settings', {
        user: req.session.user
    })
})

module.exports = router