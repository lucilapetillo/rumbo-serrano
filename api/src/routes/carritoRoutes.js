import { Router } from 'express';
import { verificarToken } from '../middlewares/authMiddleware.js';
import {
  obtenerCarrito,
  agregarItem,
  eliminarItem
} from '../controllers/carritoController.js';

const router = Router();

// GET: Obtener carrito del usuario
router.get('/', verificarToken, obtenerCarrito);

// POST: Agregar ítem al carrito
router.post('/items', verificarToken, agregarItem);

// DELETE: Eliminar ítem del carrito
router.delete('/items/:id', verificarToken, eliminarItem);

export default router;