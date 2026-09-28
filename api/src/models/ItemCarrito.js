import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ItemCarrito = sequelize.define('ItemCarrito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  carrito_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  actividad_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  fecha_reserva: {
    type: DataTypes.DATEONLY, 
    allowNull: true
  },
  turno: {
    type: DataTypes.STRING, 
    allowNull: true
  }
}, { tableName: 'items_carrito' });