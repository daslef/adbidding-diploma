import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Timer, Users, MapPin } from "lucide-react";
import { AdSpot } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface AdSpotCardProps {
  adSpot: AdSpot;
}

export const AdSpotCard = ({ adSpot }: AdSpotCardProps) => {
  return (
    <Link href={`/marketplace/${adSpot.id}/bidding`} className="group">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="aspect-video relative">
          <Image
            src={adSpot.imageUrl}
            alt={adSpot.title}
            width={400}
            height={320}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-black/75 text-white px-3 py-1 rounded-full text-sm">
            <span className="font-medium">
              {formatCurrency(adSpot.currentPrice)}
            </span>
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

          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{adSpot.location?.split(" ")[0] || "Location"}</span>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Ставок: {adSpot.totalBids || 0}
            </div>
            <div className="text-sm font-medium text-blue-600">Детали →</div>
          </div>
        </div>
      </div>
    </Link>
  );
};
