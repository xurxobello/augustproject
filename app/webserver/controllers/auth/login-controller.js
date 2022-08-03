'use strict';

const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken'); // generar tokens de sesión seguros
const mysqlPool = require('../../../database/mysql-pool');

const authJwtSecret = process.env.SECRET;//codigo secreto en .env
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;//tuempo en el que expira el token en el .env

async function validate(payload) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().alphanum().min(3).max(30).required(),
  });
  
  Joi.assert(payload, schema);
}

async function login(req, res, next) {
  console.log('login-controller', req.atributoInventado);
  

  const accountData = { ...req.body };

  try {
    await validate(accountData);
  } catch (e) {
    return res.status(400).send(e);
  }

  
  const sqlQuery = `SELECT id, email, password, avatar
    FROM users
    WHERE email = '${accountData.email}'`;
  
  let connection = null;

  try {
    connection = await mysqlPool.getConnection();
    const [rows] = await connection.query(sqlQuery);
    connection.release();

    //tiene que ser igual a 1 porque no puede haber 2 usuarios iguales
    if (rows.length !== 1) {
      return res.status(401).send();
    }

    const user = rows[0];
    
    // 2.1 Miramos si la password es correcta
    const isPasswordOk = await bcrypt.compare(accountData.password, user.password);

    if (isPasswordOk === false) { // !isPasswordOk
      return res.status(401).send();
    }
//metemos en el payload el id
    const payloadJwt = {
      userId: user.id
      
    };
//sacamos token
    const token = jwt.sign(payloadJwt, authJwtSecret, { expiresIn: jwtExpiresIn });

    const userSession = {
      accessToken: token,
      avatar: `${process.env.HTTP_SERVER_DOMAIN}/uploads/users/${user.id}/${user.avatar}`,
      expiresIn: jwtExpiresIn,
    };

 

    res.send(userSession);
  } catch (e) {
    if (connection !== null) {
      connection.release();
    }

    console.error(e);
    
    return res.status(500).send(e);
  }
}

module.exports = login;
