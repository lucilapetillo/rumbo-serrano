import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Actividad = sequelize.define('Actividad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: DataTypes.TEXT,
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  duracion: DataTypes.STRING,
  ubicacion: DataTypes.STRING,
  imagen: {                    
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
 
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cupo_maximo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  cupo_disponible: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  }
}, { tableName: 'actividades' });