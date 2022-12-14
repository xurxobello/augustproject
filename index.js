'use strict';

const dotenv = require("dotenv");
const mysqlPool = require('./app/database/mysql-pool');
const webServer = require('./app/webserver')

dotenv.config();

// declaramos las variable que vamos a definir en el archivo .env
const port = process.env.PORT;


if (!port) {
    console.error('PORT debe ser definido en el archivo .env');
    process.exit(1);
}

// llamamos a los módulos exportados
async function initApp() {
    try {
        await mysqlPool.connect();
        await webServer.listen(port);

        console.log(`Servidor escuchando en el puerto: ${port}`);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}
initApp();