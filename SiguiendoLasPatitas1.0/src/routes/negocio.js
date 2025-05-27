const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const pool =  require('../database');
const {isLoggedIn, isnoLoggedIn} = require('../lib/auth')

router.get('/sobreNosotros', isnoLoggedIn, async (req, res) => {
    res.render('negocio/sobreNosotros');
})

router.get('/contacto', isnoLoggedIn, async (req, res) => {
    res.render('negocio/contacto');    
})

router.post('/contacto', async (req, res) => {
    const { 'nombre-apellido': nombreApellido, 'e-mail': email, asunto, mensaje } = req.body;

    try {
        // Guardar en la base de datos
        await pool.query(
            'INSERT INTO contactos (nombre_apellido, email, asunto, mensaje) VALUES (?, ?, ?, ?)',
            [nombreApellido, email, asunto, mensaje]
        );
        req.flash('auto_success', 'Mail enviado correctamente');

        // Enviar email de confirmación
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'gonzaoca9@gmail.com',
                pass: 'tteh hlqe zkff ysmd'
            }
        });

        const mailOptions = {
            from: '"Siguiendo Las Patitas!" <gonzaoca9@gmail.com',
            to: email,
            subject: 'Confirmación de contacto',
            html: `
                <p>Hola ${nombreApellido},</p>
                <p>Gracias por contactarte con nosotros.</p>
                <p>Recibimos tu mensaje:</p>
                <blockquote><strong>${asunto}</strong><br>${mensaje}</blockquote>
                <p>Nos pondremos en contacto con vos pronto.</p>
                <p>Saludos,<br>El equipo de Tu Negocio</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.render('negocio/contacto', {
            successMessage: '¡Gracias por contactarte! Te enviamos un mail de confirmación.'
        });

    } catch (error) {
        console.error('Error al guardar o enviar el mail:', error);
        res.render('negocio/contacto', {
            errorMessage: 'Ocurrió un error al procesar tu contacto. Por favor, intentá de nuevo.'
        });
    }
});

module.exports = router;
