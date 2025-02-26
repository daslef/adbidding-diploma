import { apiClient } from './client';
import { AdSpot, Bid, PaginatedResponse } from '@/types';

interface GetAdSpotsParams {
  page?: number;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  status?: string;
}

export const getAdSpots = async (params) => {
  // const response = await fetch('/api/adspots', { params });
  // const data = await response.json();
  const { data } = await apiClient.get('/adspots', { params });
  
  // Transform the response to match what the component expects
  return {
    data: data.adSpots,
    totalItems: data.totalAdSpots,
    totalPages: data.totalPages,
    currentPage: data.currentPage
  };
};

export const getAdSpot = async (id: string | number): Promise<AdSpot> => {
  try {
    const { data } = await apiClient.get(`/adspots/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching ad spot ${id}:`, error);
    throw error;
  }
};

export const getBids = async (adSpotId: string | number): Promise<Bid[]> => {
  try {
    const { data } = await apiClient.get(`/adspots/${adSpotId}/bids`);
    return data;
  } catch (error) {
    console.error(`Error fetching bids for ad spot ${adSpotId}:`, error);
    throw error;
  }
};

export const placeBid = async (adSpotId: string | number, amount: number): Promise<Bid> => {
  try {
    const { data } = await apiClient.post(`/adspots/${adSpotId}/bids`, { amount });
    return data;
  } catch (error) {
    console.error(`Error placing bid for ad spot ${adSpotId}:`, error);
    throw error;
  }
};

export const watchAdSpot = async (adSpotId: string | number): Promise<void> => {
  try {
    await apiClient.post(`/adspots/${adSpotId}/watch`);
  } catch (error) {
    console.error(`Error watching ad spot ${adSpotId}:`, error);
    throw error;
  }
};

export const unwatchAdSpot = async (adSpotId: string | number): Promise<void> => {
  try {
    await apiClient.delete(`/adspots/${adSpotId}/watch`);
  } catch (error) {
    console.error(`Error unwatching ad spot ${adSpotId}:`, error);
    throw error;
  }
};