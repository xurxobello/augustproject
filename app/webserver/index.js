'use strict';

const express = require('express');
const accountRouter = require('./routes/account-routes');

const app = express();

// utilizamos este middleware para detectar si vienen req.body con el formato JSON
app.use(express.json());

// definimos la ruta que queremos que el usuario introduzca e indicamos la función controladora
app.use('/api', accountRouter);


// creamos un método que arranque el servidor, no realizamos un try catch porque ya lo gestionamos desde el index principal al llamarlo
async function listen(port) {
    const server = await app.listen(port);
    return server;

};

// exportamos el objeto listen
module.exports = {
    listen,
};