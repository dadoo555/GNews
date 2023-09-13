const connection = require('../../db/setup').connection
const {check, validationResult} = require('express-validator')

exports.loadSettings = (req, res)=>{
    res.render('settings', {
        user: req.session.user
    })
}

exports.newUser = (req,res)=>{
    //.....Validation Error.............
    const errors = validationResult(req)
    if(!errors.isEmpty()){ 
        res.status(500).json({
            status: 'Error fields'
        })
        return
    }

    let {username, password} = req.body.data
    const sqlQuery =    `INSERT INTO authors
                            (name, password)
                        VALUES
                            ('${username}', '${password}')`   

}