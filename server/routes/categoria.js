const express = require('express');

let { verificaToken, verificaAdmin_Roles } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

////////////////////////////////////////////////////////////
///////////Mostrar todas las categorias
////////////////////////////////////////////////////////////

app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }


            res.json({
                ok: true,
                categorias
            });
        });
});


////////////////////////////////////////////////////////////
///////////Mostrar 1 categoria
////////////////////////////////////////////////////////////

app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    // Categoria.findById(....);
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'el Id no es corrcto'
                }
            });
        }
        res.json({
            ok: true,
            categoriaDB
        });
    });
});
////////////////////////////////////////////////////////////
///////////Crear nueva categoria
////////////////////////////////////////////////////////////


app.post('/categoria', verificaToken, (req, res) => {
    //el id esta en el token
    //req.usuario._id
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


////////////////////////////////////////////////////////////
///////////     Actializar  categoria
////////////////////////////////////////////////////////////


app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});



////////////////////////////////////////////////////////////
///////////     Delete  categoria
////////////////////////////////////////////////////////////


app.delete('/categoria/:id', [verificaToken, verificaAdmin_Roles], (req, res) => {

    //solo administrador puede borrar 
    //Categoria.findByIdAndRemove

    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (!categoriaBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'categoria no encontrado'
                }
            });
        };

        res.json({
            ok: true,
            usuario: categoriaBorrado
        });
    });

});


module.exports = app;