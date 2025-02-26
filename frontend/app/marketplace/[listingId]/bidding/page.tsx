'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Timer, ArrowUp, EyeOff, Eye, Users, Calendar, Trophy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdSpot, getBids, placeBid } from '@/lib/api/adSpots';
import { formatCurrency, formatTimeLeft, formatDateTime } from '@/lib/utils';
import { toast } from "sonner";
import { Bid } from '@/types';

const BiddingInterface = () => {
  const params = useParams();
  const listingId = params.listingId as string;
  const { socket, joinBidding, leaveBidding } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Track raw input separately from the validated/formatted amount
  const [rawBidInput, setRawBidInput] = useState<string>("");
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isWatching, setIsWatching] = useState(false);
  const [showBidSuccess, setShowBidSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Fetch ad spot data
  const { data: adSpot, isLoading: isLoadingAdSpot } = useQuery({
    queryKey: ['adSpot', listingId],
    queryFn: () => getAdSpot(listingId),
  });

  // Fetch bids data
  const { data: bids = [], isLoading: isLoadingBids } = useQuery({
    queryKey: ['bids', listingId],
    queryFn: () => getBids(listingId),
  });

  // Set up bid mutation
  const bidMutation = useMutation({
    mutationFn: (amount: number) => placeBid(listingId, amount),
    onSuccess: (data) => {
      setRawBidInput("");
      setBidAmount("");
      setShowBidSuccess(true);
      setTimeout(() => setShowBidSuccess(false), 3000);
      
      // Fixed toast call
      toast.success("Bid Placed Successfully", {
        description: `Your bid of ${formatCurrency(parseInt(bidAmount))} has been placed.`
      });
    },
    onError: (error: any) => {
      console.error("Bid error:", error);
      
      // Ensure error.message is a string
      const errorMessage = typeof error.message === 'string' 
        ? error.message 
        : "There was an error placing your bid.";
      
      // Fixed toast call
      toast.error("Bid Failed", {
        description: errorMessage
      });
    },
  });

  // Handle watch toggle
  const handleWatchToggle = () => setIsWatching(!isWatching);

  // Setup socket event listeners for bid success/error when using socket directly
  useEffect(() => {
    if (socket) {
      // Listen for direct bid success/error responses
      socket.on('bid-success', (data) => {
        setRawBidInput("");
        setBidAmount("");
        setShowBidSuccess(true);
        setTimeout(() => setShowBidSuccess(false), 3000);
        
        toast.success("Bid Placed Successfully", {
          description: `Your bid has been placed.`
        });
      });
      
      socket.on('bid-error', (error) => {
        const errorMessage = typeof error.message === 'string' 
          ? error.message 
          : "There was an error placing your bid.";
        
        toast.error("Bid Failed", {
          description: errorMessage
        });
      });
    }
    
    return () => {
      if (socket) {
        socket.off('bid-success');
        socket.off('bid-error');
      }
    };
  }, [socket]);

  // Join bid room when component mounts
  useEffect(() => {
    if (socket) {
      joinBidding(listingId);
      
      // Listen for new bids
      socket.on('new-bid', (data) => {
        // Update bids and ad spot data cache
        queryClient.setQueryData(['bids', listingId], (oldData: Bid[] = []) => {
          const updatedBids = [...oldData];
          // Mark all as not highest
          updatedBids.forEach(bid => { bid.isHighestBid = false; });
          // Ensure the bid has a properly formatted date
          const newBid = {
            ...data.bid,
            createdAt: data.bid.createdAt || new Date().toISOString()
          };
          // Add new bid
          return [newBid, ...updatedBids];
        });
        
        queryClient.setQueryData(['adSpot', listingId], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            currentPrice: data.adSpot.currentPrice,
            totalBids: data.adSpot.totalBids,
          };
        });
        
        // Show notification if outbid
        if (user && user.id !== data.bid.userId && isWatching) {
          toast.info("New Bid Placed", {
            description: `A new bid of ${formatCurrency(data.bid.amount)} has been placed.`
          });
        }
      });
      
      // Listen for auction end
      socket.on('auction-ended', (data) => {
        queryClient.setQueryData(['adSpot', listingId], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            status: 'ended',
          };
        });
        
        toast.info("Auction Ended", {
          description: "This auction has ended."
        });
      });
    }
    
    return () => {
      if (socket) {
        leaveBidding(listingId);
        socket.off('new-bid');
        socket.off('auction-ended');
      }
    };
  }, [socket, listingId, queryClient, user, isWatching, joinBidding, leaveBidding]);

  // Timer for countdown
  useEffect(() => {
    if (!adSpot) return;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(adSpot.endDate).getTime();
      const difference = endTime - now;
      
      if (difference > 0) {
        setTimeLeft(formatTimeLeft(difference));
      } else {
        setTimeLeft("Auction ended");
        
        queryClient.setQueryData(['adSpot', listingId], (oldData: any) => {
          if (!oldData || oldData.status === 'ended') return oldData;
          return { ...oldData, status: 'ended' };
        });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [adSpot, listingId, queryClient]);

  // Round to nearest $5 increment when field loses focus
  const handleInputBlur = () => {
    if (rawBidInput.trim() === '') {
      setBidAmount('');
      return;
    }
    
    const numValue = parseInt(rawBidInput, 10);
    if (!isNaN(numValue) && numValue > 0) {
      const roundedValue = Math.ceil(numValue / 5) * 5;
      setRawBidInput(roundedValue.toString());
      setBidAmount(roundedValue.toString());
    }
  };

  // Handle bid submission
  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSpot || !user) {
      toast.error("Cannot Place Bid", {
        description: user ? "Listing information not available" : "Please log in to place a bid"
      });
      return;
    }
    
    // Force a rounding to ensure proper increment
    let bidValue = rawBidInput;
    if (bidValue.trim() !== '') {
      const numValue = parseInt(bidValue, 10);
      if (!isNaN(numValue) && numValue > 0) {
        const roundedValue = Math.ceil(numValue / 5) * 5;
        bidValue = roundedValue.toString();
        setRawBidInput(bidValue);
        setBidAmount(bidValue);
      }
    }
    
    const amount = parseInt(bidValue, 10);
    
    // Comprehensive validation
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid positive whole number"
      });
      return;
    }
    
    // Check if the bid is a multiple of 5
    if (amount % 5 !== 0) {
      toast.error("Invalid Bid Increment", {
        description: "Bids must be in increments of $5"
      });
      return;
    }
    
    if (amount <= adSpot.currentPrice) {
      toast.error("Bid Too Low", {
        description: `Bid must be higher than current price: ${formatCurrency(adSpot.currentPrice)}`
      });
      return;
    }
    
    bidMutation.mutate(amount);
  };

  const formatWholeNumber = (value: number) => {
    return Math.round(value).toLocaleString('en-US');
  };

  if (isLoadingAdSpot) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!adSpot) {
    return <div className="min-h-screen flex items-center justify-center">Listing not found</div>;
  }
  
  // Calculate minimum bid
  const minBid = adSpot.currentPrice + 5;
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Ad Spot Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl shadow-lg overflow-hidden transition-colors duration-300 border border-border">
              <img 
                src={adSpot.imageUrl} 
                alt={adSpot.title}
                className="w-full h-96 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-foreground">{adSpot.title}</h1>
                  <button
                    onClick={handleWatchToggle}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    {isWatching ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    {isWatching ? 'Unwatch' : 'Watch'}
                  </button>
                </div>

                <p className="mt-4 text-muted-foreground">{adSpot.description}</p>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { icon: Calendar, label: "Events", value: adSpot.eventCount },
                    { icon: Users, label: "Est. Views", value: `${(adSpot.estimatedViews / 1000)}K` },
                    { icon: Trophy, label: "Location", value: adSpot.location },
                    { icon: Bell, label: "Duration", value: "Full Season" }
                  ].map((metric, index) => (
                    <div key={index} className="p-4 bg-secondary rounded-lg transition-colors duration-300">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <metric.icon className="h-5 w-5" />
                        <span>{metric.label}</span>
                      </div>
                      <p className={`${typeof metric.value === 'number' ? 'text-2xl' : 'text-lg'} font-bold mt-1 text-foreground`}>
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Key Events */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Featured Events</h3>
                  <div className="grid grid-cols-2 gap-2">
                  {adSpot.keyEvents && adSpot.keyEvents.map((event, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      {event}
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bidding Section */}
            <div className="bg-card rounded-xl shadow-lg p-6 transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Current Bid</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${formatWholeNumber(adSpot.currentPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Time Left</p>
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-muted-foreground" />
                    <p className="text-xl font-semibold text-foreground">{timeLeft}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div className="flex gap-4">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={rawBidInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setRawBidInput(value);
                    
                    if (value === '') {
                      setBidAmount('');
                    } else {
                      setBidAmount(value);
                    }
                  }}
                  onBlur={handleInputBlur}
                  placeholder={`Min. bid: $${formatWholeNumber(minBid)}`}
                  className="flex-1 px-4 py-3 border rounded-lg transition-all duration-300 
                    bg-secondary text-foreground placeholder:text-muted-foreground"
                />
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-lg transition-colors bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Place Bid
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Bids must be in increments of $5. Minimum bid: ${formatWholeNumber(minBid)}
                </div>
              </form>

              <AnimatePresence>
                {showBidSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4"
                  >
                    <Alert>
                      <AlertDescription>
                        Your bid has been placed successfully!
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Bid History */}
          <div className="bg-card rounded-xl shadow-lg p-6 h-fit transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Bid History</h2>
              <span className="text-sm text-muted-foreground">{adSpot.totalBids} total bids</span>
            </div>
            
            <div className="space-y-4">
            {bids && bids.length > 0 ? (
              bids.map((bid) => (
                <motion.div
                  key={bid.id}
                  initial={bid.isHighestBid ? { scale: 0.95 } : {}}
                  animate={bid.isHighestBid ? { scale: 1 } : {}}
                  className={`p-4 rounded-lg transition-all duration-300 
                    ${bid.isHighestBid 
                      ? 'bg-secondary border-2 border-accent shadow-md' 
                      : 'bg-secondary border border-border'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{bid.companyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(bid.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ${formatWholeNumber(bid.amount)}
                      </p>
                      {bid.isHighestBid && (
                        <span className="text-sm text-accent flex items-center gap-1">
                          <ArrowUp className="h-4 w-4" />
                          Highest Bid
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-4">No bids yet</div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingInterface;