BEGIN;

-- 1) USERS
-- Note: Storing "hashed_password" as a placeholder; replace with a real hash in production
INSERT INTO users (id, name, email, password, company_name, role, last_login, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Charlie check','check@example.com','hashed_password', ' check',  'user',  '2025-02-03 11:00:00', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Bob Seller',    'bob@example.com',     'hashed_password', 'Bobs Ads',        'admin', '2025-02-02 10:00:00', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Charlie Bidder','charlie@example.com','hashed_password', 'Charlie & Sons',  'user',  '2025-02-03 11:00:00', NOW(), NOW());

-- 2) AD_SPOTS
-- All these spots belong to Bob (owner_id = user #2).
INSERT INTO ad_spots (
  id, 
  title, 
  description, 
  current_price, 
  starting_price, 
  reserve_price, 
  end_date, 
  status, 
  total_bids, 
  image_url, 
  location, 
  dimensions, 
  event_count, 
  estimated_views, 
  season_duration, 
  owner_id,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'Billboard on Times Square',
    'Prime location billboard near 42nd Street.',
    10000.00,
    5000.00,
    8000.00,
    '2025-03-01 12:00:00',
    'active',
    0,
    'https://example.com/billboard1.jpg',
    'New York City',
    '20x60 ft',
    5,
    100000,
    'Q1 2025',
    '00000000-0000-0000-0000-000000000002',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'Banner at Football Stadium',
    'Huge banner displayed during major football matches.',
    20000.00,
    10000.00,
    15000.00,
    '2025-04-15 18:00:00',
    'active',
    0,
    'https://example.com/banner1.jpg',
    'Los Angeles',
    '10x30 ft',
    3,
    50000,
    'Full Season 2025',
    '00000000-0000-0000-0000-000000000002',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'Digital Ad in Mall',
    'Interactive digital kiosk ad in a high-traffic mall.',
    3000.00,
    2000.00,
    2500.00,
    '2025-02-28 20:00:00',
    'active',
    0,
    'https://example.com/digitalad1.jpg',
    'Chicago',
    '5x5 ft',
    2,
    20000,
    'Spring 2025',
    '00000000-0000-0000-0000-000000000002',
    NOW(),
    NOW()
  );

-- 3) AD_SPOT_EVENTS
INSERT INTO ad_spot_events (id, ad_spot_id, event_name, event_date, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000101', 'New Year Countdown',   '2025-12-31 23:59:59', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000101', 'Summer Tourist Season','2025-06-15 09:00:00', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000102', 'Championship Game',     '2025-07-04 17:00:00', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000102', 'Concert Night',         '2025-08-10 19:30:00', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000103', 'Spring Sale Kickoff',   '2025-03-20 10:00:00', NOW(), NOW());

-- 4) AD_SPOT_THEMES
INSERT INTO ad_spot_themes (
  id, 
  ad_spot_id, 
  theme_name, 
  primary_color, 
  secondary_color, 
  accent_color, 
  text_primary_color, 
  text_secondary_color,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000000101',
    'Times Square Theme',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFFFF',
    '#000000',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000002002',
    '00000000-0000-0000-0000-000000000102',
    'Stadium Banner Theme',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#333333',
    '#666666',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000002003',
    '00000000-0000-0000-0000-000000000103',
    'Mall Kiosk Theme',
    '#F0F0F0',
    '#C0C0C0',
    '#A0A0A0',
    '#202020',
    '#404040',
    NOW(),
    NOW()
  );

-- 5) WATCHED_LISTINGS
INSERT INTO watched_listings (id, user_id, ad_spot_id, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', NOW(), NOW()), -- Alice watches Times Square
  ('00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000102', NOW(), NOW()); -- Charlie watches Stadium

-- 6) NOTIFICATIONS
INSERT INTO notifications (
  id, 
  user_id, 
  message, 
  type, 
  read, 
  related_ad_spot_id,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000004001',
    '00000000-0000-0000-0000-000000000001',
    'You placed a bid on Times Square billboard',
    'bid',
    false,
    '00000000-0000-0000-0000-000000000101',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000004002',
    '00000000-0000-0000-0000-000000000003',
    'The Banner at Football Stadium auction has ended',
    'auction-end',
    false,
    '00000000-0000-0000-0000-000000000102',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000004003',
    '00000000-0000-0000-0000-000000000002',
    'System maintenance scheduled',
    'system',
    false,
    NULL,
    NOW(),
    NOW()
  );

-- 7) BIDS
-- We'll have Alice and Charlie place bids on these spots.
INSERT INTO bids (
  id, 
  ad_spot_id, 
  user_id, 
  amount, 
  is_highest_bid,
  created_at,
  updated_at
)
VALUES
  -- Ad Spot #101 (Times Square)
  ('00000000-0000-0000-0000-000000005001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 6000.00, false, NOW(), NOW()), 
  ('00000000-0000-0000-0000-000000005002', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000003', 9000.00, true, NOW(), NOW()),

  -- Ad Spot #102 (Stadium Banner)
  ('00000000-0000-0000-0000-000000005003', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 11000.00, false, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000005004', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000003', 16000.00, true, NOW(), NOW()),

  -- Ad Spot #103 (Mall Ad)
  ('00000000-0000-0000-0000-000000005005', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000003', 2800.00, true, NOW(), NOW());

-- Update total_bids in each ad_spot to reflect the above inserts
UPDATE ad_spots
  SET total_bids = 2
  WHERE id = '00000000-0000-0000-0000-000000000101';

UPDATE ad_spots
  SET total_bids = 2
  WHERE id = '00000000-0000-0000-0000-000000000102';

UPDATE ad_spots
  SET total_bids = 1
  WHERE id = '00000000-0000-0000-0000-000000000103';

-- 8) TRANSACTIONS
-- Typically you'd only create a transaction if the auction ended and the highest bidder is paying.
INSERT INTO transactions (
  id, 
  bid_id, 
  user_id, 
  ad_spot_id, 
  amount, 
  status, 
  payment_method, 
  payment_id, 
  invoice_number,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000006001',
    '00000000-0000-0000-0000-000000005002', -- highest bid on #101
    '00000000-0000-0000-0000-000000000003', -- Charlie
    '00000000-0000-0000-0000-000000000101',
    9000.00,
    'pending',
    'credit_card',
    'PAY12345',
    'INV-1001',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000006002',
    '00000000-0000-0000-0000-000000005004', -- highest bid on #102
    '00000000-0000-0000-0000-000000000003', -- Charlie
    '00000000-0000-0000-0000-000000000102',
    16000.00,
    'pending',
    'paypal',
    'PAY67890',
    'INV-1002',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000006003',
    '00000000-0000-0000-0000-000000005005', -- highest bid on #103
    '00000000-0000-0000-0000-000000000003', -- Charlie
    '00000000-0000-0000-0000-000000000103',
    2800.00,
    'pending',
    'bank_transfer',
    'PAY54321',
    'INV-1003',
    NOW(),
    NOW()
  );

COMMIT;
