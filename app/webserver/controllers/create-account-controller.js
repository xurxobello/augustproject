'use strict';

const Joi = require('joi');
const mysqlPool = require('../../database/mysql-pool')

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

    // pedimos una conexión al pool e indicamos los datos para insertar en mysql
    try {
        connection = await mysqlPool.getConnection();
        const user = {
            name: accountData.name,
            email: accountData.email,
            password: accountData.password,
        };
        // insertamos los datos en mysql
        await connection.query('INSERT INTO users SET ?', user);
        connection.release();
        // si la petición ha sido completada y ha resultado en la creación de un nuevo registro:
        return res.status(201).send();
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