'use strict'

const mysqlPool = require('../../../database/mysql-pool');

async function getDetailRecommendation(req,res){
    let connection = null;

    // mediante destructuring sacamos el dato id de los path parameters
    const {id} = req.params;
    try{
        // establecemos una conexión con el Pool y seleccionamos los datos que queremos mostrar al elegir el id de la recommendation
        connection = await mysqlPool.getConnection();
        const [result] = await connection.execute("SELECT title, category, place, intro, content, created_at FROM recommendations WHERE id = ?", [id]);

        //liberamos la conexión
        connection.release();
        return res.send(result);
    }catch(e){
        console.error(e);
        return res.status(500).send(e.message);
    }
};

module.exports = getDetailRecommendation;