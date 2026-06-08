import { DataTypes } from "sequelize";
import type { Model, InferAttributes, InferCreationAttributes, CreationOptional, Attributes } from "sequelize";
import { sequelize } from '../providers/database/connection.js'

interface BidModel extends Model<InferAttributes<BidModel>, InferCreationAttributes<BidModel>> {
  id: CreationOptional<string>;
  adSpotId: string;
  userId: string;
  amount: number;
  isHighestBid?: boolean;
}

export const Bid = sequelize.define<BidModel>('Bid', {
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
