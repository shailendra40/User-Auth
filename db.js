// const { Pool } = require('pg');
// const dotenv = require('dotenv');

// dotenv.config();

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,
// });

// const connect = async () => {
//     try {
//         await pool.connect();
//         console.log('Connected to the database');
//     } catch (error) {
//         console.error('Error connecting to the database:', error.message);
//     }
// };

// module.exports = { pool, connect };
