'use strict'

const mysqlPool = require('../../../database/mysql-pool');

async function getPlaceOrCategoryRecommendations(req, res){
    let connection = null;
    
    // mediante destructuring obtenemos el dato filter y orderByLikes de los query parameters
    let {filter} = req.query;
    let {orderByLikes} = req.query;

    // si no se introduce filter, indicamos que se muestren todas las recommendations
    if (!filter)
        filter = "%";

    // si se intruduce filter, indicamos que se muestre todo lo que contenga al mismo
    else
        filter = `%${filter}%`;

    console.log(req.query);
    try{
        // establecemos una conexión con el Pool
        connection = await mysqlPool.getConnection();
        
        let result = null;

        // seleccionamos los datos que queremos enseñar en la búsqueda y los filtros por los que se puede realizar la misma en el caso de que no se ordenen por likes, mostrando primero los más recientes
        if (!orderByLikes) {
            result = await connection.execute("SELECT title, category, place, intro, content, created_at FROM recommendations WHERE place LIKE ? OR category LIKE ? ORDER BY created_at DESC", [filter, filter]);
        }

        // seleccionamos los datos que queremos enseñar en la búsqueda y los filtros por los que se puede realizar la misma en el caso de que se ordenen por likes, mostrando primero los que más likes tengan
        else  {
            result = await connection.execute ("SELECT r.title, r.category, r.place, r.intro, r.content, r.created_at, COUNT(l.recommendation_id) AS totalLikes FROM recommendations r LEFT JOIN likes l ON r.id = l.recommendation_id WHERE place LIKE ? OR category LIKE ? GROUP BY r.id ORDER BY totalLikes DESC", [filter, filter]);
        }

        // liberamos la conexión
        connection.release();
        return res.send(result[0]);
    }catch(e){
        console.error(e);
        return res.status(500).send(e.message);
    }
}

module.exports = getPlaceOrCategoryRecommendations;