const express = require('express');
const router = express.Router();

const passport = require('passport');
const { isLoggedIn, isnoLoggedIn } = require('../lib/auth');
const pool = require('../database');
const helpers = require('../lib/helpers');

// RENDERIZA EL FORMULRIO
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
    const { ID_USER } = req.user;
    const {
        adoptante_nombre,
        adoptante_direccion
    } = req.body;
    try {
        // Validar que todos los campos requeridos están presentes
        if (!adoptante_nombre || !adoptante_direccion) {
            req.flash('error', 'Por favor, completa todos los campos.');
            return res.redirect('/adoptantes/registroAdoptantes');
        }

        // Insertar la adoptantes en la base de datos
        await pool.query(
            'INSERT INTO adopts (ADOPTS_NOMBRE, ADOPTS_DIRECCION, ID_USER) VALUES (?, ?, ?)',
            [adoptante_nombre, adoptante_direccion, ID_USER]
        );
        req.flash('success', 'Adoptantes creado exitosamente.');
        res.redirect('/adoptantes/listarAdoptantes');
    } catch (error) {
        console.error('Error al crear un adoptante:', error);
        req.flash('error', 'Ocurrió un error al registar un adoptante');
        res.redirect('/adoptantes/listarAdoptantes');
    }
});

router.get('/listaradoptantes', isLoggedIn, async (req, res) => {
    const { ID_USER } = req.user;
    const listaradoptantes = await pool.query('SELECT * FROM adopts WHERE ID_USER = ?', [ID_USER]);
    res.render('adoptantes/listarAdoptantes', { listaradoptantes })
})

router.get('/eliminar/:ID_ADOPTS', isLoggedIn, async (req, res) => {
    const { ID_ADOPTS } = req.params;

    const adopciones = await pool.query('SELECT * FROM adopciones WHERE ID_ADOPTS = ?', [ID_ADOPTS]);

    if (adopciones.length > 0) {
        req.flash('auto_error', 'No podés eliminar este adoptante porque tiene una adopción asignada.');
        return res.redirect('/adoptantes/listaradoptantes');
    }

    await pool.query('DELETE FROM adopts WHERE ID_ADOPTS = ?', [ID_ADOPTS]);
    req.flash('auto_success', 'Adoptante eliminado correctamente.');
    res.redirect('/adoptantes/listaradoptantes');
});

//PAGINA DEL MAPA
router.get('/mapa', isLoggedIn, async (req, res) => {
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

    console.log(adoptarMapa);
    res.render('adoptantes/mapa', { adoptarMapa });
});

// PAGINA DE ADOPTAR

router.get('/asignar/:ID_ADOPTS', isLoggedIn, async (req, res) => {
    const { ID_USER } = req.user;
    const { ID_ADOPTS } = req.params;
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
        /* LEFT JOIN adopciones ON mascotas.ID_MASCOTAS = adopciones.ID_MASCOTA */
        WHERE mascotas.ID_USER = ? /* AND adopciones.ID_MASCOTAS IS NULL */` , [ID_USER]);
    const adoptantes = await pool.query('SELECT * FROM adopts WHERE ID_USER = ? AND ID_ADOPTS = ?', [ID_USER, ID_ADOPTS]);
    res.render('adoptantes/asignar', { mascotas, adoptantes});
});

router.post('/asignar', isLoggedIn, async (req, res) => {
    const { ID_USER } = req.user;
    const { id_mascota, id_adopts } = req.body;

    try {
        await pool.query(
            'INSERT INTO adopciones (ID_USER, ID_EST_ADOP, ID_ADOPTS, ID_MASCOTAS) VALUES (?, ?, ?,  ?)',
            [ID_USER, 1, id_adopts, id_mascota]
        );
        req.flash('auto_success', 'Adopción registrada correctamente.');
        res.redirect('/adoptantes/adoptar');
    } catch (error) {
        console.error(error);
        req.flash('auto_error', 'Hubo un error al registrar la adopción.');
        res.redirect('/adoptantes/asignar');
    }
});

router.get('/adoptar', isLoggedIn, async (req, res) => {
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
});

router.get('/cancelar/:ID_ADOPCIONES', isLoggedIn, async (req, res) => {
    const { ID_ADOPCIONES } = req.params;
    await pool.query('DELETE FROM adopciones WHERE ID_ADOPCIONES = ?', [ID_ADOPCIONES]);
    req.flash('auto_success', 'ADOPCION ELIMINADA')
    res.redirect('/adoptantes/adoptar');
});

// router.get('/eliminar/:ID_RESERVA', isLoggedIn, async (req, res) => {
//     const { ID_RESERVA } = req.params;
//     await pool.query('DELETE FROM reservas WHERE ID_RESERVA = ?', [ID_RESERVA]);
//     req.flash('auto_success', 'RESERVA ELIMINADA')
//     res.redirect('/auth/listarReserva');
// });


// router.get('/reserva/estacion/:ID_ESTC', isLoggedIn, async (req, res) => {
//     const { ID_ESTC } = req.params;
//     const estacionCargaID_ESTC = await pool.query('SELECT * FROM estaciones_carga WHERE ID_ESTC = ?', [ID_ESTC]);
//     const surtidor = await pool.query('SELECT * FROM surtidores');
//     const tiempo_carga = await pool.query('SELECT * FROM tiempo_carga')
//     res.render('auth/reservaMapa', { estacionCargaID_ESTC: estacionCargaID_ESTC[0], surtidor, tiempo_carga });
// })

// router.post('/reserva/estacion/:ID_ESTC', isLoggedIn, async (req, res) => {
//     const { ID_USER } = req.user;
//     const { ID_ESTC } = req.params;
//     const { reserva_fecha, reserva_hora_ini, reserva_hora_fin, reserva_importe } = req.body;
//     const estadoReserva = await pool.query('SELECT ID_EST_RES FROM estado_reservas WHERE ID_EST_RES = 1');
//     const elegirSurt = await elegirSurtidor(ID_ESTC);
//     try {
//         //Verificar si hay reserva disponible
//         const reservaDisponible = await verificarReserva(estadoReserva, elegirSurt, reserva_fecha, reserva_hora_ini, reserva_hora_fin)
//         if (reservaDisponible) {
//             return res.status(409).json({ message: "Este horario ya esta reservado." })
//         }

//         //Si esta la reserva disponible la creamos.
//         await hacerReserva(reserva_fecha, reserva_hora_ini, reserva_hora_fin, reserva_importe, ID_USER, estadoReserva[0].ID_EST_RES, elegirSurt);
//         res.redirect('/auth/listarReserva');
//     } catch (error) {

//     }
// });

router.get('/perfil', isLoggedIn, (req, res) => {
    res.render('adoptantes/perfil');
});

// router.get('/editarUser/:ID_USER', isLoggedIn, async (req, res) => {
//     const { ID_USER } = req.params;
//     const editarUser = await pool.query('SELECT * FROM usuario WHERE ID_USER = ?', [ID_USER]);
//     res.render('auth/editarUser', { editarUser: editarUser[0] });
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
            return next(err);
        }
        res.redirect('/acceso');
    });
});

module.exports = router;