'use strict';

const dotenv = require("dotenv");
const mysql = require('mysql2/promise');

dotenv.config();
// declaramos las variables que vamos a definir en el archivo .env
const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    MYSQL_DATABASE,
} = process.env;

let pool = null;

// indicamos las opciones para la conexión, limitando las conexiones máximas a 10, para el pool e indicamos que las horas tienen que ir en UTC
async function connect() {
    const options = {
        connectionLimit: 10,
        host: MYSQL_HOST,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        port: MYSQL_PORT,
        database: MYSQL_DATABASE,
        timezone: 'Z',
    };

    //creamos un pool de conexiones pasando un objeto con las conexiones que hemos definido antes
    pool = mysql.createPool(options);

    // pedimos una conexión, que liberamos después de usarla y en caso de que de error que nos lo indique
    try {
        const connection = await pool.getConnection();
        connection.release();
    } catch (e) {
        console.error('mysql pool connect', e);
        throw e;
    }
}

// indicamos al pool que nos de una conexión y nos la devuelva, si el pool fuese null es que nos olvidamos de algo antes
async function getConnection() {
    if (pool === null) {
        throw new Error("MySQL connection didn't established. You must connect first.");
    }

    const connection = await pool.getConnection();

    return connection;
}

// para conectarnos a MySQL exportamos estos módulos que utilizaremos en el index principal
module.exports = {
    connect,
    getConnection,
};