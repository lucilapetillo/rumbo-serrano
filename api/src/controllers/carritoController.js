import { Carrito, ItemCarrito, Actividad } from '../models/index.js';


export const obtenerCarrito = async (req, res) => {
    try {
        const [carrito] = await Carrito.findOrCreate({
            where: { usuario_id: req.usuario.id },
            include: [{
                model: ItemCarrito,
                include: [Actividad]
            }]
        });
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const agregarItem = async (req, res) => {
    try {
        const { 
            actividad_id, 
            cantidad, 
            cantidad_adultos, 
            cantidad_menores, 
            fecha_reserva, 
            turno 
        } = req.body;

        const [carrito] = await Carrito.findOrCreate({
            where: { usuario_id: req.usuario.id }
        });

        
        let item = await ItemCarrito.findOne({
            where: { 
                carrito_id: carrito.id, 
                actividad_id,
                fecha_reserva: fecha_reserva || null,
                turno: turno || null
            }
        });

        const numAdultos = Number(cantidad_adultos) || Number(cantidad) || 1;
        const numMenores = Number(cantidad_menores) || 0;
        const totalCantidad = Number(cantidad) || (numAdultos + numMenores);

        if (item) {
            
            item.cantidad += totalCantidad;
            item.cantidad_adultos = (item.cantidad_adultos || 0) + numAdultos;
            item.cantidad_menores = (item.cantidad_menores || 0) + numMenores;
            await item.save();
        } else {
            // Si es nuevo, lo creamos con todos los detalles
            item = await ItemCarrito.create({
                carrito_id: carrito.id,
                actividad_id,
                cantidad: totalCantidad,
                cantidad_adultos: numAdultos,
                cantidad_menores: numMenores,
                fecha_reserva,
                turno
            });
        }

        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const eliminarItem = async (req, res) => {
    try {
        const eliminados = await ItemCarrito.destroy({
            where: { id: req.params.id }
        });

        if (!eliminados) {
            return res.status(404).json({ mensaje: 'Ítem no encontrado' });
        }

        res.json({ mensaje: 'Ítem eliminado del carrito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};