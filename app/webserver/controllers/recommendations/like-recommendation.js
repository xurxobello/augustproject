'use strict';

const Joi = require('joi');
const mysqlPool = require('../../../database/mysql-pool');

async function validate(payload) {
  const schema = Joi.object({
    recommendationId: Joi.number().integer().positive().required(),
  });

  Joi.assert(payload, schema);
}

async function likeRecom(req, res) {
  const { userId } = req.claims;
  const {recommendationId }= req.params;

  // Validar datos
  try {
    const datosAvalidar = {
    recommendationId,
    };
    await validate(datosAvalidar);
  } catch (e) {
    return res.status(400).send({
      message: `Debes introducir un ID de RECOMENDACIÓN que sea un número entero y positivo`
    });
  }

  // Insertar datos en table like
  let connection = null;
  try {
    const query = `INSERT INTO likes SET ?`;

    const likeData = {
      user_id: userId,
      recommendation_id: recommendationId
    };

    connection = await mysqlPool.getConnection();
    await connection.query(query, likeData);
    connection.release();

    return res.status(201).send({
        message:`Te gusta`
        });

  } catch (e) {
    if (connection) {
      connection.release();
    }

    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(201).send({
        message: `Te gusta fue creado`
      });
    }

    console.error(e);
    return res.status(500).send({
      message: `Hemos encontrado una condición inesperada que impide completar la petición, rogamos lo intente en otro momento`
    });
  }

}

module.exports = likeRecom;
