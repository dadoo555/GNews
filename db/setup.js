const mySQL = require('mysql2')
const connection = mySQL.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'calendario',
    database: 'news_db',
    waitForConnections: true
})

connection.connect(function(err){
    if (err) throw err;
    console.log('Connected to News-database!')
    
})

module.exports = {connection: connection}