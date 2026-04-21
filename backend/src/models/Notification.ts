import { DataTypes } from "sequelize";
import type { Model, InferAttributes, InferCreationAttributes, CreationOptional, Attributes } from "sequelize";
import { sequelize } from '../config/database.js'

interface NotificationModel extends Model<InferAttributes<NotificationModel>, InferCreationAttributes<NotificationModel>> {
  id: CreationOptional<string>;
  userId: string;
  message: string;
  type: 'bid' | 'auction-end' | 'outbid' | 'system'
  read: boolean;
  relatedAdSpotId: string;
}

export const Notification = sequelize.define<NotificationModel>('Notification', {
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
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('bid', 'auction-end', 'outbid', 'system'),
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  relatedAdSpotId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'related_ad_spot_id',
    references: {
      model: 'ad_spots',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['read']
    },
    {
      fields: ['type']
    },
    {
      fields: ['related_ad_spot_id']
    }
  ]
});
