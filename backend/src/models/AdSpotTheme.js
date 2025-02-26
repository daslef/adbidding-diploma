const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdSpotTheme = sequelize.define('AdSpotTheme', {
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

module.exports = AdSpotTheme;