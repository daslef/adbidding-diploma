import { sequelize } from '../providers/database/connection.js';

import { User } from './User.js';
import { AdSpot } from './AdSpot.js';
import { Bid } from './Bid.js';
import { WatchedListing } from './WatchedListing.js';
import { Notification } from './Notification.js';
import { Transaction } from './Transaction.js';

User.hasMany(AdSpot, { foreignKey: 'owner_id', as: 'ownedAdSpots' });
AdSpot.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

AdSpot.hasMany(Bid, { foreignKey: 'ad_spot_id', as: 'bids' });
Bid.belongsTo(AdSpot, { foreignKey: 'ad_spot_id' });

User.hasMany(Bid, { foreignKey: 'user_id', as: 'bids' });
Bid.belongsTo(User, { foreignKey: 'user_id' });

User.belongsToMany(AdSpot, { through: WatchedListing, foreignKey: 'user_id', as: 'watchedAdSpots' });
AdSpot.belongsToMany(User, { through: WatchedListing, foreignKey: 'ad_spot_id', as: 'watchers' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

AdSpot.hasMany(Notification, { foreignKey: 'related_ad_spot_id', as: 'notifications' });
Notification.belongsTo(AdSpot, { foreignKey: 'related_ad_spot_id', as: 'adSpot' });

User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

AdSpot.hasMany(Transaction, { foreignKey: 'ad_spot_id', as: 'transactions' });
Transaction.belongsTo(AdSpot, { foreignKey: 'ad_spot_id' });

Bid.hasOne(Transaction, { foreignKey: 'bid_id' });
Transaction.belongsTo(Bid, { foreignKey: 'bid_id' });

export {
  sequelize,
  User,
  AdSpot,
  Bid,
  WatchedListing,
  Notification,
  Transaction
};