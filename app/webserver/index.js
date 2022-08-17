'use strict';

const express = require('express');
const accountRouter = require('./routes/account-routes');
const authRouter = require('./routes/auth-router');//ruta al router del auth
const recommendationRouter = require ('./routes/recommendation-routes');
const userRouter = require('./routes/user-router');


const app = express();

// utilizamos este middleware para detectar si vienen req.body con el formato JSON
app.use(express.json());


//aqui lo que hacemos es decirle que delante de estas funciones controladoras tiene que ir siempre api.Por ejemplo accountRouter es /account,pues a esto se le hay que sumar /api

app.use('/api', accountRouter);
app.use('/api', authRouter);
app.use('/api', recommendationRouter);
app.use('/api', userRouter);
// creamos un middleware de 404 para el caso de que haya una petición y esta no caiga en ninguna ruta
app.use((req, res) => {
    res.status(404).send({
        message: 'Página no encontrada',
    });
});


// creamos un método que arranque el servidor, no realizamos un try catch porque ya lo gestionamos desde el index principal al llamarlo
async function listen(port) {
    const server = await app.listen(port);
    return server;

};

// exportamos el objeto listen
module.exports = {
    listen,
};