import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';


export const registrarUsuario = async (req, res) => {
    try {
        const { nombre_usuario, email, password, nombre, apellido, telefono, rol } = req.body;

        
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }

        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        
        const nuevoUsuario = await Usuario.create({
            nombre_usuario,
            email,
            password: passwordHash,
            nombre,
            apellido,
            telefono,
            rol: rol || 'cliente' 
        });

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario.id,
                nombre_usuario: nuevoUsuario.nombre_usuario,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

       
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '8h' }
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre_usuario: usuario.nombre_usuario,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: ['id', 'nombre_usuario', 'nombre', 'apellido', 'email', 'telefono', 'rol', 'createdAt']
        });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const cambiarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        
        if (usuario.rol === 'admin' && rol === 'cliente') {
            const adminsCount = await Usuario.count({ where: { rol: 'admin' } });
            if (adminsCount <= 1) {
                return res.status(400).json({ 
                    error: 'Acción bloqueada: Debe existir al menos un administrador en el sistema.' 
                });
            }
        }

        await usuario.update({ rol });

        res.json({
            mensaje: 'Rol actualizado exitosamente',
            usuario: {
                id: usuario.id,
                nombre_usuario: usuario.nombre_usuario,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        
        if (usuario.rol === 'admin') {
            const adminsCount = await Usuario.count({ where: { rol: 'admin' } });
            if (adminsCount <= 1) {
                return res.status(400).json({ 
                    error: 'Acción bloqueada: No se puede eliminar al único administrador del sistema.' 
                });
            }
        }

        await usuario.destroy();
        res.json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};