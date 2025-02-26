'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, HomeIcon, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut" 
              }}
            >
              <AlertCircle className="h-32 w-32 text-red-300" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute -right-2 -bottom-2 bg-card rounded-full p-2 shadow-lg border border-border"
            >
              <span className="text-2xl">404</span>
            </motion.div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Oops! Page Not Found
        </h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          We couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Here are some helpful links instead:
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Link href="/">
                <HomeIcon className="mr-2 h-5 w-5" />
                Home
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="border-border"
            >
              <Link href="/marketplace">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Marketplace
              </Link>
            </Button>
          </div>
          
          <Button
            asChild
            variant="ghost"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            <div>
              <ArrowLeft className="mr-2 h-5 w-5 inline-block" />
              Go Back
            </div>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}