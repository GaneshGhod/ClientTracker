const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  budgetMin: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  budgetMax: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  clientContact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  clientReference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'open', 'claimed', 'closed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  postedBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  claimedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  claimedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  source: {
    type: DataTypes.ENUM('admin', 'client'),
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = Lead;
