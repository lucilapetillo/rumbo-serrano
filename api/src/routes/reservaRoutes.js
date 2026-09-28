import { Router } from 'express';
import { 
    checkout, 
    obtenerMisReservas, 
    editarReserva, 
    cancelarReserva 
} from '../controllers/reservasController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Endpoint POST: Checkout (Transfiere ítems del Carrito a Reserva)
router.post('/checkout', verificarToken, checkout);

// Endpoint GET: Obtiene las reservas confirmadas del usuario autenticado
router.get('/mis-reservas', verificarToken, obtenerMisReservas);

// Endpoint PUT: Permite modificar fecha, turno o pasajeros de una reserva
router.put('/:id', verificarToken, editarReserva);

// Endpoint DELETE: Cancela/elimina una reserva
router.delete('/:id', verificarToken, cancelarReserva);

export default router;