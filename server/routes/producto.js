const express = require('express');

let { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

// Mostrar todos los productos
app.get('/producto', verificaToken, (req, res) => {

    let desde = Number(req.query.desde) || 0;   
    let limite = Number(req.query.limite) || 5;


    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if(err){
                return res.status(400).json({
                      ok: false,
                      err
                });
            }

            Producto.count({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });    
    
            });

        })
});

// Mostrar un producto por id
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    Producto.findById( id )
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productoBD) => {
        if(err){
            return res.status(500).json({
                  ok: false,
                  err
            });
        }

        if (!productoBD){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
          });
        }

        res.json({
            ok: true,
            producto: productoBD
        });    

    });
});

// Buscar productos
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true })
        .populate('categoria', 'descripcion')
        .exec( (err, productos) => {
            if(err){
                return res.status(500).json({
                      ok: false,
                      err
                });
            }
            res.json({
                ok: true,
                productos
            });  
        });
});

// Crear nuevo producto 
app.post('/producto', verificaToken, function (req, res) {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: true,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoBD) =>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
              });
          }
          if (!productoBD){
            return res.status(400).json({
                ok: false,
                err
          });
        }  
        res.status(201).json({
            ok: true,
            producto: productoBD
        });

    });
});

// Actualizar producto 
app.put('/producto/:id', verificaToken, function (req, res) {
    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoBD) => {

        if(err){
            return res.status(500).json({
                  ok: false,
                  err
            });
        }

        if (!productoBD){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
          });
        }  

        res.json({ 
            ok: true,
            producto: productoBD 
        });

    });

})

// Borrar producto 
app.delete('/producto/:id', verificaToken, function (req, res) {
    // Solo un admin puede borrar la categoría
    // Borrado lógico

    let id = req.params.id;

 //   Categoria.findByIdAndRemove(id, (err, productoBorrado) => {
    let cambiaDisponible = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaDisponible, {new: true, runValidators: true}, (err, productoBorrado) => {

        if(err){
            return res.status(500).json({
                  ok: false,
                  err
            });
        }

        if (!productoBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
          });

        };

        res.json({
            ok: true,
            message: 'Producto borrado'
        });
    });
});


module.exports = app;