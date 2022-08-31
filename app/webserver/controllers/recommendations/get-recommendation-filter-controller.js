'use strict'

const mysqlPool = require('../../../database/mysql-pool');

// indicamos el número máximo de elementos que vamos a querer mostrar por página
const maxRecommendationsPerPage = 4;

async function getPlaceOrCategoryRecommendations(req, res){
    let connection = null;
    
    // mediante destructuring obtenemos el dato filter, que es por el que se va a poder realizar la búsqueda, y orderByLikes de los query parameters
    let {filter} = req.query;
    let {orderByLikes} = req.query;

    // obtenemos el valor de la página de los query parameters, convirtiéndolo en número, indicando que es en base decimal y en caso de que no se especifique nada nos muestre la página 1
    const page = parseInt(req.query.page, 10) || 1;

    // si no se introduce filter, indicamos que se muestren todas las recommendations
    if (!filter)
        filter = "%";

    // si se intruduce filter, indicamos que se muestre todo lo que contenga al mismo
    else
        filter = `%${filter}%`;//todo lo que tenga una parte del filtro

    // obtenemos los datos que vamos a omitir para empezar a partir de ese número, por ejemplo:
    // si queremos empezar en la página 1: ( 1 - 1 ) * maxRecommendationsPerPage = 0, por lo que comenzamos a mostrar resultados a partir del resultado siguiente al 0
    // si queremos empezar en la página 2: ( 2 - 1 ) * maxRecommendationsPerPage = 4, por lo que comenzamos a mostrar resultados a partir del resultado siguiente al 4
    const offset = (page - 1) * maxRecommendationsPerPage;

    try{
        // establecemos una conexión con el Pool
        connection = await mysqlPool.getConnection();
        
        // obtenemos el total de resultados de la búsqueda por el filtro que pongamos para poder hacer la paginación
        const [queryCountTotal] = await connection.execute(`SELECT COUNT(*) AS totalRecommendations FROM recommendations WHERE place LIKE ? OR category LIKE ?`, [filter, filter]);

        let result = null;

        // seleccionamos los datos que queremos enseñar en la búsqueda y los filtros por los que se puede realizar la misma en el caso de que no se ordenen por likes, mostrando primero los más recientes
        if (!orderByLikes) {
            result = await connection.execute(`SELECT title, category, place, intro, content, created_at FROM recommendations WHERE place LIKE ? OR category LIKE ? ORDER BY created_at DESC LIMIT ${maxRecommendationsPerPage} OFFSET ${offset}`, [filter, filter]);
        }

        // seleccionamos los datos que queremos enseñar en la búsqueda y los filtros por los que se puede realizar la misma en el caso de que se ordenen por likes, mostrando primero los que más likes tengan
        else  {
            result = await connection.execute (`SELECT r.title, r.category, r.place, r.intro, r.content, r.created_at, COUNT(l.recommendation_id) AS totalLikes FROM recommendations r LEFT JOIN likes l ON r.id = l.recommendation_id WHERE place LIKE ? OR category LIKE ? GROUP BY r.id ORDER BY totalLikes DESC LIMIT ${maxRecommendationsPerPage} OFFSET ${offset}`, [filter, filter]);
        }

        // liberamos la conexión
        connection.release();

        // declaramos el número total del recomendaciones obtenidas después de hacer el filtro
        const totalRecommendations = queryCountTotal[0].totalRecommendations

        // calculamos cual va a ser la última página. Math.ceil nos devuelve el número entero mayor o igual (en caso de ser negativo) más próximo a un número dado.
        const lastPage = Math.ceil(totalRecommendations / maxRecommendationsPerPage)

        // indicamos los datos que vamos a querer obtener al hacer la solicitud en postman. Math.ceil nos devuelve el número entero mayor o igual (en caso de ser negativo) más próximo a un número dado.
        let responseBody = null;
        
        // seleccionamos los datos que queremos enseñar en la búsqueda y los filtros por los que se puede realizar la misma en el caso de que se ordenen por likes, mostrando primero los que más likes tengan
        // Si no activan el oderByLikes mostramos los datos del if, sino los del else
        if (!orderByLikes) {
            responseBody = {
            totalRecommendations,
            lastPage,
            page,
            // creamos un enlace para ir a la primera página
            goToFirstPage: `http://${req.headers.host}/api/recommendations?filter=${req.query.filter}&page=${1}`,

            //Usamos un ternario para devolver la página anterior sólo si no es la primera y para devolver la página siguiente sólo si no es la última. OJO que el valor de la query (page) es un string!
            //${req.headers.host}
            prev: page > 1 ? `http://${req.headers.host}/api/recommendations?filter=${req.query.filter}&page=${+page-1}` : null,

            // Hay siguiente si no es la ultima
            next: page < lastPage ? `http://${req.headers.host}/api/recommendations?filter=${req.query.filter}&page=${+page+1}` : null,

            // creamos un enlace para ir a la última página
            goToLastPage: `http://${req.headers.host}/api/recommendations?filter=${req.query.filter}&page=${lastPage}`,

            recommendations: result[0],
            }
        } else  {
            responseBody = {
            totalRecommendations,
            lastPage,
            page,
            goToFirstPage: `http://${req.headers.host}/api/recommendations?filter=${req.query.filter}&orderByLikes=${req.query.orderByLikes}&page=${1}`,
            prev: page > 1 ? `http://${req.headers.host}/api/recommendations?filter=${req.query.filter}&orderByLikes=${req.query.orderByLikes}&page=${+page-1}` : null,

            next: page < lastPage ? `http://${req.headers.host}/api/recommendations?filter=${req.query.filter}&orderByLikes=${req.query.orderByLikes}&page=${+page+1}` : null,
            goToLastPage: `http://${req.headers.host}/api/recommendations?filter=${req.query.filter}&orderByLikes=${req.query.orderByLikes}&page=${lastPage}`,
            recommendations: result[0],
            }
        };

        return res.send(responseBody);
    }catch(e){
        console.error(e);
        return res.status(500).send({
            message: `Hemos encontrado una condición inesperada que impide completar la petición, rogamos lo intente en otro momento`
        });
    };
};

module.exports = getPlaceOrCategoryRecommendations;