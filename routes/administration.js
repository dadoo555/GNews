const express = require('express')
const router = express.Router()

const checkUser = require('../lib').checkUser

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, __dirname + '/../public/images')
    },
    filename: function(req, file, callback){
        callback(null, file.originalname)
    }
})
const upload = multer({storage: storage})

// .......... Session ........
const {sessionHandler, cookieParser} = require('../lib')
router.use(sessionHandler)
router.use(cookieParser())

// ....... Validator Form .....
const bodyParser = require('body-parser')
router.use(bodyParser.json())
const {check, validationResult} = require('express-validator')
const urlEncodedParser = bodyParser.urlencoded({extended: false })
router.use(express.urlencoded({extended: true }))


// ....... OverView ........
const administration = require('../controllers/administration/overview')
router.get('/overview', checkUser, administration.loadOverview )                    

// ........ Log out ..........
const login = require('../controllers/administration/login')
router.get('/logout', login.logout)

// ........ New post ..........
const news = require('../controllers/administration/news')
router.get('/newpost', checkUser, news.createNews)
router.post('/newpost', upload.single('file'), urlEncodedParser, [
        check('title', 'title').isLength({min: 3}),
        check('subtitle', 'subtitle').isLength({min: 3}),
        check('locality', 'locality').isLength({min: 3}),
        check('picture', 'picture').isLength({min: 3}),
        check('picturedescription', 'picturedescription').isLength({min: 3}),
        check('text', 'text').isLength({min: 10}),
    ], news.publishNews
)

// ....... Delete post .........
router.post('/overview/:newsID/delete', news.deleteNews)

// ....... Update Order ........
router.post('/overview/saveOrder', administration.updateOrder)
    
// ........ Edit News ..........
router.get('/edit', checkUser, news.loadEditNews)
router.post('/edit', urlEncodedParser, [
        check('data.title', 'title').isLength({min: 3}),
        check('data.subtitle', 'subtitle').isLength({min: 3}),
        check('data.locality', 'locality').isLength({min: 3}),
        check('data.picturedescription', 'picturedescription').isLength({min: 3}),
        check('data.text').isLength({min: 10}),
    ], news.updateNews
)

// ........ Settings ..........
router.get('/settings', checkUser ,(req, res)=>{
    res.render('settings', {
        user: req.session.user
    })
})

module.exports = router