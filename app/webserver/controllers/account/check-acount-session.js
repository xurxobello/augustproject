'use strict';

const jwt = require('jsonwebtoken');

const authJwtSecret = process.env.SECRET;

async function checkAccountSession(req, res, next) {


  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send();
  }

  const [prefix, token] = authorization.split(' ');//por convencion en temas de autorizaciones se pone bearer delante,sin mas
  if (prefix !== 'Bearer' || !token) { 
    return res.status(401).send();
  }
  
 
  try {
    const payload = jwt.verify(token, authJwtSecret);//verifica token y codigo secreto

    console.log(`userId: ${payload.userId}`);
    
//los datos entre midlewares se pasan en la req,es decir req.algo,puede ser claims como otra cosa,en este caso se guarda en claims el userid
    req.claims = {
      userId: payload.userId
     
    };

    return next();
  } catch (e) {
    console.error(e);
    return res.status(401).send();
  }
}

module.exports = checkAccountSession;