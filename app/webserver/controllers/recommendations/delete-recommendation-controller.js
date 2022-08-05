'use strict'

const Joi = require('joi');
const mysqlPool = require('../../../database/mysql-pool')

async function validate(values){

    // indicamos las características que va a tener que cumplir recommendationId
    const schema = Joi.object({
        // indicamos que el postId que vamos a recibir sea un número entero, positivo y obligatorio
        recommendationId: Joi.number().integer().positive().required(),
    });
    Joi.assert(values, schema);
}

async function deleteRecommendation (req,res){
    const {userId} = req.claims;
    const {recommendationId} = req.params;

    // validamos los datos introducidos anteriormente de debe cumplir el recommendationId
    try{
        const validateData = {
            recommendationId,
        };
        await validate(validateData);
    }catch (e){
        return res.status(400).send(e);
    };

    let connection = null;
    try {
    // nos conectamos al Pool y eliminamos los datos de la fila de la tabla recommendations que coincidan con el id de recomendación y el id de usuario.
    connection = await mysqlPool.getConnection();
    const [result] = await connection.execute("DELETE FROM recommendations WHERE id = ? AND user_id = ?", [recommendationId, userId]);

    // liberamos la conexión al pool
    connection.release();
    return res.status(200).send();
    } catch (e) {
    console.error(e);
    return res.status(500).send(e.message);
    }
};

module.exports=deleteRecommendation;