const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const helpers = require('../lib/helpers');

router.get('/', isLoggedIn, async (req, res) => {
    try {
        const adminuser = await pool.query('SELECT * FROM usuario WHERE ID_USER > 1 ');
        res.render('admin/gestionUser', { adminuser });
    } catch (error) {
        console.error('Error al obtener usuarios para gestión:', error);
        req.flash('auto_error', 'Ocurrió un error al cargar la gestión de usuarios.');
        res.redirect('/admin'); // O a alguna página de error general
    }
});

router.get('/eliminar/:ID_USER', isLoggedIn, async (req, res) => {
    try {
        const { ID_USER } = req.params;
        // Considerar añadir una verificación para evitar eliminar al propio admin logueado si ID_USER es de admin.
        // También verificar si el usuario tiene mascotas o adopciones asignadas para evitar errores de FK.
        const userMascotas = await pool.query('SELECT ID_MASCOTAS FROM mascotas WHERE ID_USER = ?', [ID_USER]);
        const userAdopciones = await pool.query('SELECT ID_ADOPCIONES FROM adopciones WHERE ID_USER = ?', [ID_USER]);
        const userAdoptantes = await pool.query('SELECT ID_ADOPTS FROM adopts WHERE ID_USER = ?', [ID_USER]);

        if (userMascotas.length > 0 || userAdopciones.length > 0 || userAdoptantes.length > 0) {
            req.flash('auto_error', 'No se puede eliminar el usuario porque tiene mascotas, adoptantes o adopciones asociadas. Elimina primero los registros relacionados.');
            return res.redirect('/admin');
        }

        await pool.query('DELETE FROM usuario WHERE ID_USER = ?', [ID_USER]);
        req.flash('auto_success', 'USUARIO ELIMINADO')
        res.redirect('/admin');
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        req.flash('auto_error', 'Ocurrió un error al eliminar el usuario.');
        res.redirect('/admin');
    }
});

router.get('/editarAdminUser/:ID_USER', isLoggedIn, async (req, res) => {
    try {
        const { ID_USER } = req.params;
        const editarAdminUser = await pool.query('SELECT * FROM usuario WHERE ID_USER = ?', [ID_USER]);

        if (editarAdminUser.length === 0) {
            req.flash('auto_error', 'Usuario no encontrado para editar.');
            return res.redirect('/admin');
        }

        res.render('admin/editarAdminUser', { editarAdminUser: editarAdminUser[0] });
    } catch (error) {
        console.error('Error al cargar la página de edición de usuario admin:', error);
        req.flash('auto_error', 'Ocurrió un error al cargar la información del usuario.');
        res.redirect('/admin');
    }
});


router.post('/editarAdminUser/:ID_USER', isLoggedIn, async (req, res) => {
    try {
        const { ID_USER } = req.params;
        const { user_contrasenia } = req.body;

        if (!user_contrasenia) {
            req.flash('auto_error', 'La contraseña no puede estar vacía.');
            return res.redirect(`/admin/editarAdminUser/${ID_USER}`);
        }

        const editarAdminUser = {
            user_contrasenia: await helpers.encryptContrasenia(user_contrasenia)
        };
        await pool.query('UPDATE usuario set ? WHERE ID_USER = ?', [editarAdminUser, ID_USER]);
        req.flash('auto_success', 'Contraseña restablecida');
        res.redirect('/admin');
    } catch (error) {
        console.error('Error al editar contraseña de usuario admin:', error);
        req.flash('auto_error', 'Ocurrió un error al restablecer la contraseña.');
        res.redirect(`/admin/editarAdminUser/${ID_USER}`);
    }
});


router.get('/gestionAdopciones', isLoggedIn, async (req, res) => {
    try {
        const todasAdopciones = await pool.query(`
            SELECT
                usuario.USER_NOMBRE,
                usuario.USER_APELLIDO,
                adopciones.ID_ADOPCIONES,
                DATE_FORMAT(adopciones.ADOPCION_FECHA, '%d/%m/%Y') AS ADOPCION_FECHA,
                mascotas.MASCOTAS_NOMBRE,
                adopts.ADOPTS_NOMBRE,
                adopts.ADOPTS_DIRECCION,
                est_adop.EST_ADOP_DESCRIP
            FROM
                usuario
            JOIN
                adopciones ON usuario.ID_USER = adopciones.ID_USER
            JOIN
                mascotas ON adopciones.ID_MASCOTAS = mascotas.ID_MASCOTAS
            JOIN
                adopts ON adopciones.ID_ADOPTS = adopts.ID_ADOPTS
            JOIN
                est_adop ON adopciones.ID_EST_ADOP = est_adop.ID_EST_ADOP
            ORDER BY
                usuario.USER_NOMBRE, usuario.USER_APELLIDO, adopciones.ADOPCION_FECHA;
        `);

        res.render('admin/gestionAdopciones', { todasAdopciones });
    } catch (error) {
            console.error('Error al obtener las reservas:', error);
            res.status(500).send('Error al obtener las reservas.');
    }
});

router.get('/cancelarAdopciones/:ID_ADOPCIONES', isLoggedIn, async (req, res) => {
    try {
        const { ID_ADOPCIONES } = req.params;
        await pool.query('DELETE FROM adopciones WHERE ID_ADOPCIONES = ?', [ID_ADOPCIONES]);
        req.flash('auto_success', 'ADOPCION ELIMINADA');
        res.redirect('/admin/gestionAdopciones');
    } catch (error) {
        console.error('Error al cancelar adopción:', error);
        req.flash('auto_error', 'Ocurrió un error al eliminar la adopción.');
        res.redirect('/admin/gestionAdopciones');
    }
});

router.get('/adminmascotas', isLoggedIn, async (req, res) => {
    try {
        const mascotas = await pool.query('SELECT * FROM mascotas');
        const tipo = await pool.query('SELECT * FROM tipo');
        const raza = await pool.query('SELECT * FROM raza');
        const sexo = await pool.query('SELECT * FROM sexo');
        const tipo_raza = await pool.query(`
            SELECT
                    tipo_raza.ID_TIPO_RAZA,
                    tipo.TIPO_NOMBRE,
                    raza.RAZA_NOMBRE,
                    sexo.SEXO_NOMBRE
                    FROM tipo_raza
                    JOIN tipo ON tipo_raza.ID_TIPO = tipo.ID_TIPO
                    JOIN raza ON tipo_raza.ID_RAZA = raza.ID_RAZA
                    JOIN sexo ON tipo_raza.ID_SEXO = sexo.ID_SEXO ;
                    `);
        res.render('admin/adminmascotas', { tipo, raza, sexo, tipo_raza, mascotas });
    } catch (error) {
        console.error('Error al cargar la gestión de mascotas (admin):', error);
        req.flash('auto_error', 'Ocurrió un error al cargar la sección de administración de mascotas.');
        res.redirect('/admin'); // Redirigir a una página de error o al dashboard de admin
    }
});

// //Ruta para agregar relación entre marca, modelo y tipo de conector
router.post('/adminmascotas', isLoggedIn, async (req, res) => {
    const { id_tipo, id_raza, id_sexo } = req.body;
    try {
        if (!id_tipo || !id_raza || !id_sexo) {
            req.flash('auto_error', 'Por favor, selecciona un tipo, raza y sexo para la relación.');
            return res.redirect('/admin/adminmascotas');
        }
        await pool.query('INSERT INTO tipo_raza (ID_TIPO, ID_RAZA, ID_SEXO) VALUES (?, ?, ?)', [id_tipo, id_raza, id_sexo]);
        req.flash('auto_success', 'Relación agregada con éxito');
        res.redirect('/admin/adminmascotas');
    } catch (error) {
        // Verificar si es un error de duplicado (ej: MySQL ER_DUP_ENTRY)
        if (error.code === 'ER_DUP_ENTRY') {
            req.flash('auto_error', 'Esta relación de tipo, raza y sexo ya existe.');
        } else {
            console.error('Error al agregar relación TIPO-RAZA-SEXO:', error);
            req.flash('auto_error', 'Error al agregar la relación. Por favor, inténtalo de nuevo.');
        }
        res.redirect('/admin/adminmascotas');
    }
});

// Ruta para agregar un tipo de mascota
router.post('/adminmascotas/tipo', isLoggedIn, async (req, res) => {
    try {
        const { tipo_nombre } = req.body;
        if (!tipo_nombre) {
            req.flash('auto_error', 'El nombre del tipo no puede estar vacío.');
            return res.redirect('/admin/adminmascotas');
        }
        const nuevo_tipo_nombre = { tipo_nombre }
        await pool.query('INSERT INTO tipo set ?', [nuevo_tipo_nombre]);
        req.flash('auto_success', 'TIPO AGREGADO CORRECTAMENTE');
        res.redirect('/admin/adminmascotas');
    } catch (error) {
        // Manejar duplicados si ID_TIPO o TIPO_NOMBRE es UNIQUE
        if (error.code === 'ER_DUP_ENTRY') {
            req.flash('auto_error', 'Este tipo ya existe.');
        } else {
            console.error('Error al agregar tipo:', error);
            req.flash('auto_error', 'Ocurrió un error al agregar el tipo.');
        }
        res.redirect('/admin/adminmascotas');
    }
});

// Ruta para agregar una raza
router.post('/adminmascotas/raza', isLoggedIn, async (req, res) => {
    try {
        const { raza_nombre } = req.body;
        if (!raza_nombre) {
            req.flash('auto_error', 'El nombre de la raza no puede estar vacío.');
            return res.redirect('/admin/adminmascotas');
        }
        await pool.query('INSERT INTO raza (raza_nombre) VALUES (?)', [raza_nombre]);
        req.flash('auto_success', 'RAZA AGREGADA CORRECTAMENTE');
        res.redirect('/admin/adminmascotas');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            req.flash('auto_error', 'Esta raza ya existe.');
        } else {
            console.error('Error al agregar raza:', error);
            req.flash('auto_error', 'Ocurrió un error al agregar la raza.');
        }
        res.redirect('/admin/adminmascotas');
    }
});

// Ruta para agregar un sexo
router.post('/adminmascotas/sexo', isLoggedIn, async (req, res) => {
    try {
        const { sexo_nombre } = req.body;
        if (!sexo_nombre) {
            req.flash('auto_error', 'El nombre del sexo no puede estar vacío.');
            return res.redirect('/admin/adminmascotas');
        }
        await pool.query('INSERT INTO sexo (sexo_nombre) VALUES (?)', [sexo_nombre]);
        req.flash('auto_success', 'SEXO AGREGADO CORRECTAMENTE');
        res.redirect('/admin/adminmascotas');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            req.flash('auto_error', 'Este sexo ya existe.');
        } else {
            console.error('Error al agregar sexo:', error);
            req.flash('auto_error', 'Ocurrió un error al agregar el sexo.');
        }
        res.redirect('/admin/adminmascotas');
    }
});

router.post('/adminmascotas/eliminar', isLoggedIn, async (req, res) => {
    try {
        const ID_TIPO_RAZA = req.body.id_tipo_raza;
        if (!ID_TIPO_RAZA) {
            req.flash('auto_error', 'ID de relación no proporcionado.');
            return res.redirect('/admin/adminmascotas');
        }

        const mascotasDependientes = await pool.query('SELECT ID_MASCOTAS FROM mascotas WHERE ID_TIPO_RAZA = ?', [ID_TIPO_RAZA]);
        if (mascotasDependientes.length > 0) {
            req.flash('auto_error', 'No se puede eliminar la relación porque hay mascotas que dependen de ella. Elimina primero las mascotas relacionadas.');
            return res.redirect('/admin/adminmascotas');
        }

        await pool.query('DELETE FROM tipo_raza WHERE ID_TIPO_RAZA = ?', [ID_TIPO_RAZA]);
        req.flash('auto_success', 'REGISTRO ELIMINADO');
        res.redirect('/admin/adminmascotas');
    } catch (error) {
        console.error('Error al eliminar relación TIPO-RAZA-SEXO:', error);
        req.flash('auto_error', 'Ocurrió un error al eliminar el registro.');
        res.redirect('/admin/adminmascotas');
    }
});


//Ruta para gestionar transacciones
router.get('/gestiontransacciones', async (req, res) => {
    res.render('admin/gestiontransacciones');
});

// //Ruta ver usuarios
router.get('/verusuarios', isLoggedIn, async (req, res) => {
        const { nombre, apellido, correo } = req.query;

        let query = `
            SELECT 
                YEAR(USER_FECHA_REGISTRO) AS anio,
                MONTH(USER_FECHA_REGISTRO) AS mes,
                DAY(USER_FECHA_REGISTRO) AS dia,
                USER_NOMBRE,
                USER_APELLIDO,
                USER_CORREO
            FROM usuario
            WHERE USER_CORREO <> 'admin@gmail.com'
        `;

        const params = [];

        if (nombre) {
            query += ` AND USER_NOMBRE LIKE ?`;
            params.push(`%${nombre}%`);
        }
        if (apellido) {
            query += ` AND USER_APELLIDO LIKE ?`;
            params.push(`%${apellido}%`);
        }
        if (correo) {
            query += ` AND USER_CORREO LIKE ?`;
            params.push(`%${correo}%`);
        }

        const usuarios = await pool.query(query, params);

        const totalRegistros = usuarios.length;

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ usuarios, totalRegistros });
        }

    res.render('admin/verusuarios', {
        usuarios,
        totalRegistros
    });
});


//Ver Adopciones
router.get('/verAdopciones', async (req, res) => {
        const adopcionesPorDia = await pool.query(`
            SELECT ADOPCION_FECHA AS dia, COUNT(*) AS cantidad_adopciones
            FROM adopciones
            GROUP BY dia
            ORDER BY dia
        `);

        const adopcionesPorMes = await pool.query(`
            SELECT DATE_FORMAT(ADOPCION_FECHA, '%m-%Y') AS mes, COUNT(*) AS cantidad_adopciones
            FROM adopciones
            GROUP BY mes
            ORDER BY mes
        `);

        const adopcionesPorAno = await pool.query(`
            SELECT YEAR(ADOPCION_FECHA) AS anio, COUNT(*) AS cantidad_adopciones
            FROM adopciones
            GROUP BY anio
            ORDER BY anio
        `);

    res.render('admin/verAdopciones',  {
        adopcionesPorDia,
        adopcionesPorMes,
        adopcionesPorAno
    } );
});


//Botónes Volver 
router.get('/verusuarios', isLoggedIn, async (req, res) => {
    res.render('admin/gestiontransacciones');
});

router.get('/verReservas', isLoggedIn, async (req, res) => {
    res.render('admin/gestiontransacciones');
});

router.get('/verEstaciones', isLoggedIn, async (req, res) => {
    res.render('admin/gestiontransacciones');
});


module.exports = router;
