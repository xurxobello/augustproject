'use strict';

const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken'); // generar tokens de sesión seguros
const mysqlPool = require('../../../database/mysql-pool');

const authJwtSecret = process.env.SECRET;//codigo secreto en .env
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;//tiempo en el que expira el token en el .env

async function validate(payload) {
  const schema = Joi.object({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().alphanum().min(3).max(30).required(),
  });
  
  Joi.assert(payload, schema);
}

async function login(req, res) {

  const accountData = { ...req.body };

  try {
    await validate(accountData);
  } catch (e) {
    return res.status(400).send({
      message: `Debes introducir obligatoriamente un EMAIL que no exceda de los 255 caracteres y una CONTRASEÑA que sea alfanumérica y tenga entre 3 y 30 caracteres`
    });
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
      return res.status(401).send({
        message: `No autorizado, estás intentando acceder a una página que requiere iniciar sesión con un usuario y contraseña válidos`
      });
    }

    const user = rows[0];
    
    // Miramos si la password es correcta
    const isPasswordOk = await bcrypt.compare(accountData.password, user.password);

    if (isPasswordOk === false) {
      return res.status(401).send({
        message: `No autorizado, estás intentando acceder a una página que requiere iniciar sesión con un usuario y contraseña válidos`
      });
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
    
    return res.status(500).send({
      message: `Hemos encontrado una condición inesperada que impide completar la petición, rogamos lo intente en otro momento`
    });
  }
}

module.exports = login;
