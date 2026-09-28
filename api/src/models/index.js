import { sequelize } from '../config/database.js';
import { Usuario } from './Usuario.js';
import { Categoria } from './Categoria.js';
import { Actividad } from './Actividad.js';
import { Carrito } from './Carrito.js';
import { ItemCarrito } from './ItemCarrito.js';
import { Reserva } from './Reserva.js';
import { DetalleReserva } from './DetalleReserva.js';


Categoria.hasMany(Actividad, { foreignKey: 'categoria_id' });
Actividad.belongsTo(Categoria, { foreignKey: 'categoria_id' });


Usuario.hasOne(Carrito, { foreignKey: 'usuario_id' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuario_id' });


Carrito.hasMany(ItemCarrito, { foreignKey: 'carrito_id' });
ItemCarrito.belongsTo(Carrito, { foreignKey: 'carrito_id' });
Actividad.hasMany(ItemCarrito, { foreignKey: 'actividad_id' });
ItemCarrito.belongsTo(Actividad, { foreignKey: 'actividad_id' });


Usuario.hasMany(Reserva, { foreignKey: 'usuario_id' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });


Reserva.hasMany(DetalleReserva, { foreignKey: 'reserva_id' });
DetalleReserva.belongsTo(Reserva, { foreignKey: 'reserva_id' });
Actividad.hasMany(DetalleReserva, { foreignKey: 'actividad_id' });
DetalleReserva.belongsTo(Actividad, { foreignKey: 'actividad_id' });

export { 
  sequelize, 
  Usuario, 
  Categoria, 
  Actividad, 
  Carrito, 
  ItemCarrito, 
  Reserva, 
  DetalleReserva 
};