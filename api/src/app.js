import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors'; // <-- Agregar esta línea
import { sequelize } from './models/index.js';
import routes from './routes/index.js';
import { verificarConexionEmail } from './services/emailService.js'; // Ajustá la ruta si tu servicio está en otra carpeta

const app = express();

app.use(cors()); 
app.use(express.json());

// Verificación automática de credenciales Gmail al arrancar
verificarConexionEmail();

sequelize.sync()
    .then(() => console.log('Base de datos y tablas sincronizadas.'))
    .catch((error) => console.error('Error al sincronizar:', error));

app.use('/api', routes);

export default app;