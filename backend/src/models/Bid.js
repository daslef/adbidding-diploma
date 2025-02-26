const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bid = sequelize.define('Bid', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adSpotId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'ad_spot_id',
    references: {
      model: 'ad_spots',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  isHighestBid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_highest_bid'
  }
}, {
  tableName: 'bids',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ad_spot_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['is_highest_bid']
    },
    {
      fields: ['ad_spot_id', 'is_highest_bid']
    }
  ]
});

module.exports = Bid;