"use client"

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: {
    minPrice: string;
    maxPrice: string;
    status: string;
  };
  onFilterChange: (filters: {
    minPrice: string;
    maxPrice: string;
    status: string;
  }) => void;
}

export const FilterDrawer = ({
  open,
  onClose,
  filters,
  onFilterChange,
}: FilterDrawerProps) => {
  const [localFilters, setLocalFilters] = React.useState(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      minPrice: '',
      maxPrice: '',
      status: 'active',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white shadow-lg h-full overflow-auto animate-in slide-in-from-right">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Price Range */}
          <div className="space-y-4">
            <h3 className="font-medium">Price Range</h3>
            <div className="flex items-center gap-4">
              <div className="space-y-2 flex-1">
                <label htmlFor="minPrice" className="text-sm text-gray-600">
                  Min Price
                </label>
                <Input
                  id="minPrice"
                  name="minPrice"
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2 flex-1">
                <label htmlFor="maxPrice" className="text-sm text-gray-600">
                  Max Price
                </label>
                <Input
                  id="maxPrice"
                  name="maxPrice"
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          {/* Status */}
          <div className="space-y-4">
            <h3 className="font-medium">Listing Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="status-all"
                  name="status"
                  value=""
                  checked={localFilters.status === ''}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="status-all" className="text-sm text-gray-700">
                  Все Аукционы
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="status-active"
                  name="status"
                  value="active"
                  checked={localFilters.status === 'active'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="status-active" className="text-sm text-gray-700">
                  Только активные
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="status-ended"
                  name="status"
                  value="ended"
                  checked={localFilters.status === 'ended'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="status-ended" className="text-sm text-gray-700">
                  Только завершенные
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 p-4 bg-white border-t flex gap-4">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Сбросить
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Применить
          </Button>
        </div>
      </div>
    </div>
  );
};