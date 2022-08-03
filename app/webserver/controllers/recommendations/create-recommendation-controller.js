'use strict'

const fs = require("fs/promises");
const path = require("path");
const Joi = require('joi');
const sharp = require('sharp');
const v4 = require('uuid').v4;

// marcamos los tipos de formato de imagenes que vamos a aceptar
const validFormats = ['jpg', 'jpeg','png', 'tiff', 'bmp'];
const maxImageWidth = 1000;

// mainFolder nos indica la ruta en la que tenemos augustproject
const mainFolder = process.cwd();

// definimos la ruta en la que queremos que se almacenen las imágenes en el disco duro
const recommendationFolder = path.join( mainFolder, 'public', 'upload', 'recommendation');

async function validate(recommendationData) {
    const schema = Joi.object({
        title: Joi.string().required(),
        category: Joi.string().required(),
        place: Joi.string().required(),
        intro: Joi.string().required(),
        content: Joi.string().required(),
        photo: Joi.string().required(),
        image: Joi.any().required()
    });

    Joi.assert(accountData, schema);
}

async function createRecommendation(req, res, next){
    
    const userId = req.claims.user.id;
    const file = req.file;
    const image = req.body.image //||null;


    
    // validamos la imagen consultando si no hay archivo o si lo hay pero está vacío (no encuentro forma de validarlo con JOI)
    if(!file || !file.buffer){
        res.status(400).send({
            message: 'invalid file'
        });
    };

    // declaramos esta variable para saber cual es el nombre de la foto
    let imageFileName = null;
try{
    //almacenamos los datos en un espacio de memoria mientras se transfieren del dispositivo de entrada al de salida
    image = sharp(file.buffer);

    //sharp nos devuelve los metadatos de la foto, y ello nos va a permitir validar que cumpla los requisitos que hemos indicado a la imagen.
    const metadata = await image.metadata();
    if(!validFormats.includes(metadata.format)) {
        return res.status(400).send(`Error, image format must be: ${validFormats}`);
    }
    if(metadata.width > maxImageWidth){
        image.resize(maxImageWidth);
    }

    // utilizamos uuid para generar un string aleatorio con el que nombrar a las imágenes que recibamos y lo concatenamos con la extensión de la imagen
    imageFileName = `${v4()}.${metadata.format}`

    // indicamos la carpeta destino en la que se van a guardar las imagenes subidas por usuario
    const imageUpload = path.join(recommendationFolder, userId.tostring());

    // en el caso de que no existan las carpetas de destino, hacemos que sólo la primera vez se creen con el {recursive: true}
    await fs.mkdir(imageUpload, {recursive: true});

    // añadimos la imagen a la carpeta correspondiente con el nombre aleatorio
    await image.toFile(path.join(imageUpload,imageFileName));
}catch{

}

};

module.exports = createRecommendation;



// 26/07 19:10h