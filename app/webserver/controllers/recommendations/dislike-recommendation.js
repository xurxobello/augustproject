'use strict';

const Joi = require('joi');
const mysqlPool = require('../../../database/mysql-pool');

async function validate(payload) {
  const schema = Joi.object({
    recommendation_id: Joi.number().integer().positive().required(),
  });

  Joi.assert(payload, schema);
}

async function dislikeRecom(req, res) {
  const { userId } = req.claims;
  const recomId = req.params.recommendationId;

  /**
   * 1. Validar datos
   */
  try {
    const datosAvalidar = {
      recommendation_id: recomId,
    };
    await validate(datosAvalidar);
  } catch (e) {
    return res.status(400).send(e);
  }

  /**
   * 2. Eliminar fila de la tabla likes
   * // DELETE FROM likes WHERE user_id = ? AND post_id = ?
   */
  let connection = null;
  try {
    const query = `DELETE FROM likes WHERE user_id = ? AND recommendation_id = ?`;
    connection = await mysqlPool.getConnection();
    await connection.execute(query, [userId, recomId]);
    connection.release();

    return res.status(201).send({message:`dislike okey`});
  } catch (e) {
    if (connection) {
      connection.release();
    }

    console.error(e);
    return res.status(500).send(e.message);
  }
}

module.exports = dislikeRecom;
