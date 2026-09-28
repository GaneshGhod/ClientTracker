const path = require('path');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
const isSqlite = process.env.DB_DIALECT === 'sqlite' || dbUrl.startsWith('sqlite') || !dbUrl;

let sequelize;

if (isSqlite) {
  const defaultStorage = process.env.VERCEL ? '/tmp/leadmarket.sqlite' : path.join(__dirname, '../../leadmarket.sqlite');
  const storagePath = process.env.SQLITE_PATH || defaultStorage;
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
} else {
  const isCloudPg = dbUrl.includes('neon.tech') || dbUrl.includes('supabase') || process.env.DB_SSL === 'true';
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: isCloudPg
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  });
}

module.exports = sequelize;
