"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { getAdSpots } from "@/lib/api/adSpots";
import { AdSpot } from "@/types";
import { toast } from "sonner";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    status: "active",
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch spots
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adSpots", page, debouncedSearch, filters],
    queryFn: () =>
      getAdSpots({
        page,
        search: debouncedSearch,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        status: filters.status,
      }),
    onError: (error: unknown) => {
      toast.error((error as Error).message || "Ошибка загрузки");
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Placeholder for ad spots during loading
  const renderAdSpotSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
        >
          <div className="aspect-video bg-gray-200"></div>
          <div className="p-4 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ));
  };

  const renderAdSpotCard = (adSpot: AdSpot) => {
    return (
      <a
        key={adSpot.id}
        href={`/marketplace/${adSpot.id}/bidding`}
        className="group"
      >
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

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <span>{adSpot.location?.split(" ")[0] || "Локация"}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {adSpot.totalBids || 0} ставок
              </div>
              <div className="text-sm font-medium text-blue-600">
                Посмотреть детали →
              </div>
            </div>
          </div>
        </div>
      </a>
    );
  };

  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8">
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-500 disabled:opacity-50"
          >
            Предыдущая
          </button>

          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded-md ${
                  pageNum === page
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            ),
          )}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === data.totalPages}
            className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-500 disabled:opacity-50"
          >
            Следующая
          </button>
        </nav>
      </div>
    );
  };

  // Simple filter drawer component
  const renderFilterDrawer = () => {
    if (!isFilterOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setIsFilterOpen(false)}
        />

        <div className="relative w-full max-w-md bg-white shadow-lg h-full overflow-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              onClick={() => setIsFilterOpen(false)}
            >
              &times;
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="font-medium">Диапазон ставок</h3>
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <label htmlFor="minPrice" className="text-sm text-gray-600">
                    Минимальная ставка
                  </label>
                  <input
                    id="minPrice"
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <label htmlFor="maxPrice" className="text-sm text-gray-600">
                    Максимальная ставка
                  </label>
                  <input
                    id="maxPrice"
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="font-medium">Статус</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="status-all"
                    name="status"
                    value=""
                    checked={filters.status === ""}
                    onChange={() => setFilters({ ...filters, status: "" })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="status-all" className="text-sm text-gray-700">
                    Все записи
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="status-active"
                    name="status"
                    value="active"
                    checked={filters.status === "active"}
                    onChange={() =>
                      setFilters({ ...filters, status: "active" })
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <label
                    htmlFor="status-active"
                    className="text-sm text-gray-700"
                  >
                    Только активные
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="status-ended"
                    name="status"
                    value="ended"
                    checked={filters.status === "ended"}
                    onChange={() => setFilters({ ...filters, status: "ended" })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label
                    htmlFor="status-ended"
                    className="text-sm text-gray-700"
                  >
                    Только завершенные
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 sticky bottom-0">
            <div className="flex gap-4">
              <button
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setFilters({
                    minPrice: "",
                    maxPrice: "",
                    status: "active",
                  });
                }}
              >
                Сбросить
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setIsFilterOpen(false)}
              >
                Применить фильтры
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header and Search */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Аукционы</h1>
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Фильтры
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search listings..."
          />
        </div>

        {/* Search Results Count */}
        {data && (
          <p className="text-sm text-gray-600">
            Найдено {data.totalItems}{" "}
            {data.totalItems === 1 ? "аукцион" : "аукционов"}
          </p>
        )}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          renderAdSpotSkeletons()
        ) : isError ? (
          <div className="col-span-full text-center py-10">
            <p className="text-red-500">
              Не удалось загрузить. Попробуйте снова.
            </p>
          </div>
        ) : data?.data && data.data.length > 0 ? (
          data.data.map((adSpot) => renderAdSpotCard(adSpot))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Не найдено.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Filter Drawer */}
      {renderFilterDrawer()}
    </div>
  );
}
