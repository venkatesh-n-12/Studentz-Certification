'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { Search, SlidersHorizontal, X, Plus, Heart, Sparkles, Filter } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import OpportunityCard from '@/components/OpportunityCard';
import DatePicker from '@/components/DatePicker';
import { mockOpportunities } from '@/data/mockData';
import { Category, Opportunity } from '@/types';
import { getSavedOpportunities, getSavedIds, subscribeToBookmarks } from '@/utils/bookmarkService';
import { API_BASE_URL } from '@/config/api';

const CATEGORIES: Category[] = [
  'Hackathons',
  'Internships',
  'Certifications',
  'Workstations',
  'Other Programs',
];

const DOMAINS = [
  { id: 'All', label: 'All Domains', icon: '✨' },
  { id: 'Web & Mobile', label: 'Web & Mobile', icon: '💻', keywords: ['react', 'next.js', 'frontend', 'mobile', 'full-stack', 'web', 'flutter', 'javascript', 'typescript'] },
  { id: 'AI & Data Science', label: 'AI & Machine Learning', icon: '🤖', keywords: ['ai', 'machine learning', 'deep learning', 'nlp', 'data science', 'llm', 'pytorch', 'transformers', 'gpu'] },
  { id: 'Cloud & DevOps', label: 'Cloud & DevOps', icon: '☁️', keywords: ['cloud', 'aws', 'gcp', 'azure', 'devops', 'kubernetes', 'docker', 'terraform'] },
  { id: 'Open Source & Web3', label: 'Open Source & Web3', icon: '🌐', keywords: ['open source', 'web3', 'ethereum', 'blockchain', 'solidity', 'gsoc', 'fellowship'] },
  { id: 'Design & Creative', label: 'UI/UX & Design', icon: '🎨', keywords: ['design', 'creative', '3d', 'studio', 'rendering', 'ui', 'ux', 'blender'] },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get('category') as Category | null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>(initialCategory || 'All');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [modeFilter, setModeFilter] = useState<string>('Any');
  const [paymentFilter, setPaymentFilter] = useState<string>('Any');
  const [dateFilter, setDateFilter] = useState<string>('Any');
  const [customDateRange, setCustomDateRange] = useState<{start: string, end: string} | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('None');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Sync bookmarks state
  useEffect(() => {
    setSavedIds(getSavedIds());
    const unsubscribe = subscribeToBookmarks(() => {
      setSavedIds(getSavedIds());
    });
    return unsubscribe;
  }, []);

  // Fetch opportunities from backend API with fallback
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed.user || parsed);
      }
    } catch(e) {}

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    fetch(`${API_BASE_URL}/api/opportunities?limit=100`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeout);

        const categoryMap: Record<string, string> = {
          'HACKATHON': 'Hackathons',
          'HACKATHONS': 'Hackathons',
          'INTERNSHIP': 'Internships',
          'INTERNSHIPS': 'Internships',
          'CERTIFICATION': 'Certifications',
          'CERTIFICATIONS': 'Certifications',
          'WORKSTATION': 'Workstations',
          'WORKSTATIONS': 'Workstations',
          'OTHER_PROGRAM': 'Other Programs',
          'OTHER PROGRAMS': 'Other Programs',
        };
        const modeMap: Record<string, string> = {
          'ONLINE': 'Online',
          'OFFLINE': 'Offline',
          'HYBRID': 'Hybrid',
        };
        const paymentMap: Record<string, string> = {
          'FREE': 'Free',
          'PAID': 'Paid',
          'UNPAID': 'Unpaid',
          'STIPEND': 'Stipend',
        };

        const normalize = (opp: any) => ({
          ...opp,
          category: categoryMap[opp.category?.toUpperCase()] ?? opp.category,
          mode: modeMap[opp.mode?.toUpperCase()] ?? opp.mode,
          paymentType: paymentMap[opp.paymentType?.toUpperCase()] ?? opp.paymentType,
          requirements: typeof opp.requirements === 'string' ? JSON.parse(opp.requirements) : (opp.requirements ?? []),
          benefits: typeof opp.benefits === 'string' ? JSON.parse(opp.benefits) : (opp.benefits ?? []),
        });

        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setOpportunities(data.data.map(normalize));
        } else if (Array.isArray(data) && data.length > 0) {
          setOpportunities(data.map(normalize));
        } else {
          // Fallback to high quality mock data so page is never empty
          setOpportunities(mockOpportunities);
        }
      })
      .catch(err => {
        clearTimeout(timeout);
        console.error('Failed to fetch opportunities from DB, using fallback:', err);
        setOpportunities(mockOpportunities);
      })
      .finally(() => {
        setIsLoadingDb(false);
      });
  }, []);

  // Sync category from URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat as Category)) {
      setSelectedCategory(cat as Category);
    }
  }, [searchParams]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDomain('All');
    setModeFilter('Any');
    setPaymentFilter('Any');
    setDateFilter('Any');
    setCustomDateRange(null);
    setSortOrder('None');
    setShowSavedOnly(false);
    router.push('/explore', { scroll: false });
  };

  const filteredOpportunities = useMemo(() => {
    let result = [...opportunities];

    // Saved only filter
    if (showSavedOnly) {
      result = result.filter(opp => savedIds.includes(opp.id));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(opp => 
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.category.toLowerCase().includes(q) ||
        (opp.subCategory && opp.subCategory.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(opp => opp.category === selectedCategory);
    }

    // Domain / Track filter
    if (selectedDomain !== 'All') {
      const domainObj = DOMAINS.find(d => d.id === selectedDomain);
      if (domainObj && domainObj.keywords) {
        result = result.filter(opp => {
          const text = `${opp.title} ${opp.organization} ${opp.description} ${opp.subCategory || ''} ${(opp.requirements || []).join(' ')}`.toLowerCase();
          return domainObj.keywords.some(k => text.includes(k));
        });
      }
    }

    // Mode filter
    if (modeFilter !== 'Any') {
      result = result.filter(opp => opp.mode === modeFilter);
    }

    // Payment/Price
    if (paymentFilter !== 'Any') {
      if (selectedCategory === 'Internships') {
        result = result.filter(opp => opp.paymentType === paymentFilter);
      } else {
        if (paymentFilter === 'Free') {
          result = result.filter(opp => opp.price === 0 || opp.paymentType === 'Free');
        } else if (paymentFilter === 'Paid') {
          result = result.filter(opp => (opp.price && opp.price > 0) || opp.paymentType === 'Paid');
        }
      }
    }

    // Date
    if (selectedCategory !== 'Internships') {
      if (dateFilter === 'Custom Date' && customDateRange) {
        result = result.filter(opp => {
          const oppStart = new Date(opp.startDate);
          const filterStart = new Date(customDateRange.start);
          const filterEnd = new Date(customDateRange.end);
          filterStart.setHours(0,0,0,0);
          filterEnd.setHours(23,59,59,999);
          return oppStart >= filterStart && oppStart <= filterEnd;
        });
      }
    }

    // Sorting
    if (sortOrder === 'PriceLowHigh') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === 'PriceHighLow') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [opportunities, showSavedOnly, savedIds, searchQuery, selectedCategory, selectedDomain, modeFilter, paymentFilter, dateFilter, customDateRange, sortOrder]);

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="mb-10 text-center relative">
          {currentUser && (currentUser.role === 'OWNER' || currentUser.role === 'ADMIN') && (
            <Link 
              href="/explore/create" 
              className="absolute top-0 right-0 hidden md:flex items-center px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" /> Post Opportunity
            </Link>
          )}

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Student Career Hub
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Explore Opportunities
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg mb-8">
            Discover verified hackathons, internships with stipends, industry certificates, and free workstation computing hours.
          </p>

          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-zinc-400 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by title, organization, technologies (e.g. AI, React, AWS)..."
              className="block w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-700 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-lg text-base md:text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Bar & Saved Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-2.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => { setSelectedCategory('All'); setShowSavedOnly(false); }}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === 'All' && !showSavedOnly
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-zinc-500'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => { 
                  setSelectedCategory(category); 
                  setShowSavedOnly(false);
                }}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === category && !showSavedOnly
                    ? 'bg-white text-black shadow-md'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-zinc-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Saved Bookmarks Pill Button */}
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all self-start md:self-auto ${
              showSavedOnly
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-rose-500/50 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${showSavedOnly ? 'fill-white' : 'text-rose-400'}`} />
            Saved ({savedIds.length})
          </button>
        </div>

        {/* Personalized Domain Chips */}
        <div className="mb-8 p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 shrink-0">
            Field of Interest:
          </span>
          {DOMAINS.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedDomain === domain.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-md'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span>{domain.icon}</span>
              <span>{domain.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Vertical Filter Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-6 sticky top-24">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                  <span className="text-white font-bold text-lg">Filters</span>
                </div>
                <button 
                  onClick={handleClearFilters}
                  className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Mode Filter */}
              <div>
                <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Mode</label>
                <select 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                >
                  <option value="Any">Any Mode</option>
                  <option value="Online">Online / Remote</option>
                  <option value="Offline">Offline / On-Campus</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Payment/Price Filter */}
              <div>
                <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  {selectedCategory === 'Internships' ? 'Compensation' : 'Cost'}
                </label>
                {selectedCategory === 'Internships' ? (
                  <select 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                  >
                    <option value="Any">Any Compensation</option>
                    <option value="Stipend">Paid / Stipend</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                ) : (
                  <select 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                  >
                    <option value="Any">All Prices</option>
                    <option value="Free">100% Free</option>
                    <option value="Paid">Paid / Subsidized</option>
                  </select>
                )}
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Sort By</label>
                <select 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="None">Most Relevant</option>
                  <option value="PriceLowHigh">Price: Low to High</option>
                  <option value="PriceHighLow">Price: High to Low</option>
                </select>
              </div>

              {/* Quick Reset */}
              {(selectedCategory !== 'All' || selectedDomain !== 'All' || modeFilter !== 'Any' || paymentFilter !== 'Any' || searchQuery || showSavedOnly) && (
                <button
                  onClick={handleClearFilters}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {showSavedOnly ? (
                  <>
                    <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                    <span>My Saved Bookmarks</span>
                  </>
                ) : (
                  <span>Available Opportunities</span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
                  {filteredOpportunities.length}
                </span>
              </h2>

              {showSavedOnly && (
                <button
                  onClick={() => setShowSavedOnly(false)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  ← Back to all opportunities
                </button>
              )}
            </div>

            {filteredOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOpportunities.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            ) : showSavedOnly ? (
              <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Saved Opportunities Yet</h3>
                <p className="text-zinc-400 max-w-md mx-auto mb-6 text-sm">
                  Click the heart icon on any hackathon, internship, or certification card to save it here for quick access later.
                </p>
                <button 
                  onClick={() => setShowSavedOnly(false)}
                  className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors text-sm"
                >
                  Browse Opportunities
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Search className="w-12 h-12 text-zinc-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No opportunities found</h3>
                <p className="text-zinc-400 max-w-md mx-auto mb-6 text-sm">
                  We couldn't find any opportunities matching your current filters. Try adjusting your search keywords or clearing filters.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
