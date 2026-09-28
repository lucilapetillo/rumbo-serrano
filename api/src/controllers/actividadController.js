    import { Actividad } from '../models/Actividad.js';

    
    export const obtenerActividades = async (req, res) => {
    try {
        const actividades = await Actividad.findAll();
        res.json(actividades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    };

    
    export const crearActividad = async (req, res) => {
    try {
        const { 
        titulo, 
        descripcion, 
        precio, 
        duracion, 
        ubicacion, 
        imagen, 
        categoria_id, 
        fecha_inicio,
        fecha_fin,
        cupo_maximo, 
        cupo_disponible 
        } = req.body;

        const max = cupo_maximo ? parseInt(cupo_maximo) : 10;
        const disp = cupo_disponible !== undefined && cupo_disponible !== '' ? parseInt(cupo_disponible) : max;

        const nuevaActividad = await Actividad.create({
        titulo,
        descripcion,
        precio,
        duracion,
        ubicacion,
        imagen,
        categoria_id: categoria_id || 1,
        fecha_inicio: fecha_inicio || null,
        fecha_fin: fecha_fin || null,
        cupo_maximo: max,
        cupo_disponible: disp
        });

        res.status(201).json(nuevaActividad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    };

   
    export const actualizarActividad = async (req, res) => {
    try {
        const { id } = req.params;
        const actividad = await Actividad.findByPk(id);

        if (!actividad) {
        return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        const { 
        titulo, 
        descripcion, 
        precio, 
        duracion, 
        ubicacion, 
        imagen, 
        categoria_id, 
        fecha_inicio,
        fecha_fin,
        cupo_maximo, 
        cupo_disponible 
        } = req.body;

        const max = cupo_maximo ? parseInt(cupo_maximo) : actividad.cupo_maximo;
        const disp = cupo_disponible !== undefined && cupo_disponible !== '' ? parseInt(cupo_disponible) : actividad.cupo_disponible;

        await actividad.update({
        titulo: titulo ?? actividad.titulo,
        descripcion: descripcion ?? actividad.descripcion,
        precio: precio ?? actividad.precio,
        duracion: duracion ?? actividad.duracion,
        ubicacion: ubicacion ?? actividad.ubicacion,
        imagen: imagen ?? actividad.imagen,
        categoria_id: categoria_id ?? actividad.categoria_id,
        fecha_inicio: fecha_inicio !== undefined ? (fecha_inicio || null) : actividad.fecha_inicio,
        fecha_fin: fecha_fin !== undefined ? (fecha_fin || null) : actividad.fecha_fin,
        cupo_maximo: max,
        cupo_disponible: disp
        });

        res.json({ mensaje: 'Actividad actualizada con éxito', actividad });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    };

    
    export const eliminarActividad = async (req, res) => {
    try {
        const { id } = req.params;
        const actividad = await Actividad.findByPk(id);

        if (!actividad) {
        return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        await actividad.destroy();
        res.json({ mensaje: 'Actividad eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    };