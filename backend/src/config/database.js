require('dotenv').config();

const { Sequelize } = require('sequelize');
const { logger } = require('../utils/logger');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');

const connectionString = process.env.DATABASE_URL;

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true, 
    createdAt: 'created_at', 
    updatedAt: 'updated_at'  
  }
});


exports.connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync(); 
      console.log('Database models synchronized');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

exports.sequelize = sequelize;