const express = require('express');

let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

// Mostrar todas las categorías
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({ }, 'descripcion usuario')
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if(err){
                return res.status(400).json({
                      ok: false,
                      err
                });
            }

            Categoria.count({ }, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });    
    
            });

        })
});

// Mostrar una categoría por id
app.get('/categoria/:id', verificaToken, (req, res) => {
    // Categoria.findById();
    let id = req.params.id;
    Categoria.findById( id )
    .exec((err, categoriaBD) => {
        if(err){
            return res.status(400).json({
                  ok: false,
                  err
            });
        }

        if (!categoriaBD){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
          });
        }

        res.json({
            ok: true,
            categoria: categoriaBD
        });    

        });
});

// Crear nueva categoría 
app.post('/categoria', [verificaToken, verificaAdminRole], function (req, res) {
    // regresa la nueva categoría
    // req.usuario._id    
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaBD) =>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
              });
          }
          if (!categoriaBD){
            return res.status(400).json({
                ok: false,
                err
          });
        }  
        res.json({
            ok: true,
            categoria: categoriaBD
        });

    });
});

// Actualizar categoría 
app.put('/categoria/:id', [verificaToken, verificaAdminRole], function (req, res) {
    let id = req.params.id;
    let body = req.body;

    Categoria.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, categoriaBD) => {

        if(err){
            return res.status(500).json({
                  ok: false,
                  err
            });
        }

        if (!categoriaBD){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
          });
        }  

        res.json({ 
            ok: true,
            categoria: categoriaBD 
        });

    });

})

// Borrar categoría 
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], function (req, res) {
    // Solo un admin puede borrar la categoría
    // Borrado físico
    // Categoría.findByIdAndRemove

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {

        if(err){
            return res.status(500).json({
                  ok: false,
                  err
            });
        }

        if (!categoriaBorrada){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
          });

        };

        res.json({
            ok: true,
            message: 'Categoría borrada'
        });
    });
});


module.exports = app;