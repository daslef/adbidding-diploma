const bcrypt = require('bcryptjs');
const { 
  User, 
  AdSpot, 
  AdSpotEvent, 
  AdSpotTheme, 
  Bid,
  WatchedListing,
  Notification,
  Transaction
} = require('../models');
const { logger } = require('./logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Seed initial data for development
 */
async function seedData() {
  try {
    logger.info('Starting database seed...');

    // Create or update admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const [admin, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        id: uuidv4(),
        name: 'Admin User',
        password: adminPassword,
        companyName: 'AdTech Platform',
        role: 'admin'
      }
    });

    logger.info(adminCreated ? 'Admin user created' : 'Admin user already exists');

    // Create or update Bob (seller)
    const [bob, bobCreated] = await User.findOrCreate({
      where: { email: 'bob@example.com' },
      defaults: {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Bob Seller',
        password: await bcrypt.hash('user123', 10),
        companyName: 'Bobs Ads',
        role: 'admin'
      }
    });

    logger.info(bobCreated ? 'Bob Seller created' : 'Bob Seller already exists');

    // Create or update Alice (user)
    const [alice, aliceCreated] = await User.findOrCreate({
      where: { email: 'check@example.com' },
      defaults: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Charlie check',
        password: await bcrypt.hash('user123', 10),
        companyName: ' check',
        role: 'user'
      }
    });

    logger.info(aliceCreated ? 'Charlie check created' : 'Charlie check already exists');

    // Create or update Charlie (bidder)
    const [charlie, charlieCreated] = await User.findOrCreate({
      where: { email: 'charlie@example.com' },
      defaults: {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Charlie Bidder',
        password: await bcrypt.hash('user123', 10),
        companyName: 'Charlie & Sons',
        role: 'user'
      }
    });

    logger.info(charlieCreated ? 'Charlie Bidder created' : 'Charlie Bidder already exists');

    // === Optional: Create additional users from original seed if needed ===
    const [john, johnCreated] = await User.findOrCreate({
      where: { email: 'john@example.com' },
      defaults: {
        name: 'John Doe',
        password: await bcrypt.hash('user123', 10),
        companyName: 'Bay Area Tech Solutions',
        role: 'user'
      }
    });

    const [jane, janeCreated] = await User.findOrCreate({
      where: { email: 'jane@example.com' },
      defaults: {
        name: 'Jane Smith',
        password: await bcrypt.hash('user123', 10),
        companyName: 'NorCal Beverages',
        role: 'user'
      }
    });

    const [alex, alexCreated] = await User.findOrCreate({
      where: { email: 'alex@example.com' },
      defaults: {
        name: 'Alex Johnson',
        password: await bcrypt.hash('user123', 10),
        companyName: 'Silicon Valley Motors',
        role: 'user'
      }
    });

    logger.info('Regular users processed');

    // Create ad spots with upsert
    const adSpot1 = await AdSpot.findOne({ where: { id: '00000000-0000-0000-0000-000000000101' } });
    if (!adSpot1) {
      await AdSpot.create({
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
        ownerId: bob.id
      });
      logger.info('Times Square billboard created');
    } else {
      logger.info('Times Square billboard already exists');
    }

    const adSpot2 = await AdSpot.findOne({ where: { id: '00000000-0000-0000-0000-000000000102' } });
    if (!adSpot2) {
      await AdSpot.create({
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
        ownerId: bob.id
      });
      logger.info('Stadium banner created');
    } else {
      logger.info('Stadium banner already exists');
    }

    const adSpot3 = await AdSpot.findOne({ where: { id: '00000000-0000-0000-0000-000000000103' } });
    if (!adSpot3) {
      await AdSpot.create({
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
        ownerId: bob.id
      });
      logger.info('Mall ad created');
    } else {
      logger.info('Mall ad already exists');
    }

    // Create ad spot events with upsert
    const adSpotEvents = [
      { id: '00000000-0000-0000-0000-000000001001', adSpotId: '00000000-0000-0000-0000-000000000101', eventName: 'New Year Countdown', eventDate: new Date('2025-12-31 23:59:59') },
      { id: '00000000-0000-0000-0000-000000001002', adSpotId: '00000000-0000-0000-0000-000000000101', eventName: 'Summer Tourist Season', eventDate: new Date('2025-06-15 09:00:00') },
      { id: '00000000-0000-0000-0000-000000001003', adSpotId: '00000000-0000-0000-0000-000000000102', eventName: 'Championship Game', eventDate: new Date('2025-07-04 17:00:00') },
      { id: '00000000-0000-0000-0000-000000001004', adSpotId: '00000000-0000-0000-0000-000000000102', eventName: 'Concert Night', eventDate: new Date('2025-08-10 19:30:00') },
      { id: '00000000-0000-0000-0000-000000001005', adSpotId: '00000000-0000-0000-0000-000000000103', eventName: 'Spring Sale Kickoff', eventDate: new Date('2025-03-20 10:00:00') }
    ];

    for (const event of adSpotEvents) {
      await AdSpotEvent.findOrCreate({
        where: { id: event.id },
        defaults: event
      });
    }
    logger.info('Ad spot events processed');

    // Create ad spot themes with upsert
    const adSpotThemes = [
      {
        id: '00000000-0000-0000-0000-000000002001',
        adSpotId: '00000000-0000-0000-0000-000000000101',
        themeName: 'Times Square Theme',
        primaryColor: '#FF0000',
        secondaryColor: '#00FF00',
        accentColor: '#0000FF',
        textPrimaryColor: '#FFFFFF',
        textSecondaryColor: '#000000'
      },
      {
        id: '00000000-0000-0000-0000-000000002002',
        adSpotId: '00000000-0000-0000-0000-000000000102',
        themeName: 'Stadium Banner Theme',
        primaryColor: '#FFFF00',
        secondaryColor: '#FF00FF',
        accentColor: '#00FFFF',
        textPrimaryColor: '#333333',
        textSecondaryColor: '#666666'
      },
      {
        id: '00000000-0000-0000-0000-000000002003',
        adSpotId: '00000000-0000-0000-0000-000000000103',
        themeName: 'Mall Kiosk Theme',
        primaryColor: '#F0F0F0',
        secondaryColor: '#C0C0C0',
        accentColor: '#A0A0A0',
        textPrimaryColor: '#202020',
        textSecondaryColor: '#404040'
      }
    ];

    for (const theme of adSpotThemes) {
      await AdSpotTheme.findOrCreate({
        where: { id: theme.id },
        defaults: theme
      });
    }
    logger.info('Ad spot themes processed');

    // Create watched listings with upsert
    const watchedListings = [
      { id: '00000000-0000-0000-0000-000000003001', userId: '00000000-0000-0000-0000-000000000001', adSpotId: '00000000-0000-0000-0000-000000000101' },
      { id: '00000000-0000-0000-0000-000000003002', userId: '00000000-0000-0000-0000-000000000003', adSpotId: '00000000-0000-0000-0000-000000000102' }
    ];

    for (const watchedListing of watchedListings) {
      await WatchedListing.findOrCreate({
        where: { id: watchedListing.id },
        defaults: watchedListing
      });
    }
    logger.info('Watched listings processed');

    // Create notifications with upsert
    const notifications = [
      {
        id: '00000000-0000-0000-0000-000000004001',
        userId: '00000000-0000-0000-0000-000000000001',
        message: 'You placed a bid on Times Square billboard',
        type: 'bid',
        read: false,
        relatedAdSpotId: '00000000-0000-0000-0000-000000000101'
      },
      {
        id: '00000000-0000-0000-0000-000000004002',
        userId: '00000000-0000-0000-0000-000000000003',
        message: 'The Banner at Football Stadium auction has ended',
        type: 'auction-end',
        read: false,
        relatedAdSpotId: '00000000-0000-0000-0000-000000000102'
      },
      {
        id: '00000000-0000-0000-0000-000000004003',
        userId: '00000000-0000-0000-0000-000000000002',
        message: 'System maintenance scheduled',
        type: 'system',
        read: false,
        relatedAdSpotId: null
      }
    ];

    // Add notifications if your model supports them
    if (typeof Notification !== 'undefined') {
      for (const notification of notifications) {
        await Notification.findOrCreate({
          where: { id: notification.id },
          defaults: notification
        });
      }
      logger.info('Notifications processed');
    }

    // Create bids with upsert
    const bids = [
      { id: '00000000-0000-0000-0000-000000005001', adSpotId: '00000000-0000-0000-0000-000000000101', userId: '00000000-0000-0000-0000-000000000001', amount: 6000.00, isHighestBid: false },
      { id: '00000000-0000-0000-0000-000000005002', adSpotId: '00000000-0000-0000-0000-000000000101', userId: '00000000-0000-0000-0000-000000000003', amount: 9000.00, isHighestBid: true },
      { id: '00000000-0000-0000-0000-000000005003', adSpotId: '00000000-0000-0000-0000-000000000102', userId: '00000000-0000-0000-0000-000000000001', amount: 11000.00, isHighestBid: false },
      { id: '00000000-0000-0000-0000-000000005004', adSpotId: '00000000-0000-0000-0000-000000000102', userId: '00000000-0000-0000-0000-000000000003', amount: 16000.00, isHighestBid: true },
      { id: '00000000-0000-0000-0000-000000005005', adSpotId: '00000000-0000-0000-0000-000000000103', userId: '00000000-0000-0000-0000-000000000003', amount: 2800.00, isHighestBid: true }
    ];

    for (const bid of bids) {
      await Bid.findOrCreate({
        where: { id: bid.id },
        defaults: bid
      });
    }
    logger.info('Bids processed');

    // Create transactions with upsert
    const transactions = [
      {
        id: '00000000-0000-0000-0000-000000006001',
        bidId: '00000000-0000-0000-0000-000000005002',
        userId: '00000000-0000-0000-0000-000000000003',
        adSpotId: '00000000-0000-0000-0000-000000000101',
        amount: 9000.00,
        status: 'pending',
        paymentMethod: 'credit_card',
        paymentId: 'PAY12345',
        invoiceNumber: 'INV-1001'
      },
      {
        id: '00000000-0000-0000-0000-000000006002',
        bidId: '00000000-0000-0000-0000-000000005004',
        userId: '00000000-0000-0000-0000-000000000003',
        adSpotId: '00000000-0000-0000-0000-000000000102',
        amount: 16000.00,
        status: 'pending',
        paymentMethod: 'paypal',
        paymentId: 'PAY67890',
        invoiceNumber: 'INV-1002'
      },
      {
        id: '00000000-0000-0000-0000-000000006003',
        bidId: '00000000-0000-0000-0000-000000005005',
        userId: '00000000-0000-0000-0000-000000000003',
        adSpotId: '00000000-0000-0000-0000-000000000103',
        amount: 2800.00,
        status: 'pending',
        paymentMethod: 'bank_transfer',
        paymentId: 'PAY54321',
        invoiceNumber: 'INV-1003'
      }
    ];

    // Add transactions if your model supports them
    if (typeof Transaction !== 'undefined') {
      for (const transaction of transactions) {
        await Transaction.findOrCreate({
          where: { id: transaction.id },
          defaults: transaction
        });
      }
      logger.info('Transactions processed');
    }

    // Ensure the ad spot bid counts are updated correctly
    await AdSpot.update({ totalBids: 2 }, { where: { id: '00000000-0000-0000-0000-000000000101' } });
    await AdSpot.update({ totalBids: 2 }, { where: { id: '00000000-0000-0000-0000-000000000102' } });
    await AdSpot.update({ totalBids: 1 }, { where: { id: '00000000-0000-0000-0000-000000000103' } });

    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

module.exports = { seedData };