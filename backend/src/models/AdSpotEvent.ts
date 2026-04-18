import { DataTypes } from "sequelize";
import type { Model, InferAttributes, InferCreationAttributes, CreationOptional, Attributes } from "sequelize";
import { sequelize } from '../config/database.js'

interface AdSpotEventModel extends Model<InferAttributes<AdSpotEventModel>, InferCreationAttributes<AdSpotEventModel>> {
  id: CreationOptional<string>;
  adSpotId: string;
  eventName: string;
  eventDate: Date;
}

export const AdSpotEvent = sequelize.define<AdSpotEventModel>('AdSpotEvent', {
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
