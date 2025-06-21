const express = require('express');
const router = express.Router();

const passport = require('passport');
const { isLoggedIn, isnoLoggedIn } = require('../lib/auth');
const pool = require('../database');
const helpers = require('../lib/helpers');

// RENDERIZA EL FORMULARIO
router.get('/registro', isnoLoggedIn, (req, res) => {
    res.render('adoptantes/registro')
});

//REGISTRO
router.post('/registro', isnoLoggedIn, passport.authenticate('local.registro', {
    successRedirect: '/mascotas',
    failureRedirect: '/registro',
    failureFlash: true
}))

//ACCESO
router.get('/acceso', isnoLoggedIn, (req, res) => {
    res.render('adoptantes/acceso')
})

router.post('/acceso', isnoLoggedIn, (req, res, next) => {
    const { user_correo } = req.body;
    passport.authenticate('local.acceso', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('adoptantes/acceso', {
                user_correo,
            });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            if (user.ID_USER === 1) {
                return res.redirect('/admin')
            } else {
                return res.redirect('/mascotas')
            }
        })
    })(req, res, next);
});

// //PAGINA DE ADOPTANTES
router.get('/registroadoptantes', isLoggedIn, async (req, res) => {
    res.render('adoptantes/registroAdoptantes')
})

// Ruta para agregar un adoptante
router.post('/registroadoptantes', isLoggedIn, async (req, res) => {
    try {
        const { ID_USER } = req.user;
        const {
            adoptante_nombre,
            adoptante_direccion
        } = req.body;

        // Validar que todos los campos requeridos están presentes
        if (!adoptante_nombre || !adoptante_direccion) {
            req.flash('auto_error', 'Por favor, completa todos los campos.');
            return res.redirect('/adoptantes/registroAdoptantes');
        }

        // Insertar la adoptantes en la base de datos
        await pool.query(
            'INSERT INTO adopts (ADOPTS_NOMBRE, ADOPTS_DIRECCION, ID_USER) VALUES (?, ?, ?)',
            [adoptante_nombre, adoptante_direccion, ID_USER]
        );
        req.flash('auto_success', 'Adoptante creado exitosamente.');
        res.redirect('/adoptantes/listaradoptantes');
    } catch (error) {
        console.error('Error al crear un adoptante:', error);
        // Puedes ser más específico con el mensaje de error si el error.code indica un duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            req.flash('auto_error', 'Este adoptante ya existe o hay un problema de clave única.');
        } else {
            req.flash('auto_error', 'Ocurrió un error al registrar un adoptante.');
        }
        res.redirect('/adoptantes/registroAdoptantes'); // Redirigir de nuevo al formulario de registro
    }
});

router.get('/listaradoptantes', isLoggedIn, async (req, res) => {
    try {
        const { ID_USER } = req.user;
        const listaradoptantes = await pool.query('SELECT * FROM adopts WHERE ID_USER = ?', [ID_USER]);
        res.render('adoptantes/listaradoptantes', { listaradoptantes })
    } catch (error) {
        console.error('Error al listar adoptantes:', error);
        req.flash('auto_error', 'Ocurrió un error al cargar la lista de adoptantes.');
        res.redirect('/'); // O a una página de inicio
    }
})

router.get('/eliminar/:ID_ADOPTS', isLoggedIn, async (req, res) => {
    try {
        const { ID_ADOPTS } = req.params;

        const adopciones = await pool.query('SELECT * FROM adopciones WHERE ID_ADOPTS = ?', [ID_ADOPTS]);

        if (adopciones.length > 0) {
            req.flash('auto_error', 'No podés eliminar este adoptante porque tiene una adopción asignada.');
            return res.redirect('/adoptantes/listaradoptantes');
        }

        await pool.query('DELETE FROM adopts WHERE ID_ADOPTS = ?', [ID_ADOPTS]);
        req.flash('auto_success', 'Adoptante eliminado correctamente.');
        res.redirect('/adoptantes/listaradoptantes');
    } catch (error) {
        console.error('Error al eliminar adoptante:', error);
        req.flash('auto_error', 'Ocurrió un error al eliminar el adoptante.');
        res.redirect('/adoptantes/listaradoptantes');
    }
});

//PAGINA DEL MAPA
router.get('/mapa', isLoggedIn, async (req, res) => {
    try {
        const { ID_USER } = req.user;
        const adoptarMapa = await pool.query(`
            SELECT
                adopciones.ID_ADOPCIONES,
                DATE_FORMAT(adopciones.ADOPCION_FECHA, '%d/%m/%Y') AS ADOPCION_FECHA,
                mascotas.MASCOTAS_NOMBRE,
                DATE_FORMAT(mascotas.MASCOTAS_FNAC, '%d/%m/%Y') AS MASCOTAS_FNAC,
                tipo.TIPO_NOMBRE,
                raza.RAZA_NOMBRE,
                adopts.ADOPTS_NOMBRE,
                adopts.ADOPTS_DIRECCION
            FROM
                adopciones
            JOIN mascotas ON adopciones.ID_MASCOTAS = mascotas.ID_MASCOTAS
            JOIN tipo_raza ON mascotas.ID_TIPO_RAZA = tipo_raza.ID_TIPO_RAZA
            JOIN tipo ON tipo_raza.ID_TIPO = tipo.ID_TIPO
            JOIN raza ON tipo_raza.ID_RAZA = raza.ID_RAZA
            JOIN adopts ON adopciones.ID_ADOPTS = adopts.ID_ADOPTS
            WHERE
                adopciones.ID_USER = ?
        `, [ID_USER]);

        console.log(adoptarMapa); // Esto es útil para depurar
        res.render('adoptantes/mapa', { adoptarMapa});
    } catch (error) {
        console.error('Error al cargar la página del mapa:', error);
        req.flash('auto_error', 'Ocurrió un error al cargar los datos del mapa.');
        res.redirect('/'); // Redirigir a una página de inicio o error
    }
});

// PAGINA DE ADOPTAR


router.get('/asignar/:ID_ADOPTS', isLoggedIn, async (req, res) => {
    try {
        const { ID_USER } = req.user;
        const { ID_ADOPTS } = req.params;

        // Validar ID_ADOPTS
        if (isNaN(ID_ADOPTS)) {
            req.flash('auto_error', 'ID de adoptante inválido.');
            return res.redirect('/adoptantes/listaradoptantes');
        }

        const mascotas = await pool.query(`
            SELECT
                mascotas.ID_MASCOTAS,
                mascotas.MASCOTAS_NOMBRE,
                mascotas.MASCOTAS_FNAC,
                tipo.TIPO_NOMBRE,
                raza.RAZA_NOMBRE
            FROM mascotas
            JOIN tipo_raza ON mascotas.ID_TIPO_RAZA = tipo_raza.ID_TIPO_RAZA
            JOIN tipo ON tipo_raza.ID_TIPO = tipo.ID_TIPO
            JOIN raza ON tipo_raza.ID_RAZA = raza.ID_RAZA
            LEFT JOIN adopciones ON mascotas.ID_MASCOTAS = adopciones.ID_MASCOTAS
            WHERE mascotas.ID_USER = ? AND adopciones.ID_MASCOTAS IS NULL` , [ID_USER]);
        const adoptantes = await pool.query('SELECT * FROM adopts WHERE ID_USER = ? AND ID_ADOPTS = ?', [ID_USER, ID_ADOPTS]);

        if (adoptantes.length === 0) {
            req.flash('auto_error', 'Adoptante no encontrado o no pertenece a tu cuenta.');
            return res.redirect('/adoptantes/listaradoptantes');
        }

        res.render('adoptantes/asignar', { mascotas, adoptantes}); // Pasar solo el primer adoptante
    } catch (error) {
        console.error('Error al cargar la página de asignar adopción:', error);
        req.flash('auto_error', 'Ocurrió un error al cargar la página para asignar la adopción.');
        res.redirect('/adoptantes/listaradoptantes'); // Redirigir a la lista de adoptantes
    }
});

router.post('/asignar', isLoggedIn, async (req, res) => {
    const { ID_USER } = req.user;
    const { id_mascota, id_adopts } = req.body;

    // Validación de entrada
    if (!id_mascota || !id_adopts) {
        req.flash('auto_error', 'Debes seleccionar una mascota y un adoptante.');
        return res.redirect(`/adoptantes/asignar/${id_adopts}`); // Redirigir al formulario con el adoptante pre-seleccionado
    }

    try {
        // Verificar si la mascota ya está asignada
        const mascotaAsignada = await pool.query('SELECT ID_MASCOTAS FROM adopciones WHERE ID_MASCOTAS = ?', [id_mascota]);
        if (mascotaAsignada.length > 0) {
            req.flash('auto_error', 'Esta mascota ya ha sido asignada a una adopción.');
            return res.redirect(`/adoptantes/asignar/${id_adopts}`);
        }

        await pool.query(
            'INSERT INTO adopciones (ID_USER, ID_EST_ADOP, ID_ADOPTS, ID_MASCOTAS) VALUES (?, ?, ?,  ?)',
            [ID_USER, 1, id_adopts, id_mascota] // Asumo ID_EST_ADOP = 1 es "activa" o "pendiente"
        );
        req.flash('auto_success', 'Adopción registrada correctamente.');
        res.redirect('/adoptantes/adoptar');
    } catch (error) {
        console.error('Error al registrar la adopción:', error);
        req.flash('auto_error', 'Hubo un error al registrar la adopción. Por favor, asegúrate de que la mascota y el adoptante sean válidos.');
        res.redirect(`/adoptantes/asignar/${id_adopts}`); // Volver al formulario de asignación
    }
});

router.get('/adoptar', isLoggedIn, async (req, res) => {
    try {
        const { ID_USER } = req.user;
        const adoptar = await pool.query(`
            SELECT
                adopciones.ID_ADOPCIONES,
                adopciones.ADOPCION_FECHA,
                mascotas.MASCOTAS_NOMBRE,
                mascotas.MASCOTAS_FNAC,
                tipo.TIPO_NOMBRE,
                raza.RAZA_NOMBRE,
                adopts.ADOPTS_NOMBRE,
                adopts.ADOPTS_DIRECCION
            FROM
                adopciones
            JOIN mascotas ON adopciones.ID_MASCOTAS = mascotas.ID_MASCOTAS
            JOIN tipo_raza ON mascotas.ID_TIPO_RAZA = tipo_raza.ID_TIPO_RAZA
            JOIN tipo ON tipo_raza.ID_TIPO = tipo.ID_TIPO
            JOIN raza ON tipo_raza.ID_RAZA = raza.ID_RAZA
            JOIN adopts ON adopciones.ID_ADOPTS = adopts.ID_ADOPTS
            WHERE
                adopciones.ID_USER = ?
        `, [ID_USER]);
        res.render('adoptantes/listaradoptar', { adoptar })
    } catch (error) {
        console.error('Error al listar adopciones:', error);
        req.flash('auto_error', 'Ocurrió un error al cargar la lista de adopciones.');
        res.redirect('/'); // O a alguna página de inicio
    }
});

router.get('/cancelar/:ID_ADOPCIONES', isLoggedIn, async (req, res) => {
    try {
        const { ID_ADOPCIONES } = req.params;
        await pool.query('DELETE FROM adopciones WHERE ID_ADOPCIONES = ?', [ID_ADOPCIONES]);
        req.flash('auto_success', 'ADOPCION ELIMINADA');
        res.redirect('/adoptantes/adoptar');
    } catch (error) {
        console.error('Error al cancelar adopción:', error);
        req.flash('auto_error', 'Ocurrió un error al eliminar la adopción.');
        res.redirect('/adoptantes/adoptar');
    }
});

router.get('/perfil', isLoggedIn, (req, res) => {
    res.render('adoptantes/perfil');
});

// router.get('/editarUser/:ID_USER', isLoggedIn, async (req, res) => {
//     const { ID_USER } = req.params;
//     const editarUser = await pool.query('SELECT * FROM usuario WHERE ID_USER = ?', [ID_USER]);
//     res.render('adoptantes/editarUser', { editarUser: editarUser[0] });
// });

// router.post('/editarUser/:ID_USER', isLoggedIn, async (req, res) => {
//     const { ID_USER } = req.params;
//     const { user_nombre, user_apellido, user_telefono, user_contrasenia } = req.body;
//     const editarUser = {
//         user_nombre,
//         user_apellido,
//         user_telefono,
//         user_contrasenia: await helpers.encryptContrasenia(user_contrasenia)
//     };
//     await pool.query('UPDATE usuario set ? WHERE ID_USER = ?', [editarUser, ID_USER]);
//     req.flash('auto_success', 'Usuario actualizado con éxito');
//     res.redirect('/perfil');
// })


router.get('/cerrar', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return next(err);
        }
        res.redirect('/acceso');
    });
});

module.exports = router;