'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, TrendingUp, Users, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background via-background to-secondary/20 pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Premium Ad Spaces at Your Fingertips
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Find and bid on high-impact advertising opportunities across events, venues, and digital platforms. Connect with audiences that matter.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-6">
                <Link href="/marketplace">
                  Explore Ad Spaces
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border px-6">
                <Link href="/register">
                  Create Account
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </section>

      {/* Stats Bar */}
      <section className="bg-secondary/30 py-10 border-y border-border/50">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">500+</p>
              <p className="text-sm text-muted-foreground text-center">Active Ad Spaces</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">75M+</p>
              <p className="text-sm text-muted-foreground text-center">Monthly Impressions</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">15K+</p>
              <p className="text-sm text-muted-foreground text-center">Successful Bids</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">98%</p>
              <p className="text-sm text-muted-foreground text-center">Client Satisfaction</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Platform</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our advertising marketplace connects you with premium ad spaces through a transparent, efficient bidding process.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-card rounded-xl p-8 border border-border shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-accent/10 text-accent mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Bidding</h3>
              <p className="text-muted-foreground">
                Secure the best ad spaces with transparent, competitive bidding that ensures fair market value.
              </p>
            </motion.div>

            <motion.div 
              className="bg-card rounded-xl p-8 border border-border shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-accent/10 text-accent mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Targeted Audience</h3>
              <p className="text-muted-foreground">
                Reach precisely defined audiences with detailed demographic and engagement metrics for each ad space.
              </p>
            </motion.div>

            <motion.div 
              className="bg-card rounded-xl p-8 border border-border shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-accent/10 text-accent mb-6">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Locations</h3>
              <p className="text-muted-foreground">
                Access exclusive high-visibility locations that aren't available through traditional advertising channels.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our streamlined process makes it easy to find and secure the perfect advertising space.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Browse Listings",
                description: "Explore our curated selection of premium ad spaces across venues and digital platforms."
              },
              {
                step: "02",
                title: "Place Your Bid",
                description: "Set your price and submit competitive bids on the spaces that best reach your target audience."
              },
              {
                step: "03",
                title: "Win Auctions",
                description: "Receive real-time notifications when you're the highest bidder or when you need to update your bid."
              },
              {
                step: "04",
                title: "Launch Campaign",
                description: "Once you've secured your space, upload your creative assets and launch your campaign."
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="bg-card rounded-xl p-8 border border-border shadow-sm h-full">
                  <div className="text-5xl font-bold text-accent/20 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="text-muted-foreground/30 h-8 w-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ad Spaces */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-end mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">Featured Ad Spaces</h2>
              <p className="text-muted-foreground mt-2">Trending opportunities you don't want to miss</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Button asChild variant="outline">
                <Link href="/marketplace">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Billboard on Times Square",
                location: "New York City",
                price: "$10,000",
                image: "/api/placeholder/800/500",
                views: "100K",
                endingSoon: true
              },
              {
                title: "Banner at Football Stadium",
                location: "Los Angeles",
                price: "$20,000",
                image: "/api/placeholder/800/500",
                views: "50K",
                endingSoon: false
              },
              {
                title: "Digital Ad in Mall",
                location: "Chicago",
                price: "$3,000",
                image: "/api/placeholder/800/500",
                views: "20K",
                endingSoon: false
              }
            ].map((space, index) => (
              <motion.div 
                key={index}
                className="bg-card rounded-xl overflow-hidden border border-border shadow-sm group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={space.image}
                    alt={space.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {space.endingSoon && (
                    <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Ending Soon
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                    {space.title}
                  </h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <span>{space.location}</span>
                    <span className="mx-2">•</span>
                    <span>{space.views} Est. Views</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-lg">{space.price}</p>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent/5 border-y border-border/50">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Amplify Your Advertising Impact?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of brands leveraging our platform to secure premium advertising spots at competitive prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-6">
                  <Link href="/marketplace">
                    Start Bidding Now
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-border px-6">
                  <Link href="/contact">
                    Contact Sales
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}