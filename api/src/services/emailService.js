import nodemailer from 'nodemailer';

// Sanitizado de variables de entorno para evitar errores de espacios invisibles
const user = (process.env.EMAIL_USER || '').trim();
const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Forzar conexión SSL segura
    auth: {
        user: (process.env.EMAIL_USER || '').trim(),
        pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, '')
    }
});

// Método de verificación para comprobar la autenticación SMTP al arrancar la app
export const verificarConexionEmail = async () => {
    try {
        await transporter.verify();
        console.log('✅ Servidor de correo de Gmail autenticado y listo.');
    } catch (error) {
        console.error('❌ Error de autenticación en Nodemailer/Gmail:', error.message);
    }
};

export const enviarEmailConfirmacion = async (destinatario, datosReserva) => {
    const { 
        id, 
        total, 
        fecha, 
        cantidad_adultos = 1, 
        cantidad_menores = 0, 
        actividad_nombre, 
        telefono 
    } = datosReserva;

    // Formateo del texto para el desglose de pasajeros
    const textoPasajeros = `${cantidad_adultos} Adulto(s)` + (cantidad_menores > 0 ? `, ${cantidad_menores} Menor(es)` : '');

    const mailOptions = {
        from: `"Rumbo Serrano" <${user}>`,
        to: destinatario,
        subject: `Confirmación de Reserva #${id} - Rumbo Serrano`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #121212; padding: 20px; text-align: center; color: #ffffff;">
                    <h2 style="margin: 0; letter-spacing: 2px;">RUMBO SERRANO</h2>
                    <p style="margin: 5px 0 0 0; color: #A0A0A0; font-size: 14px;">¡Tu reserva ha sido confirmada!</p>
                </div>
                <div style="padding: 24px; background-color: #ffffff; color: #222222;">
                    <p>Hola,</p>
                    <p>Gracias por reservar con nosotros. A continuación tenés el resumen de tu compra:</p>
                    
                    <div style="background-color: #F8FAFC; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Número de Reserva:</strong> #${id}</p>
                        <p style="margin: 5px 0;"><strong>Actividad:</strong> ${actividad_nombre || 'Experiencia Serrano'}</p>
                        <p style="margin: 5px 0;"><strong>Fecha programada:</strong> ${fecha}</p>
                        <p style="margin: 5px 0;"><strong>Pasajeros:</strong> ${textoPasajeros}</p>
                        ${telefono ? `<p style="margin: 5px 0;"><strong>Teléfono de contacto:</strong> ${telefono}</p>` : ''}
                        <p style="margin: 15px 0 5px 0; font-size: 18px; font-weight: bold; color: #111111;"><strong>Total abonado:</strong> $${Number(total).toLocaleString('es-AR')} ARS</p>
                    </div>

                    <p style="font-size: 14px; color: #666666;">Si tenés alguna duda sobre tu viaje, podés responder directamente a este correo.</p>
                </div>
                <div style="background-color: #F1F5F9; padding: 12px; text-align: center; font-size: 12px; color: #64748B;">
                    Rumbo Serrano - Valle de Calamuchita, Córdoba.
                </div>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};