'use strict';

const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const mysqlPool = require('../../../database/mysql-pool');

  // El usuario va a subir su foto de avatar Y la vamos a almacenar en el disco duro, concretamente en la ruta public/upload/users/$userId/avatar.[AVATAR_VALID_FORMATS]

const PROJECT_MAIN_FOLDER_PATH = process.cwd();
const AVATAR_FOLDER_PATH = path.join(PROJECT_MAIN_FOLDER_PATH, 'public', 'upload', 'avatar');
const AVATAR_VALID_FORMATS = ['jpeg', 'png', 'jpg','tiff','bmp'];

async function uploadAvatar(req, res) {

  const file = req.file;
  const userId = req.claims.userId;

  // Validar datos
  if (!file || !file.buffer) {
    return res.status(400).send({
      message: `Debes introducir un archivo válido con formato: ${AVATAR_VALID_FORMATS}`,
    });
  }

  // Crear el directorio si no existe: public/upload/users/$userId
  const imageUploadPath = path.join(AVATAR_FOLDER_PATH, userId.toString());

  try {
    // recursive true creará todas las carpetas de la ruta si no existen y no dará error
    await fs.mkdir(imageUploadPath, { recursive: true });
  } catch (e) {
    return res.status(500).send({
      message: `Hemos encontrado una condición inesperada que impide completar la petición, rogamos lo intente en otro momento`
    });
  }

  let imageFileName = null;
  let metadata = null;
  let image = null;
  
  // Pasamos la imagen a sharp para que la analice y comprobaremos si tenemos que redimensionarla o no
  // con el siguiente try lanzamos un error en caso de que no sea una imagen lo que sube el usuario
  try {
    image = sharp(file.buffer);
    metadata = await image.metadata();
  }catch(e){
    return res.status(400).send({
      message: `Debes introducir un archivo válido con formato: ${AVATAR_VALID_FORMATS}`
    });
  };

  // con el siguiente try lanzamos un error 400 en caso de que el usuario suba una imagen con un formato distinto a los aceptados o un 500 si falla el redimensionamiento o al guardar el archivo en el disco duro
  try{
    if (!AVATAR_VALID_FORMATS.includes(metadata.format)) {
      return res.status(400).send({
        message: `Debes introducir un archivo válido con formato: ${AVATAR_VALID_FORMATS}`
      });
    }
    if (metadata.width > 200) {
      image.resize(200);
    }
    // Generamos un nombre para la imagen que usaremos más adelante
    imageFileName = `avatar.${metadata.format}`;
    await image.toFile(path.join(imageUploadPath, imageFileName));
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: `Hemos encontrado una condición inesperada que impide completar la petición, rogamos lo intente en otro momento`
    });
  }

  // Actualizar usuario para decirle que tiene avatar
  let connection;
  try {
    const sqlQuery = `UPDATE users
      SET avatar = ?
      WHERE id = ?`;
    connection = await mysqlPool.getConnection();
    await connection.execute(sqlQuery, [imageFileName, userId]);
    connection.release();

    // const imageUrl = `${process.env.HTTP_SERVER_DOMAIN}/upload/users/${userId}/${imageFileName}`;
    res.header('Location', `${process.env.HTTP_SERVER_DOMAIN}/upload/users/${userId}/${imageFileName}`);
    return res.status(201).send({
      message: `Imagen de avatar guardada correctamente`
    });
  } catch (e) {
    if (connection) {
      connection.release();
    }

    console.error(e);
    return res.status(500).send({
      message: `Hemos encontrado una condición inesperada que impide completar la petición, rogamos lo intente en otro momento`
    });
  }
}

module.exports = uploadAvatar;
