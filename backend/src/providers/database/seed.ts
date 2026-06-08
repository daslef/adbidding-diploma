import { v4 as uuidv4 } from 'uuid'
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "./connection.js";
import { logger } from "../../utils/logger.js";

import {
  User,
  AdSpot,
  Bid,
  WatchedListing,
  Notification,
  Transaction
} from '../../models/index.js'


dotenv.config();

async function seedUsers() {
  logger.info('Наполнение базы данных: администратор...');

  const [admin,] = await User.findOrCreate({
    where: { email: 'admin@example.com' },
    defaults: {
      id: uuidv4(),
      email: 'admin@example.com',
      name: 'Admin User',
      password: await bcrypt.hash("admin123", 10),
      companyName: 'AdTech Platform',
      role: 'admin'
    }
  });

  logger.info('Наполнение базы данных: продавец...');

  const [bobSeller,] = await User.findOrCreate({
    where: { email: 'bob@example.com' },
    defaults: {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'bob@example.com',
      name: 'Bob Seller',
      password: await bcrypt.hash('user123', 10),
      companyName: 'Bobs Ads',
      role: 'admin'
    }
  });

  logger.info('Наполнение базы данных: пользователи...');

  const [aliceUser,] = await User.findOrCreate({
    where: { email: 'check@example.com' },
    defaults: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'bob@example.com',
      name: 'Charlie check',
      password: await bcrypt.hash('user123', 10),
      companyName: ' check',
      role: 'user'
    }
  });

  logger.info('Наполнение базы данных: покупатель...');

  const [charlieBidder,] = await User.findOrCreate({
    where: { email: 'charlie@example.com' },
    defaults: {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'bob@example.com',
      name: 'Charlie Bidder',
      password: await bcrypt.hash('user123', 10),
      companyName: 'Charlie & Sons',
      role: 'user'
    }
  });

  return {
    admin, aliceUser, charlieBidder, bobSeller
  }
}

async function seedSpots(ownerIds: readonly [string, string]) {
  logger.info('Наполнение базы данных: споты (аукционы)...');

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 2); // 2 months from now

  const [adSpot1, _] = await AdSpot.findOrCreate({
    where: {
      id: '00000000-0000-0000-0000-000000000101'
    },
    defaults: {
      id: '00000000-0000-0000-0000-000000000101',
      title: 'Billboard on Times Square',
      description: 'Prime location billboard near 42nd Street.',
      currentPrice: 10000.00,
      startingPrice: 5000.00,
      reservePrice: 8000.00,
      endDate: new Date('2025-03-01 12:00:00'),
      status: 'active',
      totalBids: 2,
      imageUrl: 'https://example.com/billboard1.jpg',
      location: 'New York City',
      dimensions: '20x60 ft',
      eventCount: 5,
      estimatedViews: 100000,
      seasonDuration: 'Q1 2025',
      ownerId: ownerIds[0]
    },
  });

  const [adSpot2,] = await AdSpot.findOrCreate({
    where: {
      id: '00000000-0000-0000-0000-000000000102'
    },
    defaults: {
      id: '00000000-0000-0000-0000-000000000102',
      title: 'Banner at Football Stadium',
      description: 'Huge banner displayed during major football matches.',
      currentPrice: 20000.00,
      startingPrice: 10000.00,
      reservePrice: 15000.00,
      endDate: new Date('2025-04-15 18:00:00'),
      status: 'active',
      totalBids: 2,
      imageUrl: 'https://example.com/banner1.jpg',
      location: 'Los Angeles',
      dimensions: '10x30 ft',
      eventCount: 3,
      estimatedViews: 50000,
      seasonDuration: 'Full Season 2025',
      ownerId: ownerIds[1]
    },
  });

  const [adSpot3,] = await AdSpot.findOrCreate({
    where: {
      id: '00000000-0000-0000-0000-000000000103'
    },
    defaults: {
      id: '00000000-0000-0000-0000-000000000103',
      title: 'Digital Ad in Mall',
      description: 'Interactive digital kiosk ad in a high-traffic mall.',
      currentPrice: 3000.00,
      startingPrice: 2000.00,
      reservePrice: 2500.00,
      endDate: new Date('2025-02-28 20:00:00'),
      status: 'active',
      totalBids: 1,
      imageUrl: 'https://example.com/digitalad1.jpg',
      location: 'Chicago',
      dimensions: '5x5 ft',
      eventCount: 2,
      estimatedViews: 20000,
      seasonDuration: 'Spring 2025',
      ownerId: ownerIds[1]
    },
  });

  return { adSpot1, adSpot2, adSpot3 }
}

async function seedWatchingListings(data: {
  id: string,
  userId: string,
  adSpotId: string,
}[]) {
  logger.info('Наполнение базы данных: листинги наблюдения...');

  const watchedListings = []

  for (const listing of data) {
    watchedListings.push(await WatchedListing.findOrCreate({
      where: { id: listing.id },
      defaults: listing
    }));
  }

  return watchedListings
}

async function seedNotifications(data: {
  id: string,
  userId: string,
  type: 'bid' | 'auction-end' | 'system',
  relatedAdSpotId: string | null
}[]) {
  logger.info('Наполнение базы данных: уведомления...');

  const enhancedData = data.map(item => ({
    ...item,
    message:
      item.type === 'bid' ? 'You placed a bid on Times Square billboard' : item.type === 'auction-end' ? 'Auction has ended' : 'System maintenance scheduled',
    read: false
  }))

  const notifications = []

  for (const item of enhancedData) {
    const [createdNotification,] = await Notification.findOrCreate({
      where: { id: item.id },
      defaults: item
    })

    notifications.push(createdNotification)
  }

  return notifications
}

async function seedBids(data: {
  id: string,
  adSpotId: string,
  userId: string,
  amount: number,
  isHighestBid: boolean
}[]) {
  const bids = []

  for (const item of data) {
    const [createdBid,] = await Bid.findOrCreate({
      where: { id: item.id },
      defaults: item
    });

    bids.push(createdBid)
  }

  return bids
}

async function seedTransactions(data: {
  id: string,
  bidId: string,
  userId: string,
  adSpotId: string,
  amount: number,
  paymentMethod: string,
  paymentId: string,
  invoiceNumber: string
}[]) {
  const transactions = []

  for (const item of data) {
    const [createdTransaction,] = await Transaction.findOrCreate({
      where: { id: item.id },
      defaults: { ...item, status: 'pending' }
    });

    transactions.push(createdTransaction)
  }

  return transactions
}

async function seedData() {
  const {
    admin, aliceUser, charlieBidder, bobSeller
  } = await seedUsers()

  const { adSpot1, adSpot2, adSpot3 } = await seedSpots([admin.id, bobSeller.id])

  const [watchedListing1, watchedListing2] = await seedWatchingListings([
    { id: '00000000-0000-0000-0000-000000003001', userId: aliceUser.id, adSpotId: adSpot1.id },
    { id: '00000000-0000-0000-0000-000000003002', userId: charlieBidder.id, adSpotId: adSpot2.id }
  ])

  await seedNotifications([
    {
      id: '00000000-0000-0000-0000-000000004001',
      userId: aliceUser.id,
      type: 'bid',
      relatedAdSpotId: adSpot1.id
    },
    {
      id: '00000000-0000-0000-0000-000000004002',
      userId: charlieBidder.id,
      type: 'auction-end',
      relatedAdSpotId: adSpot2.id
    },
    {
      id: '00000000-0000-0000-0000-000000004003',
      userId: bobSeller.id,
      type: 'system',
      relatedAdSpotId: null
    }
  ])

  const [
    aliceSpot1Bid, charlieSpot1Bid, aliceSpot2Bid, charlieSpot2Bid, charlieSpot3Bid
  ] = await seedBids([
    { id: '00000000-0000-0000-0000-000000005001', adSpotId: adSpot1.id, userId: aliceUser.id, amount: 6000.00, isHighestBid: false },
    { id: '00000000-0000-0000-0000-000000005002', adSpotId: adSpot1.id, userId: charlieBidder.id, amount: 9000.00, isHighestBid: true },
    { id: '00000000-0000-0000-0000-000000005003', adSpotId: adSpot2.id, userId: aliceUser.id, amount: 11000.00, isHighestBid: false },
    { id: '00000000-0000-0000-0000-000000005004', adSpotId: adSpot2.id, userId: charlieBidder.id, amount: 16000.00, isHighestBid: true },
    { id: '00000000-0000-0000-0000-000000005005', adSpotId: adSpot3.id, userId: charlieBidder.id, amount: 2800.00, isHighestBid: true }
  ])

  await seedTransactions([
    {
      id: '00000000-0000-0000-0000-000000006001',
      bidId: charlieSpot1Bid!.id,
      userId: charlieBidder.id,
      adSpotId: adSpot1.id,
      amount: 9000.00,
      paymentMethod: 'credit_card',
      paymentId: 'PAY12345',
      invoiceNumber: 'INV-1001'
    },
    {
      id: '00000000-0000-0000-0000-000000006002',
      bidId: charlieSpot2Bid!.id,
      userId: charlieBidder.id,
      adSpotId: adSpot2.id,
      amount: 16000.00,
      paymentMethod: 'paypal',
      paymentId: 'PAY67890',
      invoiceNumber: 'INV-1002'
    },
    {
      id: '00000000-0000-0000-0000-000000006003',
      bidId: charlieSpot3Bid!.id,
      userId: charlieBidder.id,
      adSpotId: adSpot3.id,
      amount: 2800.00,
      paymentMethod: 'bank_transfer',
      paymentId: 'PAY54321',
      invoiceNumber: 'INV-1003'
    }
  ])

  await AdSpot.update({ totalBids: 2 }, { where: { id: adSpot1.id } });
  await AdSpot.update({ totalBids: 2 }, { where: { id: adSpot2.id } });
  await AdSpot.update({ totalBids: 1 }, { where: { id: adSpot3.id } });
}


async function seedDatabase() {
  try {
    await connectToDatabase()
    await seedData();
    console.log("База данных наполнена");
  } catch (error) {
    console.error("Ошибка при наполнении базы данных", error);
    process.exit(1);
  }
}

await seedDatabase();
