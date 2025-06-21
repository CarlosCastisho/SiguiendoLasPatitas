const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth')

router.get('/agregar', isLoggedIn, async (req, res) => {
    try {
        const tipos = await pool.query('SELECT ID_TIPO, TIPO_NOMBRE FROM tipo');
        const razas = await pool.query('SELECT ID_RAZA, RAZA_NOMBRE FROM raza');
        const sexos = await pool.query('SELECT ID_SEXO, SEXO_NOMBRE FROM sexo');
        res.render('mascotas/agregar', { tipos, razas, sexos });        
    } catch (error) {
        console.error('Error al obtener los datos para agregar mascota:', error);
        req.flash('error', 'Error al cargar los datos necesarios para agregar una mascota.');
        res.redirect('/mascotas'); // Redirigir a una página de lista o error
    }
});

router.post('/agregar', isLoggedIn, async (req, res) => {
    try {
        const { ID_USER } = req.user;
        const { mascota_tipo, mascota_raza, mascota_sexo, mascota_nombre, mascota_fnac } = req.body;
        // Validación básica de entrada
        if (!mascota_tipo || !mascota_raza || !mascota_sexo || !mascota_nombre || !mascota_fnac) {
            req.flash('auto_error', 'Por favor, completa todos los campos para agregar la mascota.');
            return res.redirect('/mascotas/agregar');
        }

        const tipo_raza_result = await pool.query(`
            SELECT 
                ID_TIPO_RAZA 
            FROM 
                tipo_raza
            WHERE 
                ID_TIPO = ? AND ID_RAZA = ? AND ID_SEXO = ?
            `, [ mascota_tipo, mascota_raza, mascota_sexo]);

        // Verificar si se encontró una combinación tipo-raza-sexo
        if (tipo_raza_result.length === 0) {
            req.flash('auto_error', 'La combinación de tipo, raza y sexo seleccionada no es válida.');
            return res.redirect('/mascotas/agregar');
        }

        const tipo_raza = tipo_raza_result[0].ID_TIPO_RAZA;
        await pool.query(`
            INSERT INTO mascotas (ID_TIPO_RAZA, MASCOTAS_NOMBRE, MASCOTAS_FNAC, ID_USER) 
            VALUES (?, ?, ?, ?);
        `, [tipo_raza, mascota_nombre, mascota_fnac, ID_USER]);
        req.flash('auto_success', 'MASCOTA AGREGADA CORRECTAMENTE');
        res.redirect('/mascotas');

    } catch (error) {
        console.error('Error al agregar la mascota:', error);
        req.flash('auto_error', 'Error al agregar la mascota. Por favor, inténtalo de nuevo.');
        res.redirect('/mascotas/agregar'); // Redirigir a la página de agregar mascota
    }
});

router.get('/raza/:tipoId', isLoggedIn, async (req, res) => {
    try {
        const { tipoId } = req.params;
        const razas = await pool.query(`
            SELECT DISTINCT raza.ID_RAZA, raza.RAZA_NOMBRE
            FROM tipo_raza
            JOIN raza ON tipo_raza.ID_RAZA = raza.ID_RAZA
            WHERE tipo_raza.ID_TIPO = ?
        `, [tipoId]);
        res.json(razas);
    } catch (error) {
        console.error('Error al obtener razas por tipo:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener las razas.' });
    }
});

router.get('/sexo/:tipoId/:razaId', isLoggedIn, async (req, res) => {
    try {
        const { tipoId, razaId } = req.params;
        const sexos = await pool.query(`
            SELECT DISTINCT sexo.ID_SEXO, sexo.SEXO_NOMBRE
            FROM tipo_raza
            JOIN sexo ON tipo_raza.ID_SEXO = sexo.ID_SEXO
            WHERE tipo_raza.ID_TIPO = ? AND tipo_raza.ID_RAZA = ?
        `, [tipoId, razaId]);
        res.json(sexos);
    } catch (error) {
        console.error('Error al obtener sexos por tipo y raza:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los sexos.' });
    }
});

router.get('/', isLoggedIn, async (req, res) => {
    try {
        const {ID_USER} = req.user;
        const mascotas = await pool.query(`
            SELECT
                mascotas.ID_MASCOTAS,
                tipo.TIPO_NOMBRE,
                raza.RAZA_NOMBRE,
                sexo.SEXO_NOMBRE,
                mascotas.MASCOTAS_NOMBRE,
                DATE_FORMAT(mascotas.MASCOTAS_FNAC, '%d/%m/%Y') AS MASCOTAS_FNAC
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
    } catch (error) {
        console.error('Error al listar mascotas:', error);
        req.flash('auto_error', 'Ocurrió un error al cargar la lista de mascotas.');
        res.redirect('/'); // O a alguna página de inicio
    }
});

router.get('/eliminar/:ID_MASCOTAS', isLoggedIn, async (req, res) => {
    try {
        const { ID_MASCOTAS } = req.params;

        const adopciones = await pool.query('SELECT * FROM adopciones WHERE ID_MASCOTAS = ?', [ID_MASCOTAS]);

        if (adopciones.length > 0) {
            req.flash('auto_error', 'No podés eliminar esta mascota porque está asignada a una adopción.');
            return res.redirect('/mascotas');
        }

        await pool.query('DELETE FROM mascotas WHERE ID_MASCOTAS = ?', [ID_MASCOTAS]);
        req.flash('auto_success', 'Mascota eliminada correctamente.');
        res.redirect('/mascotas');
    } catch (error) {
        console.error('Error al eliminar mascota:', error);
        req.flash('auto_error', 'Ocurrió un error al eliminar la mascota.');
        res.redirect('/mascotas');
    }
});

router.get('/editar/:ID_MASCOTAS', isLoggedIn, async (req, res) => {
    try {
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

        // Verificar si la mascota existe
        if (editarMascotas.length === 0) {
            req.flash('auto_error', 'Mascota no encontrada para editar.');
            return res.redirect('/mascotas');
        }

        const tipos = await pool.query('SELECT ID_TIPO, TIPO_NOMBRE FROM tipo');
        const razas = await pool.query('SELECT ID_RAZA, RAZA_NOMBRE FROM raza');
        const sexos = await pool.query('SELECT ID_SEXO, SEXO_NOMBRE FROM sexo');
        res.render('mascotas/editar', { editarMascotas: editarMascotas[0], tipos, razas, sexos });
    } catch (error) {
        console.error('Error al cargar la página de edición de mascota:', error);
        req.flash('auto_error', 'Ocurrió un error al cargar la información para editar la mascota.');
        res.redirect('/mascotas');
    }
});

router.post('/editar/:ID_MASCOTAS', isLoggedIn, async (req, res) => {
    try {
        const { ID_MASCOTAS } = req.params;
        const { mascota_tipo, mascota_raza, mascota_sexo, mascota_nombre, mascota_fnac } = req.body;

        // Validación básica de entrada
        if (!mascota_tipo || !mascota_raza || !mascota_sexo || !mascota_nombre || !mascota_fnac) {
            req.flash('auto_error', 'Por favor, completa todos los campos para actualizar la mascota.');
            return res.redirect(`/mascotas/editar/${ID_MASCOTAS}`);
        }

        const tipo_raza_result = await pool.query(`
            SELECT ID_TIPO_RAZA
            FROM tipo_raza
            WHERE ID_TIPO = ? AND ID_RAZA = ? AND ID_SEXO = ?
        `, [mascota_tipo, mascota_raza, mascota_sexo]);

        const tipo_raza = tipo_raza_result[0]?.ID_TIPO_RAZA;

        if (!tipo_raza) {
            req.flash('auto_error', 'Combinación inválida de tipo, raza y sexo.');
            return res.redirect(`/mascotas/editar/${ID_MASCOTAS}`);
        }

        const updatedMascota = {
            ID_TIPO_RAZA: tipo_raza,
            MASCOTAS_NOMBRE: mascota_nombre,
            MASCOTAS_FNAC: mascota_fnac
        };

        await pool.query('UPDATE mascotas SET ? WHERE ID_MASCOTAS = ?', [updatedMascota, ID_MASCOTAS]);

        req.flash('auto_success', 'MASCOTA ACTUALIZADA CORRECTAMENTE');
        res.redirect('/mascotas');
    } catch (error) {
        console.error('Error al editar mascota:', error);
        req.flash('auto_error', 'Ocurrió un error al actualizar la mascota.');
        res.redirect(`/mascotas/editar/${ID_MASCOTAS}`); // Redirigir al formulario de edición
    }
});

module.exports = router;