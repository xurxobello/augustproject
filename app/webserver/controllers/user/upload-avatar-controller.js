'use strict';

const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const mysqlPool = require('../../../database/mysql-pool');

/**
 * El usuario va a subir su foto de avatar Y la vamos a almacenar en el disco duro
 * concretamente en la ruta public/uploads/users/$userId/avatar.[jpeg|png]
 */
 const PROJECT_MAIN_FOLDER_PATH = process.cwd();
 const AVATAR_FOLDER_PATH = path.join(PROJECT_MAIN_FOLDER_PATH, 'public', 'uploads', 'avatar');
 const AVATAR_VALID_FORMATS = ['jpeg', 'png','jpg','tiff','bmp'];
 
 



async function uploadAvatar(req, res) {
  console.log('uploadAvatar req.headers', req.headers);
  console.log('req.claims', req.claims);
  console.log('req.file', req.file);

  const file = req.file;
  const userId = req.claims.userId;

  /**
   * 1. Validar datos
   * 2. Almacenar la imagen en disco duro
   * 3. Actualizar usuario para indicar el avatar que tiene ahora
   */

  // 1. validar datos
  if (!file || !file.buffer) {
    return res.status(400).send({
      message: 'invalid image',
    });
  }

  // 2.1 crear el directorio si no existe: public/uploads/users/$userId
  const imageUploadPath = path.join(AVATAR_FOLDER_PATH, userId.toString());

  try {
    // recursive true creará todas las carpetas de la ruta si no existen y no dará error
    await fs.mkdir(imageUploadPath, { recursive: true });
  } catch (e) {
    return res.status(500).send(`Error creating folder to store the avatar: ${e.message}`);
  }

  /**
   * 2.2 Pasamos la imagen a sharp para que la analice y comprobaremos
   * si tenemos que redimensionarla o no
   * Y antes de nada generamos un nombre aleatorio para la imagen que usaremos más adelante
   */
  let imageFileName = null;
  try {
    const image = sharp(file.buffer);
    const metadata = await image.metadata();



     
    if (!AVATAR_VALID_FORMATS.includes(metadata.format)) {
      return res.status(400).send(`Error, image format must be one of: ${AVATAR_VALID_FORMATS}`);
    }

    if (metadata.width > 200) {
      image.resize(200);
    }

    imageFileName = `avatar.${metadata.format}`;
    await image.toFile(path.join(imageUploadPath, imageFileName));
  } catch (e) {
    return res.status(500).send(`Error analyzing image: ${e.message}`);
  }

  // 3. Actualizar usuario para decirle que tiene avatar
  // UPDATE users SET avatar = '${imageFileName} WHERE id = ${userId}';
  let connection;
  try {
    const sqlQuery = `UPDATE users
      SET avatar = ?
      WHERE id = ?`;
    connection = await mysqlPool.getConnection();
    await connection.execute(sqlQuery, [imageFileName, userId]);
    connection.release();

    // const imageUrl = `${process.env.HTTP_SERVER_DOMAIN}/uploads/users/${userId}/${imageFileName}`;
    res.header('Location', `${process.env.HTTP_SERVER_DOMAIN}/uploads/users/${userId}/${imageFileName}`);
    return res.status(201).send(); // 201 Created -> recurso creado
  } catch (e) {
    if (connection) {
      connection.release();
    }

    console.error(e);
    return res.status(500).send(e.message);
  }
}

module.exports = uploadAvatar;
