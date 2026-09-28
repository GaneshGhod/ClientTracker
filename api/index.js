const app = require('../backend/src/app');
const { sequelize } = require('../backend/src/models');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      isConnected = true;
    } catch (err) {
      console.error('Serverless DB connection error:', err);
    }
  }
  return app(req, res);
};
