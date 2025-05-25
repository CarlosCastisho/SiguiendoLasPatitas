require('dotenv-flow').config();

module.exports = {
    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
        // host: 'localhost',
        // user: 'root',
        // password: '94546249_albert',
        // database: 'siguiendolaspatitas'
    }
};
