const connection = require('../../db/setup').connection
const {check, validationResult} = require('express-validator')


exports.loadLogin = (req,res) => {
    res.render('login', {
        errName: req.query.error
    })
}

exports.tryLogin = (req,res) => {
    
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

        //...Password check...
        const {author_id, name, password} = data[0]
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
}

exports.logout = (req,res)=>{
    if (req.session.user){
        req.session.destroy()
        res.redirect('/')
    }

    res.redirect('/administration/overview')
}