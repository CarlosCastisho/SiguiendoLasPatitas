const express = require('express');
const router = express.Router();

const pool =  require('../database');
const {isLoggedIn} = require('../lib/auth');
const helpers = require('../lib/helpers');

router.get('/', isLoggedIn, async (req, res) => {
    const adminuser = await pool.query('SELECT * FROM usuario WHERE ID_USER > 1 ');
    res.render('admin/gestionUser', { adminuser });
});

router.get('/eliminar/:ID_USER', isLoggedIn, async (req,res) => {
    const {ID_USER} = req.params;
    await pool.query('DELETE FROM usuario WHERE ID_USER = ?', [ID_USER]);
    req.flash('auto_success', 'USUARIO ELIMINADO')
    res.redirect('/admin');
});

router.get('/editarAdminUser/:ID_USER', isLoggedIn, async (req,res) => {
    const {ID_USER} = req.params;
    const editarAdminUser = await pool.query('SELECT * FROM usuario WHERE ID_USER = ?', [ID_USER]);
    res.render('admin/editarAdminUser', {editarAdminUser: editarAdminUser[0]});
});


router.post('/editarAdminUser/:ID_USER', isLoggedIn, async (req,res) => {
    const { ID_USER } = req.params;
    const { user_contrasenia } = req.body;
    const editarAdminUser = {
        user_contrasenia: await helpers.encryptContrasenia(user_contrasenia)
    };
    await pool.query('UPDATE usuario set ? WHERE ID_USER = ?', [editarAdminUser, ID_USER]);
    req.flash('auto_success', 'Contraseña restablecida');
    res.redirect('/admin');
});


router.get('/gestionReservas', isLoggedIn, async (req, res) => {
    /* try { */
//         const reservas = await pool.query(`
//             SELECT 
//                 reservas.ID_RESERVA,
//                 reservas.RESERVA_FECHA,
//                 reservas.RESERVA_HORA_INI,
//                 reservas.RESERVA_HORA_FIN,
//                 reservas.RESERVA_IMPORTE,
//                 estaciones_carga.ESTC_NOMBRE,
//                 estaciones_carga.ESTC_DIRECCION,
//                 estaciones_carga.ESTC_LOCALIDAD,
//                 estado_reservas.EST_RES_DESCRIP,
//                 usuarios.USER_CORREO
//             FROM 
//                 reservas
//             JOIN 
//                 surtidores ON reservas.ID_SURTIDOR = surtidores.ID_SURTIDOR
//             JOIN 
//                 estaciones_carga ON surtidores.ID_ESTC = estaciones_carga.ID_ESTC
//             JOIN 
//                 estado_reservas ON reservas.ID_EST_RES = estado_reservas.ID_EST_RES
//             JOIN 
//                 usuario usuarios ON reservas.ID_USER = usuarios.ID_USER
//         `);

        res.render('admin/gestionReservas', /* { reservas } */);
    // } catch (error) {
    //     console.error('Error al obtener las reservas:', error);
    //     res.status(500).send('Error al obtener las reservas.');
    // }
});

// router.get('/gestionReservas/cancelar/:ID_RESERVA', isLoggedIn, async (req, res) =>{
//     const {ID_RESERVA} = req.params;
//     await pool.query(`UPDATE reservas SET ID_EST_RES = 3 WHERE ID_RESERVA = ?`,[ID_RESERVA]);
//     res.redirect('/admin/gestionReservas');
// });


router.get('/adminmascotas', isLoggedIn, async (req, res) => {
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
});
            
// //Ruta para agregar relación entre marca, modelo y tipo de conector
router.post('/adminmascotas', isLoggedIn, async (req, res) => {
    const { id_tipo, id_raza, id_sexo } = req.body;
    try {
        if (id_tipo && id_raza && id_sexo) {
            await pool.query('INSERT INTO tipo_raza (ID_TIPO, ID_RAZA, ID_SEXO) VALUES (?, ?, ?)', [id_tipo, id_raza, id_sexo]);
            req.flash('auto_success', 'Relación agregada con éxito');
        }
        res.redirect('/admin/adminmascotas');
    } catch (error) {
        console.error('Error al agregar relación TIPO-RAZA-SEXO:', error);
        res.status(500).send('Error al agregar la relación');
    }
});

// Ruta para agregar un tipo de mascota
router.post('/adminmascotas/tipo', isLoggedIn, async (req, res) => {
    const { tipo_nombre } = req.body;
    const nuevo_tipo_nombre = {tipo_nombre}
    await pool.query('INSERT INTO tipo set ?', [nuevo_tipo_nombre]);
    req.flash('auto_success', 'TIPO AGREGADO CORRECTAMENTE');
    res.redirect('/admin/adminmascotas');
});

// Ruta para agregar una raza
router.post('/adminmascotas/raza', isLoggedIn, async (req, res) => {
    const { raza_nombre } = req.body;
    if (raza_nombre) {
        await pool.query('INSERT INTO raza (raza_nombre) VALUES (?)', [raza_nombre]);
    }
    req.flash('auto_success', 'RAZA AGREGADA CORRECTAMENTE');
    res.redirect('/admin/adminmascotas');
});

// Ruta para agregar un sexo
router.post('/adminmascotas/sexo', isLoggedIn, async (req, res) => {
    const { sexo_nombre } = req.body;
    if (sexo_nombre) {
        await pool.query('INSERT INTO sexo (sexo_nombre) VALUES (?)', [sexo_nombre]);
    }
    req.flash('auto_success', 'SEXO AGREGADO CORRECTAMENTE');
    res.redirect('/admin/adminmascotas');
});

router.post('/adminmascotas/eliminar', isLoggedIn, async (req, res) => {
    const ID_TIPO_RAZA = req.body.id_tipo_raza;
    await pool.query('DELETE FROM tipo_raza WHERE ID_TIPO_RAZA = ?', [ID_TIPO_RAZA]);
    req.flash('auto_success', 'RESGISTRO ELIMINADO')
    res.redirect('/admin/adminmascotas');
});

router.get('/gestionEstaciones', async (req, res) => {
//     try {
//         const estaciones = await pool.query(`
//         SELECT
//             estaciones_carga.ID_ESTC,
//             estaciones_carga.ESTC_NOMBRE,
//             estaciones_carga.ESTC_DIRECCION,
//             estaciones_carga.ESTC_LOCALIDAD,
//             provincias.PROVINCIA_NOMBRE,
//             estaciones_carga.ESTC_CANT_SURTIDORES,
//             estaciones_carga.ESTC_LATITUD,
//             estaciones_carga.ESTC_LONGITUD
//         FROM
//             estaciones_carga
//         JOIN
//             provincias ON estaciones_carga.ID_PROVINCIA = provincias.ID_PROVINCIA
//         `);
//         const provincias = await pool.query('SELECT * FROM provincias');
        res.render('admin/gestionEstaciones', /* { estaciones, provincias } */); 
//     } catch (error) {
//         console.error('Error al obtener las estaciones o provincias:', error);
//         res.status(500).send('Error al cargar las estaciones');
//     }
});

// // Ruta para crear una estación de carga
// router.post('/gestionEstaciones', async (req, res) => {
//     console.log(req.body);
//     const {
//         estc_nombre,
//         estc_direccion,
//         estc_localidad,
//         estc_cant_surtidores,
//         id_provincia,
//         estc_latitud,
//         estc_longitud
//     } = req.body;

//     try {
//         // Validar que todos los campos requeridos están presentes
//         if (!estc_nombre || !estc_direccion || !estc_localidad || !estc_cant_surtidores || !id_provincia || !estc_latitud || !estc_longitud) {
//             req.flash('error', 'Por favor, completa todos los campos.');
//             return res.redirect('/admin/gestionEstaciones');
//         }

//         // Insertar la estación en la base de datos
//         const result = await pool.query(
//             'INSERT INTO estaciones_carga (ESTC_NOMBRE, ESTC_DIRECCION, ESTC_LOCALIDAD, ESTC_CANT_SURTIDORES, ID_PROVINCIA, ESTC_LATITUD, ESTC_LONGITUD) VALUES (?, ?, ?, ?, ?, ?, ?)', 
//             [estc_nombre, estc_direccion, estc_localidad, estc_cant_surtidores, id_provincia, estc_latitud, estc_longitud]
//         );

//         // Obtener el ID de la estación recién creada
//         const idEstacion = result.insertId;

//         // Insertar los surtidores en la tabla surtidores
//         for (let i = 0; i < estc_cant_surtidores; i++) {
//             await pool.query(
//                 'INSERT INTO surtidores (SURT_ESTADO, ID_ESTC) VALUES (?, ?)', 
//                 [1, idEstacion]  
//             );
//         }

//         req.flash('success', 'Estación de carga y surtidores creados exitosamente.');
//         res.redirect('/admin/gestionEstaciones');
//     } catch (error) {
//         console.error('Error al crear estación de carga o surtidores:', error);
//         req.flash('error', 'Ocurrió un error al crear la estación de carga y los surtidores.');
//         res.redirect('/admin/gestionEstaciones');
//     }
// });

// router.get('/gestionEstaciones/eliminar/:ID_ESTC', isLoggedIn, async (req,res) => {
//     const {ID_ESTC} = req.params;
//     await pool.query('DELETE FROM surtidores WHERE ID_ESTC = ?', [ID_ESTC]);
//     await pool.query('DELETE FROM estaciones_carga WHERE ID_ESTC = ?', [ID_ESTC]);
//     req.flash('auto_success', 'ESTACION ELIMINADA')
//     res.redirect('/admin/gestionEstaciones');
// });

//Ruta para gestionar transacciones
router.get('/gestiontransacciones', async(req, res)=>{
    res.render('admin/gestiontransacciones');
});

// //Ruta ver usuarios
router.get('/verusuarios', isLoggedIn, async (req, res) => {
//     const { nombre, apellido, correo } = req.query;
    
//     let query = `
//         SELECT 
//             YEAR(USER_FECHA_REGISTRO) AS anio,
//             MONTH(USER_FECHA_REGISTRO) AS mes,
//             DAY(USER_FECHA_REGISTRO) AS dia,
//             USER_NOMBRE,
//             USER_APELLIDO,
//             USER_CORREO
//         FROM usuario
//         WHERE USER_CORREO <> 'admin@gmail.com'
//     `;

//     const params = [];

//     if (nombre) {
//         query += ` AND USER_NOMBRE LIKE ?`;
//         params.push(`%${nombre}%`);
//     }
//     if (apellido) {
//         query += ` AND USER_APELLIDO LIKE ?`;
//         params.push(`%${apellido}%`);
//     }
//     if (correo) {
//         query += ` AND USER_CORREO LIKE ?`;
//         params.push(`%${correo}%`);
//     }

//     const usuarios = await pool.query(query, params);

//     const totalRegistros = usuarios.length;

//     if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//         return res.json({ usuarios, totalRegistros });
//     }

    res.render('admin/verusuarios',/*  {
        usuarios,
        totalRegistros
    } */);
});


//Ver Reservas
router.get('/verReservas', async (req, res) => {
//     const reservasPorDia = await pool.query(`
//         SELECT RESERVA_FECHA AS dia, COUNT(*) AS cantidad_reservas
//         FROM reservas
//         GROUP BY dia
//         ORDER BY dia
//     `);

//     const reservasPorMes = await pool.query(`
//         SELECT DATE_FORMAT(RESERVA_FECHA, '%Y-%m') AS mes, COUNT(*) AS cantidad_reservas
//         FROM reservas
//         GROUP BY mes
//         ORDER BY mes
//     `);

//     const reservasPorAno = await pool.query(`
//         SELECT YEAR(RESERVA_FECHA) AS anio, COUNT(*) AS cantidad_reservas
//         FROM reservas
//         GROUP BY anio
//         ORDER BY anio
//     `);

    res.render('admin/verReservas', /* {
        reservasPorDia,
        reservasPorMes,
        reservasPorAno
    } */);
});

// Ver Estaciones
router.get('/verEstaciones', async (req, res) => {
//     const { estacion } = req.query;

//     let filtroEstacion = estacion ? `WHERE EC.ESTC_NOMBRE LIKE ${pool.escape(`%${estacion}%`)}` : '';
//     let indicadores = {};

//     // Consultas para los diferentes indicadores
//     indicadores.reservasPorDia = await pool.query(`
//         SELECT 
//             EC.ESTC_NOMBRE AS estacion,
//             R.RESERVA_FECHA AS dia,
//             COUNT(*) AS total_reservas
//         FROM reservas R
//         JOIN surtidores S ON R.ID_SURTIDOR = S.ID_SURTIDOR
//         JOIN estaciones_carga EC ON S.ID_ESTC = EC.ID_ESTC
//         ${filtroEstacion}
//         GROUP BY EC.ESTC_NOMBRE, R.RESERVA_FECHA
//         ORDER BY EC.ESTC_NOMBRE, R.RESERVA_FECHA;
//     `);

//     indicadores.reservasPorMes = await pool.query(`
//         SELECT 
//             EC.ESTC_NOMBRE AS estacion,
//             DATE_FORMAT(R.RESERVA_FECHA, '%Y-%m') AS mes,
//             COUNT(*) AS total_reservas
//         FROM reservas R
//         JOIN surtidores S ON R.ID_SURTIDOR = S.ID_SURTIDOR
//         JOIN estaciones_carga EC ON S.ID_ESTC = EC.ID_ESTC
//         ${filtroEstacion}
//         GROUP BY EC.ESTC_NOMBRE, mes
//         ORDER BY EC.ESTC_NOMBRE, mes;
//     `);

//     indicadores.reservasPorAno = await pool.query(`
//         SELECT 
//             EC.ESTC_NOMBRE AS estacion,
//             YEAR(R.RESERVA_FECHA) AS anio,
//             COUNT(*) AS total_reservas
//         FROM reservas R
//         JOIN surtidores S ON R.ID_SURTIDOR = S.ID_SURTIDOR
//         JOIN estaciones_carga EC ON S.ID_ESTC = EC.ID_ESTC
//         ${filtroEstacion}
//         GROUP BY EC.ESTC_NOMBRE, anio
//         ORDER BY EC.ESTC_NOMBRE, anio;
//     `);

    res.render('admin/verEstaciones', /* { indicadores, estacion } */);
});

//Botónes Volver 
router.get('/verusuarios', isLoggedIn, async(req, res) => {
    res.render('admin/gestiontransacciones');
});

router.get('/verReservas', isLoggedIn, async(req, res) => {
    res.render('admin/gestiontransacciones');
});

router.get('/verEstaciones', isLoggedIn, async(req, res) => {
    res.render('admin/gestiontransacciones');
});


module.exports = router;
