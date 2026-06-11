export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: 'user' | 'admin';
  lastLogin?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface AdSpot {
  id: string | number;
  title: string;
  description: string;
  currentPrice: number;
  startingPrice: number;
  reservePrice: number;
  endDate: string;
  status: 'active' | 'ended';
  totalBids: number;
  imageUrl: string;
  location: string;
  eventCount: number;
}

export interface Bid {
  id: string | number;
  adSpotId: string | number;
  userId: string | number;
  amount: number;
  companyName?: string;
  createdAt: string;
  isHighestBid: boolean;
}

export interface Notification {
  id: string | number;
  userId: string | number;
  message: string;
  type: 'bid' | 'auction-end' | 'outbid' | 'system';
  read: boolean;
  createdAt: string;
  relatedAdSpotId?: string | number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

// WebSocket Types
export interface BidUpdate {
  adSpotId: string | number;
  bid: Bid;
  adSpot: {
    id: string | number;
    currentPrice: number;
    totalBids: number;
  };
}

export interface AuctionEndUpdate {
  adSpotId: string | number;
  endedAt: string;
  highestBid?: Bid;
}

export interface NotificationUpdate {
  id: string | number;
  userId: string | number;
  message: string;
  type: 'bid' | 'auction-end' | 'outbid' | 'system';
  createdAt: string;
  relatedAdSpotId?: string | number;
}