const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth')

router.get('/agregar', isLoggedIn, async (req, res) => {
    const tipos = await pool.query('SELECT ID_TIPO, TIPO_NOMBRE FROM tipo');
    const razas = await pool.query('SELECT ID_RAZA, RAZA_NOMBRE FROM raza');
    const sexos = await pool.query('SELECT ID_SEXO, SEXO_NOMBRE FROM sexo');
    res.render('mascotas/agregar', { tipos, razas, sexos });
});

router.post('/agregar', isLoggedIn, async (req, res) => {
    const { ID_USER } = req.user;
    const { mascota_tipo, mascota_raza, mascota_sexo, mascota_nombre, mascota_fnac } = req.body;
    const tipo_raza_result = await pool.query(`
        SELECT 
            ID_TIPO_RAZA 
        FROM 
            TIPO_RAZA
        WHERE 
            ID_TIPO = ? AND ID_RAZA = ? AND ID_SEXO = ?
        `, [ mascota_tipo, mascota_raza, mascota_sexo]);
    const tipo_raza = tipo_raza_result[0].ID_TIPO_RAZA;
    await pool.query(`
        INSERT INTO mascotas (ID_TIPO_RAZA, MASCOTAS_NOMBRE, MASCOTAS_FNAC, ID_USER) 
        VALUES (?, ?, ?, ?);
    `, [tipo_raza, mascota_nombre, mascota_fnac, ID_USER]);
    req.flash('auto_success', 'MASCOTA AGREGADA CORRECTAMENTE');
    res.redirect('/mascotas');
});

router.get('/sexo/:tipoId/:razaId', isLoggedIn, async (req, res) => {
    const { tipoId, razaId } = req.params;
    const sexos = await pool.query(`
        SELECT DISTINCT sexo.ID_SEXO, sexo.SEXO_NOMBRE
        FROM tipo_raza
        JOIN sexo ON tipo_raza.ID_SEXO = sexo.ID_SEXO
        WHERE tipo_raza.ID_TIPO = ? AND tipo_raza.ID_RAZA = ?
    `, [tipoId, razaId]);
    res.json(sexos);
});

router.get('/', isLoggedIn, async (req, res) => {
    const {ID_USER} = req.user;
    const mascotas = await pool.query(`
        SELECT
            mascotas.ID_MASCOTAS,
            tipo.TIPO_NOMBRE,
            raza.RAZA_NOMBRE,
            sexo.SEXO_NOMBRE,
            mascotas.MASCOTAS_NOMBRE,
            mascotas.MASCOTAS_FNAC
        FROM
            mascotas
        JOIN
            tipo_raza ON mascotas.ID_TIPO_RAZA = tipo_raza.ID_TIPO_RAZA
        JOIN
            tipo ON tipo_raza.ID_TIPO = tipo.ID_TIPO
        JOIN
            raza ON tipo_raza.ID_RAZA = raza.ID_RAZA
        JOIN
            sexo ON tipo_raza.ID_SEXO = sexo.ID_SEXO
        WHERE
            mascotas.ID_USER = ?
        `, [ID_USER]);
    res.render('mascotas/listar', { mascotas });
});

router.get('/eliminar/:ID_MASCOTAS', isLoggedIn, async (req, res) => {
    const { ID_MASCOTAS } = req.params;
    await pool.query('DELETE FROM mascotas WHERE ID_MASCOTAS = ?', [ID_MASCOTAS]);
    req.flash('auto_success', 'MASCOTA ELIMINADA')
    res.redirect('/mascotas');
});

router.get('/editar/:ID_MASCOTAS', isLoggedIn, async (req, res) => {
    const { ID_MASCOTAS } = req.params;
    const editarMascotas = await pool.query(`
        SELECT
            mascotas.ID_MASCOTAS,
            tipo.TIPO_NOMBRE,
            raza.RAZA_NOMBRE,
            sexo.SEXO_NOMBRE,
            mascotas.MASCOTAS_NOMBRE,
            mascotas.MASCOTAS_FNAC
        FROM
            mascotas
        JOIN
            tipo_raza ON mascotas.ID_TIPO_RAZA = tipo_raza.ID_TIPO_RAZA
        JOIN
            tipo ON tipo_raza.ID_TIPO = tipo.ID_TIPO
        JOIN
            raza ON tipo_raza.ID_RAZA = raza.ID_RAZA
        JOIN
            sexo ON tipo_raza.ID_SEXO = sexo.ID_SEXO
        WHERE
            mascotas.ID_MASCOTAS = ?`, [ID_MASCOTAS]);
    const tipos = await pool.query('SELECT ID_TIPO, TIPO_NOMBRE FROM tipo');
    const razas = await pool.query('SELECT ID_RAZA, RAZA_NOMBRE FROM raza');
    const sexos = await pool.query('SELECT ID_SEXO, SEXO_NOMBRE FROM sexo');
    res.render('mascotas/editar', { editarMascotas: editarMascotas[0], tipos, razas, sexos });
});

router.post('/editar/:ID_MASCOTAS', isLoggedIn, async (req, res) => {
    const { ID_MASCOTAS } = req.params;
    const { mascota_tipo, mascota_raza, mascota_sexo, mascota_nombre, mascota_fnac } = req.body;

    const tipo_raza_result = await pool.query(`
        SELECT ID_TIPO_RAZA 
        FROM tipo_raza 
        WHERE ID_TIPO = ? AND ID_RAZA = ? AND ID_SEXO = ?
    `, [mascota_tipo, mascota_raza, mascota_sexo]);

    const tipo_raza = tipo_raza_result[0]?.ID_TIPO_RAZA;

    if (!tipo_raza) {
        req.flash('error', 'Combinación inválida de tipo, raza y sexo.');
        return res.redirect('/mascotas');
    }

    const updatedMascota = {
        ID_TIPO_RAZA: tipo_raza,
        MASCOTAS_NOMBRE: mascota_nombre,
        MASCOTAS_FNAC: mascota_fnac
    };

    await pool.query('UPDATE mascotas SET ? WHERE ID_MASCOTAS = ?', [updatedMascota, ID_MASCOTAS]);

    req.flash('mascota_success', 'MASCOTA ACTUALIZADA CORRECTAMENTE');
    res.redirect('/mascotas');
})

module.exports = router;

