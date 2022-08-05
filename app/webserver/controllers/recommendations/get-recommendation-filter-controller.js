'use strict'

const mysqlPool = require('../../../database/mysql-pool');

async function getPlaceOrCategoryRecommendations(req, res){
    let connection = null;
    
    // mediante destructuring sacamos el dato filter de los query parameters
    const {filter} = req.query;
    try{
        // establecemos una conexión con el Pool, seleccionamos los datos que queremos enseñar en la búsqueda y los filtros por los que se puede realizar la búsqueda
        connection = await mysqlPool.getConnection();
        const [result] = await connection.execute("SELECT title, category, place, intro, content, created_at FROM recommendations WHERE place = ? OR category = ?", [filter, filter]);
        
        // liberamos la conexión
        connection.release();
        return res.send(result);
    }catch(e){
        console.error(e);
        return res.status(500).send(e.message);
    }
}

module.exports = getPlaceOrCategoryRecommendations;