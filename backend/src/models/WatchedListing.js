const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WatchedListing = sequelize.define('WatchedListing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  }
}, {
  tableName: 'watched_listings',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['ad_spot_id']
    },
    {
      fields: ['user_id', 'ad_spot_id'],
      unique: true
    }
  ]
});

module.exports = WatchedListing;