'use strict'

const fs = require("fs/promises");
const path = require("path");
const Joi = require('joi');
const sharp = require('sharp');
const uuidv4 = require('uuid').v4;
const mysqlPool = require('../../../database/mysql-pool');

// marcamos los tipos de formato de imagenes que vamos a aceptar
const validFormats = ['jpg', 'jpeg','png', 'tiff', 'bmp'];
const maxImageWidth = 1000;

// mainFolder nos indica la ruta en la que tenemos augustproject
const mainFolder = process.cwd();

// definimos la ruta en la que queremos que se almacenen las imágenes en el disco duro
const recommendationFolder = path.join(mainFolder, 'public', 'upload', 'recommendation');

async function validate(values) {
    const schema = Joi.object({
        title: Joi.string().required(),
        category: Joi.string().required(),
        place: Joi.string().required(),
        intro: Joi.string().required(),
        content: Joi.string().required(),
        photo: Joi.string().required(),
        //file: Joi.any().required()
    });

    Joi.assert(values, schema);
}

async function createRecommendation(req, res){
    const userId = req.claims.userId;
    const file = req.file;
    const title = req.body.title;
    const category = req.body.category;
    const place = req.body.place;
    const intro = req.body.intro;
    const content = req.body.content;
    const photo = req.body.photo;


    try {
        const recommendationData = {
            title,
            category,
            place,
            intro,
            content,
            photo,
        };
        await validate(recommendationData);
    } catch(e) {
        return res.status(400).send(e);
    }
    
    // validamos la imagen consultando si no hay archivo o si lo hay pero está vacío.
    if(!file || !file.buffer){
        res.status(400).send({
            message: 'Invalid file'
        });
    };

    // declaramos esta variable para indicar cual va a ser el nombre de la foto
    let imageFileName = null;
try{
    //almacenamos los datos en un espacio de memoria mientras se transfieren del dispositivo de entrada al de salida
    const image = sharp(file.buffer);

    //sharp nos devuelve los metadatos de la foto, y ello nos va a permitir validar que cumpla los requisitos que hemos indicado a la imagen.
    const metadata = await image.metadata();
    console.log(metadata.format);
    if(!validFormats.includes(metadata.format)) {
        return res.status(400).send(`Error, image format must be: ${validFormats}`);
    }
    if(metadata.width > maxImageWidth){
        image.resize(maxImageWidth);
    }

    // utilizamos uuid para generar un string aleatorio con el que nombrar a las imágenes que recibamos y lo concatenamos con la extensión de la imagen
    imageFileName = `${uuidv4()}.${metadata.format}`

    // indicamos la carpeta destino en la que se van a guardar las imagenes subidas por cada usuario
    const imageUpload = path.join(recommendationFolder, userId.toString());

    // en el caso de que no existan las carpetas de destino, hacemos que sólo la primera vez se creen con el {recursive: true}
    await fs.mkdir(imageUpload, {recursive: true});

    // añadimos la imagen a la carpeta correspondiente con el nombre aleatorio
    await image.toFile(path.join(imageUpload,imageFileName));
}catch (e){
    return res.status(500).send({
        message: `Error creating folder to store the image: ${e.message}`
    })

}
// introducimos la recommendation en mysql
let connection = null;
try{
    const now = new Date();
    const recommendation = {
        title,
        category,
        place,
        intro,
        content,
        photo: imageFileName,
        created_at: now,
        user_id: userId,
    }

    //pedimos una conexion al pool de conexiones
    connection = await mysqlPool.getConnection();

    // para insertar los datos no es necesario utilizar el SET, pero es muy práctico porque nos permite introducir un objeto
    await connection.query('INSERT INTO recommendations SET ?', recommendation)

    // liberamos la conexión al utilizarla
    connection.release();
    return res.status(201).send({
    message:`recomendacion creada`
    });
}catch(e){
    console.log(e);
    return res.status(500).send(e.message);

};
};

module.exports = createRecommendation;



