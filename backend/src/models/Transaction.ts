import { DataTypes } from "sequelize";
import type { Model, InferAttributes, InferCreationAttributes, CreationOptional, Attributes } from "sequelize";
import { sequelize } from '../config/database.js'

interface TransactionModel extends Model<InferAttributes<TransactionModel>, InferCreationAttributes<TransactionModel>> {
  id: CreationOptional<string>;
  bidId: string;
  userId: string;
  adSpotId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentId: string;
  invoiceNumber: string;
}

export const Transaction = sequelize.define<TransactionModel>('Transaction', {
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
