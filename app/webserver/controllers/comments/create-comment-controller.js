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
      message: `Debes introducir un COMENTARIO que no exceda los 3000 caracteres`
    });
  }

  let connection = null;

  try{
    connection = await mysqlPool.getConnection();

    // hacemos una búsqueda para confirmar si existe o no la recomendación antes de hacer el comentario
    const [result] = await connection.execute("SELECT * FROM recommendations WHERE id = ?", [recommendationId]);
    connection.release();

    // result nos va a devolver un array que, en caso de estar vacío su longitud es 0, por lo cual esa recomendación no existe
    if (+result.length === 0){
      return res.status(404).send({
        message: `Recomendación no encontrada`
      });
    };
  }catch (e){
    if (connection) {
      connection.release();
    }
    return res.status(500).send({
      message: `Hemos encontrado una condición inesperada que impide completar la petición, rogamos lo intente en otro momento`
    });
  };

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