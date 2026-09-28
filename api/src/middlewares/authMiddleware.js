import jwt from 'jsonwebtoken';


export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado, token no proporcionado' });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.usuario = verificado; 
        next();
    } catch (error) {
        res.status(403).json({ mensaje: 'Token inválido o expirado' });
    }
};


export const esAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso restringido: requiere permisos de Administrador' });
    }
};


export const esAdminUOperador = (req, res, next) => {
    if (req.usuario && (req.usuario.rol === 'admin' || req.usuario.rol === 'operador')) {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso restringido: requiere permisos de Administrador u Operador' });
    }
};