const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdSpotEvent = sequelize.define('AdSpotEvent', {
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
  eventName: {
    type: DataTypes.STRING,
    field: 'event_name',
    allowNull: false
  },
  eventDate: {
    type: DataTypes.DATE,
    field: 'event_date' 
  }
}, {
  tableName: 'ad_spot_events',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ad_spot_id'] 
    }
  ]
});

module.exports = AdSpotEvent;