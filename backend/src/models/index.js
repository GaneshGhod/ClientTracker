const sequelize = require('../config/database');

const User = require('./User');
const Category = require('./Category');
const Lead = require('./Lead');
const Subscription = require('./Subscription');
const Client = require('./Client');

// Associations
// User <-> Lead (postedBy)
User.hasMany(Lead, { as: 'postedLeads', foreignKey: 'postedBy' });
Lead.belongsTo(User, { as: 'author', foreignKey: 'postedBy' });

// User <-> Lead (claimedBy)
User.hasMany(Lead, { as: 'claimedLeads', foreignKey: 'claimedBy' });
Lead.belongsTo(User, { as: 'claimer', foreignKey: 'claimedBy' });

// User <-> Subscription
User.hasMany(Subscription, { foreignKey: 'userId' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

// Category <-> Lead
Category.hasMany(Lead, { foreignKey: 'categoryId' });
Lead.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = {
  sequelize,
  User,
  Category,
  Lead,
  Subscription,
  Client,
};
