const connection = require('../../db/setup').connection
const {check, validationResult} = require('express-validator')


exports.createNews = (req, res)=>{
    
    const sqlQuery = "SELECT author_id, name FROM authors"
    connection.promise().query(sqlQuery).then((result)=>{
        const [dados] = result
        res.render('newpost', {
            authorsList: dados,
            erro: req.query.error,
            user: req.session.user
        })
    }).catch((err)=>{
        res.status(500).redirect(`/news/error?msg=${err}`)
    })
}

exports.publishNews = (req, res)=>{
        
    //.....Validation Error.............
    const errors = validationResult(req)
    if(!errors.isEmpty()){ 
        res.status(500).json({
            status: 'Error fields'
        })
        return
    }

    //....DB...........................
    let currentDate = new Date().toJSON().slice(0, 10);
    let {urlpath, cardsize, title, subtitle, text, locality, author, picture, picturedescription} = req.body
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
        res.status(200).json({
            status: 'DB add news OK'
        })
    }).catch((err)=>{
        res.status(500).json({
            status: err
        })
    })
}

exports.deleteNews = (req,res)=>{
    const idNewsToRemove = req.params.newsID
    const queryPictures = `DELETE FROM pictures WHERE (pictures.news_id = '${idNewsToRemove}')`
    const queryIndex = `DELETE FROM index_homepage WHERE (index_homepage.news_id = '${idNewsToRemove}')`
    const queryNews = `DELETE FROM news WHERE (news.news_id='${idNewsToRemove}')`

    connection.promise().query(queryPictures).then(()=>{
        return connection.promise().query(queryIndex)
    }).then(()=>{
        return connection.promise().query(queryNews)
    }).then(()=>{
        res.status(200).json({
            status: 'Deleted'
        })
    }).catch((err)=>{
        res.status(500).json({
            status: err
        })
    })
}

exports.loadEditNews = (req,res)=>{
    
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
        res.render('editpost', {
            user: req.session.user,
            data: newsData,
            authorsList,
            erro: req.query.error
        })
    }).catch((err)=>{
        res.status(500).redirect(`/news/error?msg=${err}`)
    })
}

exports.updateNews = (req,res)=>{

    // Caso tenha erro de preenchimento
    const errors = validationResult(req)
    if(!errors.isEmpty()){ 
        res.status(500).json({
            status: 'Error fields'
        })
        return
    }

    //DB
    let {id, urlpath, cardsize, title, subtitle, text, locality, author, picturedescription} = req.body.data
    const queryNews =  `UPDATE news
                            SET url_path = '${urlpath}', 
                                card_size = '${cardsize}',
                                title = '${title}',
                                subtitle = '${subtitle}',
                                text = '${text}',
                                locality = '${locality}',
                                author_id = '${author}'
                            WHERE news.news_id = '${id}'`
    const queryPicture =   `UPDATE pictures
                                SET description = '${picturedescription}'
                                WHERE pictures.news_id = '${id}'`
    connection.promise().query(queryNews).then(()=>{
        return connection.promise().query(queryPicture)
    }).then(()=>{
        res.status(200).json({
            status: 'Updated'
        })
    }).catch((err)=>{
        res.status(500).json({
            status: 'Failed'
        })
    })
}