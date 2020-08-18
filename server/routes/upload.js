const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if(!req.files){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seccionado ningún archivo.'
            }
        });
    }
    
    // Validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if( tiposValidos.indexOf( tipo ) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        });
    }

    // Extensiones permitidas
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let ext = nombreCortado[nombreCortado.length - 1]
    let extPermitidas = ['png', 'jpg', 'gif', 'jpeg'];
    if( extPermitidas.indexOf( ext ) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extPermitidas.join(', '),
                ext: ext
            }
        });
    }

    // Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${ext}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Aquí, imagen cargada
        if(tipo === 'productos'){
            imagenProducto(id, res, nombreArchivo);
        } else {
            imagenUsuario(id, res, nombreArchivo);
        }
    });
});

function imagenUsuario(id, res, nombreArchivo){
    Usuario.findById(id, (err, usuarioBD) => {
        if(err){

            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!usuarioBD){

            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        borraArchivo(usuarioBD.img, 'usuarios');

        usuarioBD.img = nombreArchivo;
        usuarioBD.save( (err, usuarioGuardado) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })    
        })

    });
}

function imagenProducto(id, res, nombreArchivo){
    Producto.findById(id, (err, productoBD) => {
        if(err){

            borraArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoBD){

            borraArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        borraArchivo(productoBD.img, 'productos');

        productoBD.img = nombreArchivo;
        productoBD.save( (err, productoGuardado) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })    
        })

    });
}

function borraArchivo(nombreImagen, tipo){
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if( fs.existsSync(pathImagen)){
        fs.unlinkSync(pathImagen);
    }

}

module.exports = app;