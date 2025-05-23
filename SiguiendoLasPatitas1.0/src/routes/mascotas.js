const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth')

router.get('/agregar', isLoggedIn, async (req, res) => {
//     const anio = await pool.query('SELECT * FROM anio');
//     const marca_modelo = await pool.query(`
//         SELECT
//             marca_modelo.ID_MARCA_MODELO,
//             marcas.ID_MARCA,
//             marcas.MARC_NOMBRE,
//             modelos.ID_MODELO,
//             modelos.MOD_NOMBRE
//         FROM
//             marca_modelo
//         JOIN
//             marcas ON marca_modelo.ID_MARCA = marcas.ID_MARCA
//         JOIN
//             modelos ON marca_modelo.ID_MODELO = modelos.ID_MODELO        
//         `)
    res.render('mascotas/agregar', /* { marca_modelo, anio } */);
});


router.post('/agregar', isLoggedIn, async (req, res) => {
//     const { ID_USER } = req.user;
//     const { veh_marca, veh_modelo, veh_anio, veh_patente } = req.body;
//     const marca_modelo_result = await pool.query(`
//         SELECT 
//             ID_MARCA_MODELO 
//         FROM 
//             marca_modelo 
//         WHERE 
//             ID_MARCA = ? AND ID_MODELO = ?
//         `, [veh_marca, veh_modelo]);
//     const marca_modelo = marca_modelo_result[0].ID_MARCA_MODELO;
//     await pool.query(`
//         INSERT INTO vehiculos (ID_MARCA_MODELO, ID_ANIO, VEH_PATENTE, ID_USER) 
//         VALUES (?, ?, ?, ?);
//     `, [marca_modelo, veh_anio, veh_patente, ID_USER]);
//     req.flash('auto_success', 'AUTO AGREGADO CORRECTAMENTE');
    res.redirect('/mascotas');
});

// router.get('/modelos/:marcaId', isLoggedIn, async (req, res) => {
//     const { marcaId } = req.params;
//     const modelos = await pool.query(`
//         SELECT 
//             modelos.ID_MODELO, 
//             modelos.MOD_NOMBRE 
//         FROM 
//             marca_modelo 
//         JOIN 
//             modelos ON marca_modelo.ID_MODELO = modelos.ID_MODELO 
//         WHERE 
//             marca_modelo.ID_MARCA = ?
//     `, [marcaId]);
//     res.json(modelos);
// });

router.get('/', isLoggedIn, async (req, res) => {
//     const {ID_USER} = req.user;
//     const vehiculos = await pool.query(`
//         SELECT
//             vehiculos.ID_VEHICULO,
//             marcas.MARC_NOMBRE,
//             modelos.MOD_NOMBRE,
//             anio.ANIO,
//             vehiculos.VEH_PATENTE,
//             vehiculos.ID_USER
//         FROM
//             vehiculos
//         JOIN
//             marca_modelo ON vehiculos.ID_MARCA_MODELO = marca_modelo.ID_MARCA_MODELO
//         JOIN
//             marcas ON marca_modelo.ID_MARCA = marcas.ID_MARCA
//         JOIN
//             modelos ON marca_modelo.ID_MODELO = modelos.ID_MODELO
//         JOIN
//             anio ON vehiculos.ID_ANIO = anio.ID_ANIO
//         WHERE
//             vehiculos.ID_USER = ?
//         `, [ID_USER]);
    res.render('mascotas/listar', /* { vehiculos } */);
});

// router.get('/eliminar/:ID_VEHICULO', isLoggedIn, async (req, res) => {
//     const { ID_VEHICULO } = req.params;
//     await pool.query('DELETE FROM vehiculos WHERE ID_VEHICULO = ?', [ID_VEHICULO]);
//     req.flash('auto_success', 'AUTO ELIMINADO')
//     res.redirect('/autos');
// });

// router.get('/editar/:ID_VEHICULO', isLoggedIn, async (req, res) => {
//     const { ID_VEHICULO } = req.params;
//     const editarAutos = await pool.query(`
//         SELECT
//             vehiculos.ID_VEHICULO,
//             marcas.MARC_NOMBRE,
//             modelos.MOD_NOMBRE,
//             anio.ANIO,
//             vehiculos.VEH_PATENTE
//         FROM
//             vehiculos
//         JOIN
//             marca_modelo ON vehiculos.ID_MARCA_MODELO = marca_modelo.ID_MARCA_MODELO
//         JOIN
//             marcas ON marca_modelo.ID_MARCA = marcas.ID_MARCA
//         JOIN
//             modelos ON marca_modelo.ID_MODELO = modelos.ID_MODELO
//         JOIN
//             anio ON vehiculos.ID_ANIO = anio.ID_ANIO
//         WHERE 
//             vehiculos.ID_VEHICULO = ?`, [ID_VEHICULO]);
//     const marcas = await pool.query(`SELECT ID_MARCA, MARC_NOMBRE FROM marcas`);
//     const anios = await pool.query(`SELECT ID_ANIO, ANIO FROM anio`);
//     res.render('autos/editar', { editarAutos: editarAutos[0], marcas, anios });
// });

// router.post('/editar/:ID_VEHICULO', isLoggedIn, async (req, res) => {
//     const { ID_VEHICULO } = req.params;
//     const { veh_marca, veh_modelo, veh_anio, veh_patente } = req.body;
//     const editarAutos = {
//         ID_MARCA_MODELO: veh_modelo, 
//         ID_ANIO: veh_anio,
//         VEH_PATENTE: veh_patente,
//         ID_USER: req.user.ID_USER
//     };
//     await pool.query('UPDATE vehiculos set ? WHERE ID_VEHICULO = ?', [editarAutos, ID_VEHICULO]);
//     req.flash('auto_success', 'CAMBIO EXITOSO');
//     res.redirect('/autos');
// })

module.exports = router;

