'use strict';

const bcrypt = require ('bcrypt');
const Joi = require('joi');
const mailgun = require("mailgun-js");
const mysqlPool = require('../../../database/mysql-pool')

// creamos una función para enviar emails a través de Mailgun (creamos una cuenta augustproject@yopmail.com para hacer pruebas)
async function sendEmail(email) {
    const mg = mailgun({
        apiKey: process.env.MyMailgun_apiKey,
        domain: process.env.MyMailgun_domain,
    });

    const data = {
        from: 'Registro AugustProject <altas@altas.mailgun.org>',
        to: email,
        subject: 'Alta confirmada en AugustProject',
        text: 'Te has registrado correctamente en AugustProject, puedes empezar a usarlo cuando quieras'
    };

    mg.messages().send(data, function (error, body) {
    if (error) {
        console.error('error', error);
    }
    console.log(body);
    });
}

// indicamos que valores tienen que cumplirse a la hora de validar los datos que nos van a llegar
async function validate(accountData) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().alphanum().min(3).max(30).required(),
    });

    Joi.assert(accountData, schema);
}


async function createAccount(req, res) {
    // hacemos una copia del req.body por seguridad
    const accountData = { ...req.body };
    console.log(req.body);
    // validamos los datos recibidos y en caso de no cumplir los requisitos devolvemos un código de estado 400 debido a que es percibido como un error del cliente
    try {
        await validate(accountData);
    } catch (e) {
        return res.status(400).send(e);
    }

    let connection = null;

    // pedimos una conexión al pool
    try {
        connection = await mysqlPool.getConnection();

        // transformamos las contraseñas para que no se puedan descifrar, el segundo parámetro usado es el número de vueltas, es un número que afectará al rendimiento del algoritmo bcrypt (10 vueltas es un buen balance entre seguridad/velocidad de cálculo)
        const securePassword = await bcrypt.hash(accountData.password, 10);

        // indicamos los datos para insertar en mysql
        const now = new Date();
        const user = {
            name: accountData.name,
            email: accountData.email,
            password: securePassword,
            created_at: now,
        };
        // insertamos los datos en mysql
        await connection.query('INSERT INTO users SET ?', user);
        connection.release();
        // si la petición ha sido completada y ha resultado en la creación de un nuevo registro enviamos un código de estado 201 created
        res.status(201).send({
            message:`cuenta creada correctamente`
        });

        // si todo va bien, enviamos un email a la cuenta que nos indique el usuario para confirmar el alta
        return sendEmail(accountData.email);
        
    } catch (e) {
        // indicamos que si la conexión es distinta de nulo, se libere
        if (connection !== null) {
            connection.release();
        }
        console.error(e);
        // si el usuario existe, porque existe un email igual, enviamos un error de conflicto
        if (e.code === 'ER_DUP_ENTRY') {
            return res.status(409).send();
        }
        // si falla la conexion con la base de datos enviamos este error
        return res.status(500).send(e);
    }
};
module.exports = createAccount;