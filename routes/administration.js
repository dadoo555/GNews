const express = require('express')
const router = express.Router()

const dbSetup = require('../db/setup')
const connection = dbSetup.connection
const db = dbSetup.db
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
// const { json } = require('body-parser')
const urlEncodedParser = bodyParser.urlencoded({ extended: false })



// ........................ OverView ........................................

router.get('/overview', checkUser, (req,res)=> {
    

    let sqlQuery = `SELECT news.news_id AS id, url_path, title, subtitle, LEFT(text, 300) AS text, path
                    FROM news 
                    JOIN pictures 
                        ON pictures.news_id = news.news_id
                    JOIN index_homepage
                        ON index_homepage.news_id = news.news_id
                    ORDER BY
                        index_homepage.index_id DESC` 
                        
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
    db.query(sqlQuery).then((result)=>{
        const [dados] = result
        res.render('newpost', {
            authorsList: dados,
            erro: req.query.error,
            user: req.session.user
        })
        

        // console.log(dados)
    }).catch((erro)=>{
        console.log(erro)
        res.status(500)
    })




    // connection.query(sqlQuery, (err, results, field)=>{
    //     if (err) throw err;

    //     res.render('newpost',{
    //         authorsList: results,
    //         erro: req.query.error,
    //         user: req.session.user
    //     })
    // })  
})

router.post('/newpost', urlEncodedParser, [
        
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


    ], (req, res)=>{
        
        // Caso tenha erro
        const errors = validationResult(req)
 
        if(!errors.isEmpty()){ 
            res.redirect('/administration/newpost?error=true')
            return
        }

        //Caso esteja ok, adicionar na DB
        let currentDate = new Date().toJSON().slice(0, 10);

        // news
        // console.log(req.body)
        const sqlQuery =   `INSERT INTO news
                                (url_path, card_size, title, subtitle, text, date, locality, author_id)
                            VALUES
                                ('${req.body.urlpath}',  
                                '${req.body.cardsize}',
                                '${req.body.title}',
                                '${req.body.subtitle}',
                                '${req.body.text}',
                                '${currentDate}', 
                                '${req.body.locality}',
                                '${req.body.author}')`

        connection.query(sqlQuery, (err, results, field)=>{
            if (err){
                res.status(500)
                res.render('error')
                // throw err;
                return
            }
            console.log('Adicionado em noticias db')

            // pictures
            const sqlQuery2 =   `INSERT INTO pictures
                                    (description, path, news_id)
                                VALUES
                                    ('${req.body['picture-description']}', 
                                    '${req.body.picture}', 
                                    (SELECT news_id FROM news WHERE url_path='${req.body.urlpath}'));`

            connection.query(sqlQuery2 ,(err, results, field)=>{
                if (err){
                    res.status(500)
                    res.render('error')
                    // throw err;
                    return
                }
                console.log('Adicionado em ordem pictures')

                // ordem
                const sqlQuery3 = `INSERT INTO index_homepage
                                        (index_id, index_homepage.news_id)
                                     VALUES
                                        ((SELECT MAX(index_id) + 1 FROM index_homepage i), 
                                        (SELECT news_id FROM news WHERE url_path='${req.body.urlpath}'));`
                connection.query(sqlQuery3 ,(err, results, field)=>{
                    if (err){
                        res.status(500)
                        res.render('error')
                        // throw err;
                        return
                    }
                    console.log('Adicionado em ordem db')
                })
            })

            // //redirecionar pro overview
            res.redirect('/administration/overview')


        })

        
    })

// ........................ Delete post ........................................

router.post('/overview/:newsID/delete', (req,res)=>{
    const idNewsToRemove = req.params.newsID
    const sqlQuery =    `DELETE FROM pictures
                         WHERE (pictures.news_id = '${idNewsToRemove}')`
    connection.query(sqlQuery, (err, results, field)=>{
        if (err){
            res.status(500).json({status: 'Deu errado imagem'})
            return
        }
        // console.log('Removido da DB')
        // res.json({status: 'Deu certo'})

        const sqlQuery2 =   `DELETE FROM index_homepage
                            WHERE (index_homepage.news_id = '${idNewsToRemove}')`
        connection.query(sqlQuery2, (err,result,field)=>{
            if (err){
                res.status(500).json({status: 'Deu errado index'})
            }
            // res.json({status: 'Deu certo'})

            const sqlQuery3 =   `DELETE FROM news 
                                WHERE (news.news_id='${idNewsToRemove}')`
            connection.query(sqlQuery3, (err,result,field)=>{
                if (err){
                    res.status(500).json({status: 'Deu errado news'})
                }
                res.json({status: 'Deu certo'})
            })
        

        })
    })
})

// ........................ Update Order ........................................

router.post('/overview/saveOrder', (req,res)=>{
    let database = req.body.dados
    database.forEach((id, index) => {
        //connection Database
        const sqlQuery =`UPDATE index_homepage
                         SET index_id = '${index + 1}'
                         WHERE news_id = '${id}'`
        connection.query(sqlQuery, (err, results, field)=>{
            if (err){
                res.status(500).json({status: 'Deu errado'})
                return
            }

            //OK
            
        })
           
    })
    res.json({status: 'Deu certo'})
})
    

// ........................ Edit News ........................................

// router.get('/:newsId/edit', checkUser, (req,res)=>{
router.get('/edit', checkUser, (req,res)=>{
    
    const sqlQuery =   `SELECT news.news_id, url_path, title, subtitle, card_size, text, date, locality, description, path, name AS author_name, authors.author_id 
                        FROM news 
                        JOIN pictures 
                            ON pictures.news_id = news.news_id
                        JOIN authors
                            ON news.author_id = authors.author_id
                        WHERE news.news_id = '${req.query.idNews}'`
    connection.query(sqlQuery, (err, results, field)=>{
        if (err){
            res.render('error')
            return
        }

        //const with data
        const data = results

        //Authors List DB
        const sqlQuery2 = "SELECT author_id, name FROM authors"
        connection.query(sqlQuery2, (err, authorsList, field)=>{
            if (err){
                res.render('error')
                return
            }

            //Render
            res.render('editNews', {
                user: req.session.user,
                data: data,
                authorsList,
                erro: req.query.error
            })
        })
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


router.get('/rrr',(req,res)=>{
    res.send(req.query.idD)  
})

module.exports = router