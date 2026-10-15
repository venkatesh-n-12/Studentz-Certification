'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-white mb-4 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-[#060713] p-0.5 group-hover:border-indigo-500/50 transition-colors shadow-sm">
                <Image
                  src="/logo-icon.png"
                  alt="Studentz Certification"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                />
              </div>
              <span>
                Studentz<span className="text-zinc-400 font-normal">Cert</span>
              </span>
            </Link>
            <p className="text-sm font-medium text-indigo-400 mb-1">
              One Platform. Every Opportunity.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Discover opportunities. Build your future.<br />
              The premium platform for students in India.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/explore" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/signin" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/explore?category=Hackathons" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Hackathons
                </Link>
              </li>
              <li>
                <Link href="/explore?category=Internships" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/explore?category=Certifications" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Certifications
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            &copy; 2026 Studentz Certification. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
