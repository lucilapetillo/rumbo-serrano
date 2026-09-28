import { Reserva, DetalleReserva, Carrito, ItemCarrito, Actividad } from '../models/index.js';
import { enviarEmailConfirmacion } from '../services/emailService.js';

// 1. CREAR RESERVA DESDE CARRITO (CHECKOUT)
export const checkout = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { telefono, email } = req.body;

        if (!telefono || !email) {
            return res.status(400).json({ mensaje: 'El teléfono y el email son obligatorios.' });
        }

        // Buscar el carrito activo con sus ítems y actividades
        const carrito = await Carrito.findOne({
            where: { usuario_id },
            include: [{
                model: ItemCarrito,
                as: 'ItemCarritos',
                include: [{ model: Actividad, as: 'Actividad' }]
            }]
        });

        if (!carrito || !carrito.ItemCarritos || carrito.ItemCarritos.length === 0) {
            return res.status(400).json({ mensaje: 'El carrito está vacío.' });
        }

        // Calcular total a pagar
        const total = carrito.ItemCarritos.reduce((sum, item) => {
            return sum + (Number(item.Actividad?.precio || 0) * item.cantidad);
        }, 0);

        // Crear la reserva principal
        const nuevaReserva = await Reserva.create({
            usuario_id,
            total,
            telefono,
            email,
            estado: 'confirmada'
        });

        // Guardar cada ítem en la tabla detalles_reserva
        const detallesPromesas = carrito.ItemCarritos.map(item => {
            return DetalleReserva.create({
                reserva_id: nuevaReserva.id,
                actividad_id: item.actividad_id,
                precio_unitario: item.Actividad?.precio || 0,
                cantidad: item.cantidad,
                cantidad_adultos: item.cantidad_adultos || 1,
                cantidad_menores: item.cantidad_menores || 0,
                fecha_reserva: item.fecha_reserva,
                turno: item.turno
            });
        });

        await Promise.all(detallesPromesas);

        // Vaciar el carrito de compras
        await ItemCarrito.destroy({ where: { carrito_id: carrito.id } });

        // Enviar email de confirmación
        try {
            const primerItem = carrito.ItemCarritos[0];
            await enviarEmailConfirmacion(email, {
                id: nuevaReserva.id,
                total,
                fecha: primerItem?.fecha_reserva || 'A confirmar',
                cantidad_adultos: primerItem?.cantidad_adultos || 1,
                cantidad_menores: primerItem?.cantidad_menores || 0,
                actividad_nombre: primerItem?.Actividad?.titulo || 'Experiencia Serrano',
                telefono
            });
        } catch (emailError) {
            console.error('Error al enviar el email de confirmación:', emailError);
        }

        return res.status(201).json({
            mensaje: 'Reserva creada y confirmación enviada con éxito',
            reserva: nuevaReserva
        });

    } catch (error) {
        console.error('Error al procesar el checkout:', error);
        return res.status(500).json({ mensaje: 'Error interno al procesar la reserva.' });
    }
};

// 2. OBTENER LAS RESERVAS CONFIRMADAS DEL USUARIO
export const obtenerMisReservas = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const reservas = await Reserva.findAll({
            where: { usuario_id },
            include: [{
                model: DetalleReserva,
                as: 'DetalleReservas',
                include: [{ model: Actividad, as: 'Actividad' }]
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.json(reservas);
    } catch (error) {
        console.error("Error al obtener mis reservas:", error);
        return res.status(500).json({ mensaje: 'Error al recuperar tus reservas.' });
    }
};

// 3. EDITAR DETALLES DE UNA RESERVA
export const editarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        const { fecha_reserva, turno, cantidad_adultos, cantidad_menores } = req.body;

        const reserva = await Reserva.findOne({ where: { id, usuario_id } });
        if (!reserva) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
        }

        await DetalleReserva.update(
            {
                fecha_reserva,
                turno,
                cantidad_adultos: Number(cantidad_adultos),
                cantidad_menores: Number(cantidad_menores)
            },
            { where: { reserva_id: id } }
        );

        return res.json({ mensaje: 'Reserva actualizada correctamente.' });
    } catch (error) {
        console.error("Error al editar reserva:", error);
        return res.status(500).json({ mensaje: 'Error al actualizar la reserva.' });
    }
};

// 4. CANCELAR / ELIMINAR RESERVA
export const cancelarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        const reserva = await Reserva.findOne({ where: { id, usuario_id } });
        if (!reserva) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
        }

        // Eliminación en cascada de detalles y reserva principal
        await DetalleReserva.destroy({ where: { reserva_id: id } });
        await Reserva.destroy({ where: { id } });

        return res.json({ mensaje: 'Reserva cancelada con éxito.' });
    } catch (error) {
        console.error("Error al cancelar reserva:", error);
        return res.status(500).json({ mensaje: 'Error al cancelar la reserva.' });
    }
};