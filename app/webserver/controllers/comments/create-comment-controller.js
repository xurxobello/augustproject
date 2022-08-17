'use strict';

const Joi = require('joi');
const mysqlPool = require('../../../database/mysql-pool');

async function validate(payload) {
  const schema = Joi.object({
    recommendationId: Joi.number().integer().positive().required(),
    content: Joi.string().max(3000).required(),
  });

  Joi.assert(payload, schema);
}

async function createComment(req, res) {
  const recommendationId = req.params.recommendationId;
  const content = req.body.content;
  const userId = req.claims.userId;

  try {
    const commentData = {
      content,
      recommendationId,
    };

    await validate(commentData);
  } catch (e) {
    console.error(e);
    return res.status(400).send({
      message: `Debes introducir obligatoriamente un COMENTARIO que no exceda los 3000 caracteres`
    });
  }

  let connection = null;
  try {
    connection = await mysqlPool.getConnection();
    const query = `INSERT INTO comments SET ?`;
    await connection.query(query, {
      content: content,
      user_id: userId,
      recommendation_id: recommendationId,
    });
    connection.release();

    
    return res.status(201).send({
      message: `Comentario creado correctamente`
    });
  } catch (e) {
    if (connection) {
      connection.release();
    }

    return res.status(500).send({
      message: `Hemos encontrado una condición inesperada que impide completar la petición, rogamos lo intente en otro momento`
    });
  }
}

module.exports = createComment;