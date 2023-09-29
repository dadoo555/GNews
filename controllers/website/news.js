const connection = require('../../db/setup').connection

exports.loadHomepage = (req,res) => {

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
            user: req.session.user
        })
    }).catch((err)=>{
        res.status(500).redirect(`/news/error?msg=${err}`)
    })
}

exports.loadSingleNews = (req,res) => {

    let sqlQuery = `SELECT url_path, title, subtitle, text, date, locality, description, path, name AS author_name 
                    FROM news 
                    JOIN pictures ON pictures.news_id = news.news_id
                    JOIN authors ON news.author_id = authors.author_id
                    WHERE url_path = '${req.params.newsID}'`
    connection.promise().query(sqlQuery).then((result)=>{
        let [singleNews] = result[0]
        res.status(200).render('news', {
            newsData: singleNews,
            user: req.session.user
        })
    }).catch((err)=>{
        res.status(500).redirect(`/news/error?msg=${err}`)
    })
}