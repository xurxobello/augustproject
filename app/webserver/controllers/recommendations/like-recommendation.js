'use strict';

const Joi = require('joi');
const mysqlPool = require('../../../database/mysql-pool');

async function validate(payload) {
  const schema = Joi.object({
    recommendation_id: Joi.number().integer().positive().required(),
  });

  Joi.assert(payload, schema);
}

async function likeRecom(req, res) {
  const { userId } = req.claims;
  const {recommendationId }= req.params;

  /**
   * 1. Validar datos
   */
 /*  try {
    const datosAvalidar = {
    recommendationId,
    };
    await validate(datosAvalidar);
  } catch (e) {
    return res.status(400).send(e);
  }
 */
  /**
   * 2. Insertar datos en table like
   * // INSERT INTO likes(user_id, recommendation_id) VALUES ()
   */
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

    return res.status(201).send();
  } catch (e) {
    if (connection) {
      connection.release();
    }

    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(201).send();
    }

    console.error(e);
    return res.status(500).send(e.message);
  }

  res.send('voto correcto');
}

module.exports = likeRecom;
