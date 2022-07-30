'use strict';

const Joi = require('joi');
const mysqlPool = require('../../database/mysql-pool')


async function validate(accountData) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().alphanum().min(3).max(30).required(),
    });

    Joi.assert(accountData, schema);
}


async function createAccount(req, res) {
    const accountData = { ...req.body };
    console.log(req.body);

    try {
        await validate(accountData);
    } catch (e) {
        return res.status(400).send(e);
    }

    let connection = null;

    try {
        connection = await mysqlPool.getConnection();
        const user = {
            name: accountData.name,
            email: accountData.email,
            password: accountData.password,
        };

        await connection.query('INSERT INTO users SET ?', user);
        connection.release();

        return res.status(201).send();
    } catch (e) {
        if (connection !== null) {
            connection.release();
        }
        console.error(e);

        if (e.code === 'ER_DUP_ENTRY') {
            return res.status(409).send();
        }

        return res.status(500).send(e);
    }
};
module.exports = createAccount;