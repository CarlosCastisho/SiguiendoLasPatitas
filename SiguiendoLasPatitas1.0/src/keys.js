require('dotenv-flow').config();

module.exports = {
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            rejectUnauthorized: false
        } 
        // host: process.env.DB_HOST,
        // user: process.env.DB_USER,
        // password: process.env.DB_PASSWORD,
        // database: process.env.DB_NAME
    }
};
