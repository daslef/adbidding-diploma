'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, User, Menu } from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-blue-600">
            AdTech Platform
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/marketplace"
              className={`text-sm font-medium ${
                pathname.includes('/marketplace')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Marketplace
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium ${
                pathname.includes('/dashboard')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/analytics"
              className={`text-sm font-medium ${
                pathname.includes('/analytics')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Analytics
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-blue-600">
              <Bell className="h-5 w-5" />
            </button>
            <Link
              href="/profile"
              className="text-gray-700 hover:text-blue-600"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              className="md:hidden text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mt-4 md:hidden">
            <nav className="flex flex-col space-y-3 py-3">
              <Link
                href="/marketplace"
                className={`text-sm font-medium ${
                  pathname.includes('/marketplace')
                    ? 'text-blue-600'
                    : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${
                  pathname.includes('/dashboard')
                    ? 'text-blue-600'
                    : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/analytics"
                className={`text-sm font-medium ${
                  pathname.includes('/analytics')
                    ? 'text-blue-600'
                    : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Analytics
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};