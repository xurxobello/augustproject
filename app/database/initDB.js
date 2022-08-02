'use strict'

const dotenv = require("dotenv");
const mysql = require('mysql2/promise');

dotenv.config();

const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    MYSQL_DATABASE,
} = process.env;


async function main() {
    try {
    //nos conectamos a la base de datos
    const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    port: MYSQL_PORT,
    database: MYSQL_DATABASE,
    timezone: 'Z',
    });
    console.log('Borrando tablas');
    // borramos las tablas creadas en la base de datos
    await connection.query('DROP TABLE IF EXISTS users, recommendations, comments, likes');

    console.log('Creando tablas');

    // creamos la tabla users
    await connection.query(`
        CREATE TABLE users(
        id INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password CHAR(60) NOT NULL,
        created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
        avatar VARCHAR(255) NULL
        );
    `);

        // creamos la tabla recommendations
    await connection.query(`
        CREATE TABLE recommendations(
        id INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        place VARCHAR(255) NOT NULL,
        intro VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        photo VARCHAR(255) NOT NULL,
        created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER UNSIGNED NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);

    // creamos la tabla comments
    await connection.query(`
        CREATE TABLE comments(
        id INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
        content VARCHAR(3000) NOT NULL,
        created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER UNSIGNED NOT NULL,
        recommendation_id INTEGER UNSIGNED NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (recommendation_id) REFERENCES recommendations(id)
        );
    `);

    // creamos la tabla likes porque es una relación M,N
    await connection.query(`
        CREATE TABLE likes(
        user_id INTEGER UNSIGNED NOT NULL,
        recommendation_id INTEGER UNSIGNED NOT NULL,
        PRIMARY KEY (user_id, recommendation_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (recommendation_id) REFERENCES recommendations(id)
        );
    `);
    process.exit(0);
    //En caso de que haya un error lo lanzamos
    } catch (error) {
    console.error(error);
    process.exit(1);
    }
}

main();