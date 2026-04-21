import { DataTypes } from "sequelize";
import type { Model, InferAttributes, InferCreationAttributes, CreationOptional, Attributes } from "sequelize";
import { sequelize } from '../config/database.js'

interface AdSpotThemeModel extends Model<InferAttributes<AdSpotThemeModel>, InferCreationAttributes<AdSpotThemeModel>> {
  id: CreationOptional<string>;
  adSpotId: string;
  themeName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
}

export const AdSpotTheme = sequelize.define<AdSpotThemeModel>('AdSpotTheme', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adSpotId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'ad_spot_id',
    references: {
      model: 'ad_spots',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  themeName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'theme_name'
  },
  primaryColor: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'primary_color'
  },
  secondaryColor: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'secondary_color'
  },
  accentColor: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'accent_color'
  },
  textPrimaryColor: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'text_primary_color'
  },
  textSecondaryColor: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'text_secondary_color'
  }
}, {
  tableName: 'ad_spot_themes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ad_spot_id'],
      unique: true
    }
  ]
});
