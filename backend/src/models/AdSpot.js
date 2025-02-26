const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdSpot = sequelize.define('AdSpot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  currentPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'current_price' 
  },
  startingPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'starting_price' 
  },
  reservePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'reserve_price' 
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date' 
  },
  status: {
    type: DataTypes.ENUM('active', 'ended'),
    defaultValue: 'active'
  },
  totalBids: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_bids' 
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url' 
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dimensions: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'event_count' 
  },
  estimatedViews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'estimated_views' 
  },
  seasonDuration: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'season_duration' 
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id', 
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'ad_spots',
  timestamps: true,
  underscored: true, 
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['end_date'] 
    },
    {
      fields: ['owner_id'] 
    }
  ],
  hooks: {
    beforeCreate: async (adSpot) => {
      if (new Date(adSpot.endDate) < new Date()) {
        adSpot.status = 'ended';
      }
    },
    beforeUpdate: async (adSpot) => {
      if (new Date(adSpot.endDate) < new Date() && adSpot.status === 'active') {
        adSpot.status = 'ended';
      }
    }
  }
});

module.exports = AdSpot;