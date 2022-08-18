'use strict';

const Joi = require('joi');
const mysqlPool = require('../../../database/mysql-pool');

async function validate(payload) {
  const schema = Joi.object({
    name: Joi.string().max(255).required()
  });

  Joi.assert(payload, schema);
}

async function updateUser(req, res) {
  const { userId } = req.claims;
  const name = req.body.name;

  // Validar datos
  try {
    const payload = {
      name,
    };

    await validate(payload);
  } catch (e) {
    return res.status(400).send({
      message: `Debes introducir un NOMBRE que no exceda de los 255 caracteres`
    });
  }

  // Actualizar datos usuario
  let connection = null;
  const query = `UPDATE users
    SET name = ?
    WHERE id = ?`;

  try {
    connection = await mysqlPool.getConnection();
    await connection.query(query, [name, userId]);
    connection.release();
    return res.status(200).send({
      message:`Nombre de usuario modificado correctamente`
    });
  } catch (e) {
    if (connection) {
      connection.release();
    }
    console.log(e);
    return res.status(500).send({
      message: `Hemos encontrado una condición inesperada que impide completar la petición, rogamos lo intente en otro momento`
    });
  }
}

module.exports = updateUser;
