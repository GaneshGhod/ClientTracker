const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  plan: {
    type: DataTypes.ENUM('basic', 'pro'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    allowNull: false,
    defaultValue: 'active',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  razorpaySubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  claimsUsedThisMonth: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  claimsLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 10, // 10 for basic, -1 for pro
  }
}, {
  timestamps: true,
});

module.exports = Subscription;
