const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bidId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'bid_id',
    references: {
      model: 'bids',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  adSpotId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'ad_spot_id',
    references: {
      model: 'ad_spots',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_method'
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_id'
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'invoice_number'
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['bid_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['ad_spot_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['invoice_number'],
      unique: true
    }
  ]
});

module.exports = Transaction;