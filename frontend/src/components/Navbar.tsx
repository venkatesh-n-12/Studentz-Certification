'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed.user || parsed);
      } catch (e) {}
    }
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              Studentz<span className="text-zinc-400">Cert</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              <div key={link.name} className="flex items-center">
                <Link
                  href={link.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                    pathname === link.path ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  {link.name}
                </Link>
                {index < navLinks.length - 1 && (
                  <span className="h-4 w-[1px] bg-white/20 mx-1"></span>
                )}
              </div>
            ))}
            {user && user.role === 'OWNER' && (
              <div className="flex items-center">
                <span className="h-4 w-[1px] bg-white/20 mx-1"></span>
                <Link
                  href="/owner"
                  className={`px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                    pathname === '/owner' ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-zinc-300">
                  Hi, {user.name}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    window.location.href = '/';
                  }}
                  className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-md hover:bg-white/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-zinc-200 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-400 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-64 border-b border-white/5' : 'max-h-0'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2 bg-background/95 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 text-base font-medium rounded-md transition-colors ${
                pathname === link.path
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user && user.role === 'OWNER' && (
            <Link
              href="/owner"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 text-base font-medium rounded-md transition-colors ${
                pathname === '/owner'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
          )}
          <div className="pt-4 flex flex-col gap-3 border-t border-white/5">
            {user ? (
              <>
                <div className="text-center px-4 py-2 text-base font-medium text-white">
                  Hi, {user.name}
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    setIsOpen(false);
                    window.location.href = '/';
                  }}
                  className="block w-full text-center px-4 py-2 text-base font-medium text-white border border-white/20 rounded-md hover:bg-white/10 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 text-base font-medium text-zinc-300 bg-white/5 rounded-md hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 text-base font-medium text-black bg-white rounded-md hover:bg-zinc-200 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
