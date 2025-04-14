const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

async function testConnection() {
    try{
        const[rows] = await pool.query('SELECT 1');
        console.log(`Connected to database : ${process.env.DB_NAME}`);
    }
    catch(err) {
        if(err.code === 'ER_BAD_DB_ERROR'){
            console.error('There was an error connecting to database server',err)
        }
        else {
            console.error(err)
        }
    }
}
testConnection();

module.exports = pool;