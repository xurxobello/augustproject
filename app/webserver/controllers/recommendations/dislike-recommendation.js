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


  //Validar datos
  try {
    const datosAvalidar = {
      recommendation_id: recomId,
    };
    await validate(datosAvalidar);
  } catch (e) {
    return res.status(400).send({
      message: `Debes introducir un ID de RECOMENDACIÓN que sea un número entero y positivo`
    });
  }

  // Eliminar fila de la tabla likes
  let connection = null;
  try {
    const query = `DELETE FROM likes WHERE user_id = ? AND recommendation_id = ?`;
    connection = await mysqlPool.getConnection();
    const [result] = await connection.execute(query, [userId, recomId]);
    connection.release();

    if (result.affectedRows === 0){
        return res.status(403).send({
            message: `Este comentario no te gustaba`
        });
    }else{
    return res.status(200).send({
        message:`Ha dejado de gustarte`
        });
    }
  } catch (e) {
    if (connection) {
      connection.release();
    }
    console.error(e);
    return res.status(500).send({
      message: `Hemos encontrado una condición inesperada que impide completar la petición, rogamos lo intente en otro momento`
    });
  }
}

module.exports = dislikeRecom;
