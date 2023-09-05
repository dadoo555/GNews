const connection = require('../../db/setup').connection

exports.loadOverview = (req,res)=> {
    
    let sqlQuery = `SELECT news.news_id AS id, url_path, title, subtitle, LEFT(text, 300) AS text, path FROM news 
                    JOIN pictures ON pictures.news_id = news.news_id
                    JOIN index_homepage ON index_homepage.news_id = news.news_id
                    ORDER BY index_homepage.index_id DESC` 
    connection.promise().query(sqlQuery).then((result)=>{
        [newsList] = result
        let keys = Object.keys(newsList)
            res.render('overview', {
                chavesNoticias: keys, 
                listaNoticias: newsList,
                user: req.session.user
            })
    }).catch((err)=>{
        res.status(500).redirect(`/error?msg=${err}`)
    })
}

exports.updateOrder = (req,res)=>{
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
        res.status(200).json({
            status: 'Update order OK'
        })
    }).catch(()=>{
        res.status(500).json({
            status: 'Error order'
        })
    })
}