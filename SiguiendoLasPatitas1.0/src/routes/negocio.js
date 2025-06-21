const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn, isnoLoggedIn } = require('../lib/auth')

router.get('/sobreNosotros', isnoLoggedIn, async (req, res) => {
    res.render('negocio/sobreNosotros');
})

router.get('/contacto', isnoLoggedIn, async (req, res) => {
    res.render('negocio/contacto');
})

router.post('/contacto', async (req, res) => {
    const { 'nombre-apellido': nombreApellido, 'e-mail': email, asunto, mensaje } = req.body;

    // Validación básica de entrada
    if (!nombreApellido || !email || !asunto || !mensaje) {
        return res.render('negocio/contacto', {
            errorMessage: 'Por favor, completa todos los campos del formulario.'
        });
    }

    try {
        // Guardar en la base de datos
        await pool.query(
            'INSERT INTO contactos (nombre_apellido, email, asunto, mensaje) VALUES (?, ?, ?, ?)',
            [nombreApellido, email, asunto, mensaje]
        );

        // Enviar email de confirmación
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'siguiendolaspatitas.contacto@gmail.com',
                pass: 'jkia vroh bcrm rkfo'
            }
        });

        const mailOptions = {
            from: '"Siguiendo Las Patitas" siguiendolaspatitas.contacto@gmail.com',
            to: email,
            subject: '¡Gracias por tu mensaje! 🐾',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                <p>Hola <strong>${nombreApellido}</strong>,</p>

                <p>¡Gracias por escribirnos! Recibimos tu mensaje y queremos que sepas que tu interés es muy importante para nosotros.</p>

                <p>A continuación, te dejamos un resumen de lo que nos compartiste:</p>

                <blockquote style="border-left: 4px solid #ffc107; margin: 1em 0; padding: 0.5em 1em; background-color: #f9f9f9;">
                    <p><strong>Asunto:</strong> ${asunto}</p>
                    <p>${mensaje}</p>
                </blockquote>

                <p>Nos comprometemos a responderte a la brevedad. Mientras tanto, te invitamos a seguir explorando nuestro sitio y conocer más sobre nuestro trabajo ayudando a las mascotas a encontrar un hogar lleno de amor.</p>

                <p>Gracias por ser parte de esta comunidad que cree en el cuidado y la adopción responsable. 🐶🐱</p>

                <p>Con cariño,<br>
                El equipo de <strong>Siguiendo Las Patitas</strong></p>
            `
        };

        await transporter.sendMail(mailOptions);

        req.flash('auto_success', 'Mail enviado correctamente');
        res.render('negocio/contacto', {
            successMessage: '¡Gracias por contactarte! Te enviamos un mail de confirmación.'
        });

    } catch (error) {
        console.error('Error al guardar o enviar el mail:', error);
        // Verificar si el error es de la base de datos o de nodemailer
        if (error.code) { // Código de error de MySQL por ejemplo
            req.flash('auto_error', 'Ocurrió un error al guardar tu mensaje en nuestra base de datos.');
        } else if (error.name === 'Error' && error.message.includes('No recipients defined')) {
            req.flash('auto_error', 'Error al enviar el email: destinatario no válido. Por favor, verifica tu dirección de correo.');
        } else {
            req.flash('auto_error', 'Ocurrió un error al enviar el mail. Por favor, intentá de nuevo más tarde.');
        }
        res.render('negocio/contacto', {
            errorMessage: 'Ocurrió un error al procesar tu contacto. Por favor, intentá de nuevo.'
        });
    }
});

module.exports = router;