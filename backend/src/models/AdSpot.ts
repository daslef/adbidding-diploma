import { DataTypes } from "sequelize";
import type { Model, InferAttributes, InferCreationAttributes, CreationOptional, Attributes } from "sequelize";
import { sequelize } from '../providers/database/connection.js'


interface AdSpotModel extends Model<InferAttributes<AdSpotModel>, InferCreationAttributes<AdSpotModel>> {
  id: CreationOptional<string>;
  title: string;
  description: string;
  currentPrice: number;
  startingPrice: number;
  reservePrice: number;
  endDate: Date;
  status: 'active' | 'ended';
  totalBids: number;
  imageUrl: string;
  location: string;
  dimensions: string;
  eventCount: number;
  estimatedViews: number;
  seasonDuration: string;
  ownerId: string;
}


export const AdSpot = sequelize.define<AdSpotModel>('AdSpot', {
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
  ]
});

AdSpot.addHook('beforeCreate', async (adSpot: any) => {
  if (new Date(adSpot.endDate) < new Date()) {
    adSpot.status = 'ended';
  }
})

AdSpot.addHook('beforeUpdate', async (adSpot: any) => {
  if (new Date(adSpot.endDate) < new Date() && adSpot.status === 'active') {
    adSpot.status = 'ended';
  }
})