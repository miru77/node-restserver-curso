const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');


////////////////////////////////////////////////////////////
///////////Mostrar todas los productos
////////////////////////////////////////////////////////////
app.get('/producto', verificaToken, (req, res) => {
    //populate: usuario y categoria
    // paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        // .sort('descripcion')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
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
////////////////////////////////////////////////////////////
///////////Mostrar 1  producto x ID
////////////////////////////////////////////////////////////
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            })

        });
});


////////////////////////////////////////////////////////////
///////////Mostrar 1  producto x ID
////////////////////////////////////////////////////////////
app.get('/producto/:id', verificaToken, (req, res) => {
    //populate: usuario y categoria
    // paginado
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'el Id no es corrcto'
                    }
                });
            }
            res.json({
                ok: true,
                productoDB
            });
        });
});

////////////////////////////////////////////////////////////
///////////Crear 1 producto producto
////////////////////////////////////////////////////////////
app.post('/producto', verificaToken, (req, res) => {
    //grabar el usuario
    // grabar una categoria del listado

    let body = req.body;

    let producto = new Producto({

        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria

    });
    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

////////////////////////////////////////////////////////////
///////////Actualizar 1 producto producto
////////////////////////////////////////////////////////////
app.put('/producto/:id', verificaToken, (req, res) => {
    //grabar el usuario
    // grabar una categoria del listado
    let id = req.params.id;
    let body = req.body;

    let actuProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    }
    Producto.findByIdAndUpdate(id, actuProducto, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});



////////////////////////////////////////////////////////////
///////////Borrar 1 producto producto
////////////////////////////////////////////////////////////
app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let cambiaEStado = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, cambiaEStado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usuario no encontrado'
                }
            });
        };

        res.json({
            ok: true,
            producto: productoBorrado
        });
    });
});


module.exports = app;