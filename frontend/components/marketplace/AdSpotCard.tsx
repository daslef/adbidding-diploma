import React from 'react';
import Link from 'next/link';
import { Timer, Users, MapPin } from 'lucide-react';
import { AdSpot } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AdSpotCardProps {
  adSpot: AdSpot;
}

export const AdSpotCard = ({ adSpot }: AdSpotCardProps) => {
  return (
    <Link 
      href={`/marketplace/${adSpot.id}/bidding`}
      className="group"
    >
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="aspect-video relative">
          <img
            src={adSpot.imageUrl}
            alt={adSpot.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-black/75 text-white px-3 py-1 rounded-full text-sm">
            <span className="font-medium">{formatCurrency(adSpot.currentPrice)}</span>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {adSpot.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {adSpot.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Timer className="h-4 w-4" />
              <span>{adSpot.seasonDuration?.split(' ')[0] || 'Season'}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{adSpot.estimatedViews ? `${(adSpot.estimatedViews / 1000)}K` : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{adSpot.location?.split(' ')[0] || 'Location'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {adSpot.totalBids || 0} bids
            </div>
            <div className="text-sm font-medium text-blue-600">
              View Details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};