'use strict'

const Chance = require('chance');
const dotenv = require("dotenv");
const mysql = require('mysql2/promise');

const chance = new Chance();
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

    // Utilizamos chance para introducir datos aleatorios en mysql, puede que dé error a la hora de introducir los likes si se da la casualidad de que coincida algún usuario dando like a una misma recomendación, en cuyo caso a la hora de introducir los datos en mysql introducirá datos en la tabla likes hasta ese momento, sino si se vuelve a ejecutar este archivo borrará e introducirá datos de nuevo.
    const FAKE_USERS = 20;

    for (let index = 0; index < FAKE_USERS; index++) {
        await connection.query(`INSERT INTO users(name, email, password, created_at) VALUES(?, ?, ?, ?)`,
            [
            chance.name(),
            chance.email(),
            chance.string({ length: 10, alpha: true, numeric: true }),
            chance.date({ year: 2022 }),
            ]
        );
    };

    const FAKE_RECOMMENDATIONS = 30;

    for (let index = 0; index < FAKE_RECOMMENDATIONS; index++) {
        await connection.query(`INSERT INTO recommendations(title, category, place, intro, content, photo, created_at, user_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
            [
            chance.sentence({ words: 7 }),
            chance.sentence({ words: 2 }),
            chance.string({length: 10}),
            chance.sentence({ words: 10 }),
            chance.paragraph({ sentences: 15 }),
            `${chance.string({length: 15})}.jpg`,
            chance.date({ year: 2022 }),
            chance.integer({ min: 1, max: FAKE_USERS }),
            ]
        );
    };

    const FAKE_COMMENTS = 40;

    for (let index = 0; index < FAKE_COMMENTS; index++) {
        await connection.query(`INSERT INTO comments(content, created_at, user_id, recommendation_id) VALUES(?, ?, ?, ?)`,
            [
            chance.sentence({ words: 20 }),
            chance.date({ year: 2022 }),
            chance.integer({ min: 1, max: FAKE_USERS }),
            chance.integer({ min: 1, max: FAKE_RECOMMENDATIONS }),
            ]
        );
    };

    const FAKE_LIKES = 20;

    for (let index = 0; index < FAKE_LIKES; index++) {
        await connection.query(`INSERT INTO likes(user_id, recommendation_id) VALUES(?, ?)`,
            [
            chance.integer({ min: 1, max: FAKE_USERS }),
            chance.integer({ min: 1, max: FAKE_RECOMMENDATIONS }),
            ]
        );
    };

    process.exit(0);
    //En caso de que haya un error lo lanzamos
    } catch (error) {
    console.error(error);
    process.exit(1);
    }
}

main();