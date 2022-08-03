"use strict"

const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken'); // generar tokens de sesión seguros
const mysqlPool = require('../../database/mysql-pool');



async function validate(payload) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().alphanum().min(3).max(30).required(),
    });
    
    Joi.assert(payload, schema);
  }


  //lee datos en base de datos recibiendo id

  const getUserById = async (id) => {
    let connection;
  
    try {
      connection = await getConnection();
  
      const [result] = await connection.query(
        `
        SELECT id, email, created_at FROM users WHERE id = ?
      `,
        [id]
      );
  
      if (result.length === 0) {
        throw generateError('No hay ningún usuario con esa id', 404);
      }
  
      return result[0];
    } finally {
      if (connection) connection.release();
    }
  };








//lee datos en base de datos recibiendo email
  const getUserByEmail = async (email) => {
    let connection;
  
    try {
      connection = await getConnection();
  
      const [result] = await connection.query(
        `
        SELECT * FROM users WHERE email = ?
      `,
        [email]
      );
  
      if (result.length === 0) {
        throw generateError('No hay ningún usuario con ese email', 404);
      }
  
      return result[0];
    } finally {
      if (connection) connection.release();
    }
  };













const loginController = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        throw generateError('Debes enviar un email y una password', 400);
      }
      const emailPass = { ...req.body };

  try {
    await validate(emailPass);
  } catch (e) {
    return res.status(400).send(e);
  }
    
  
      // Recojo los datos de la base de datos del usuario con ese mail
      const user = await getUserByEmail(email);
  
      // Compruebo que las contraseñas coinciden
      const validPassword = await bcrypt.compare(password, user.password);
  
      if (!validPassword) {
        throw generateError('La contraseña no coincide', 401);
      }
  
      // Creo el payload del token
      const payload = { id: user.id };
  
      // Firmo el token
      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: '30d',
      });
  
      // Envío el token
      res.send({
        status: 'ok',
        data: token,
      });
    } catch (error) {
      next(error);
    }
  };








/* 
leer email

  const getUserController = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const user = await getUserById(id);
  
      res.send({
        status: 'ok',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
 */





  
  module.exports = {
    /* newUserController, */
    getUserController,
    loginController,
  };
  