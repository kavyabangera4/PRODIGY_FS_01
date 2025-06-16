// db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employee_management' // change if your DB name is different
});

db.connect((err) => {
    if (err) {
        console.error("DB connection failed: " + err.stack);
        return;
    }
    console.log("MySQL Connected...");
});

module.exports = db;
