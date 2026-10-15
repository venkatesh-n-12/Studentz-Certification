'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Calendar, Clock, MapPin, IndianRupee, Award, CheckCircle } from 'lucide-react';
import { Opportunity } from '../types';
import { isOpportunitySaved, toggleOpportunitySave, subscribeToBookmarks } from '@/utils/bookmarkService';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onBookmarkToggle?: (id: string, isSaved: boolean) => void;
}

export default function OpportunityCard({ opportunity, onBookmarkToggle }: OpportunityCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isOpportunitySaved(opportunity.id));
    const unsubscribe = subscribeToBookmarks(() => {
      setIsSaved(isOpportunitySaved(opportunity.id));
    });
    return unsubscribe;
  }, [opportunity.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = await toggleOpportunitySave(opportunity);
    setIsSaved(nextState);
    if (onBookmarkToggle) {
      onBookmarkToggle(opportunity.id, nextState);
    }
  };

  const formatDate = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const startFmt = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endFmt = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    if (start.toDateString() === end.toDateString()) {
      return `${startFmt}, ${start.getFullYear()}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      return `${startFmt} – ${endFmt}`;
    } else {
      return `${startFmt}, ${start.getFullYear()} – ${endFmt}`;
    }
  };

  const renderPayment = () => {
    if (opportunity.paymentType === 'Free' || opportunity.paymentType === 'Unpaid') {
      return <span className="font-medium text-white">{opportunity.paymentType}</span>;
    }
    
    return (
      <span className="font-medium text-emerald-400 flex items-center">
        {opportunity.paymentType} — <IndianRupee className="w-3 h-3 ml-1 mr-0.5" />{opportunity.price?.toLocaleString()}
      </span>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hackathons': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Internships': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Certifications': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Workstations': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <Link 
      href={`/explore/${opportunity.id}`}
      className="block glass-card rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group"
    >
      <div className="p-6">
        {/* Top */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(opportunity.category)}`}>
            {opportunity.category}
          </span>
          <button 
            onClick={toggleSave}
            className="p-2 -mr-2 -mt-2 rounded-full hover:bg-white/5 transition-colors group/btn"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isSaved 
                  ? 'fill-rose-500 text-rose-500 group-hover/btn:fill-rose-600' 
                  : 'text-zinc-400 group-hover/btn:text-white'
              }`} 
            />
          </button>
        </div>

        {/* Middle */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {opportunity.title}
          </h3>
          <p className="text-zinc-400 text-sm font-medium">{opportunity.organization}</p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-zinc-300 mb-6">
          <div className="flex items-start">
            <Calendar className="w-4 h-4 mr-2 mt-0.5 text-zinc-500 shrink-0" />
            <span className="line-clamp-1" title={formatDate(opportunity.startDate, opportunity.endDate)}>
              {formatDate(opportunity.startDate, opportunity.endDate)}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-zinc-500 shrink-0" />
            <span className="line-clamp-1">{opportunity.duration}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-zinc-500 shrink-0" />
            <span className="line-clamp-1">{opportunity.mode}</span>
          </div>
          <div className="flex items-center">
            {renderPayment()}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center text-xs text-zinc-400">
            {opportunity.certificateAvailable ? (
              <>
                <Award className="w-4 h-4 mr-1.5 text-amber-400" />
                <span>Certificate Available</span>
              </>
            ) : (
              <span className="text-zinc-500">No Certificate</span>
            )}
          </div>
          <div className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform flex items-center">
            View Details <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
