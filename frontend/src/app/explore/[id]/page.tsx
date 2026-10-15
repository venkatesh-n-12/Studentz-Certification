'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { 
  Heart, Share2, Calendar, Clock, MapPin, IndianRupee, Award, 
  ChevronRight, Users, CheckCircle, AlertTriangle, X, Edit2, Trash2
} from 'lucide-react';
import { Opportunity } from '@/types';
import Link from 'next/link';
import { mockOpportunities } from '@/data/mockData';
import { isOpportunitySaved, toggleOpportunitySave, subscribeToBookmarks } from '@/utils/bookmarkService';
import { API_BASE_URL } from '@/config/api';

export default function OpportunityDetails({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyState, setApplyState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setIsSaved(isOpportunitySaved(id));
    const unsubscribe = subscribeToBookmarks(() => {
      setIsSaved(isOpportunitySaved(id));
    });
    return unsubscribe;
  }, [id]);

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

    fetch(`${API_BASE_URL}/api/opportunities/${id}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeout);
        if (data && data.success && data.data) {
          const opp = data.data;
          // Map backend dates and parse array fields
          const mapped = {
            ...opp,
            requirements: typeof opp.requirements === 'string' ? JSON.parse(opp.requirements) : opp.requirements,
            benefits: typeof opp.benefits === 'string' ? JSON.parse(opp.benefits) : opp.benefits,
          };
          setOpportunity(mapped);
        } else {
          // Check fallback mock data
          const fallback = mockOpportunities.find(o => o.id === id);
          if (fallback) {
            setOpportunity(fallback);
          } else {
            setFetchError(true);
          }
        }
      })
      .catch(err => {
        clearTimeout(timeout);
        console.error('Failed to fetch opportunity from DB:', err);
        const fallback = mockOpportunities.find(o => o.id === id);
        if (fallback) {
          setOpportunity(fallback);
        } else {
          setFetchError(true);
        }
      });
  }, [id]);

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-zinc-400 text-lg">Could not load event. The server may be unavailable.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' 
    });
  };

  const handleApply = () => {
    if (opportunity.registrationUrl) {
      window.open(opportunity.registrationUrl, '_blank');
      setApplyState('success');
    } else {
      setShowApplyModal(true);
    }
  };

  const confirmApply = () => {
    setApplyState('loading');
    // Simulate API call
    setTimeout(() => {
      setApplyState('success');
      setShowApplyModal(false);
    }, 1500);
  };

  const isDeadlinePassed = new Date(opportunity.applicationDeadline) < new Date();
  
  const canEdit = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'OWNER');

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/opportunities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editFormData.title,
          description: editFormData.description,
          organization: editFormData.organization,
          mode: editFormData.mode
        })
      });
      const data = await res.json();
      if (data.success) {
        setOpportunity({ ...opportunity, ...editFormData });
        setShowEditModal(false);
      } else {
        alert(data.message || 'Failed to update');
      }
    } catch(err) {
      alert('Failed to connect');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Are you sure you want to completely delete this event? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/opportunities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('Event deleted successfully');
        window.location.href = '/explore';
      } else {
        alert(data.message || 'Failed to delete event');
      }
    } catch(err) {
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <div className="border-b border-white/5 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-zinc-500 mb-6">
            <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href={`/explore?category=${opportunity.category}`} className="hover:text-white transition-colors">
              {opportunity.category}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-white/5 text-zinc-300 border-white/10">
                  {opportunity.category}
                </span>
                {opportunity.subCategory && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                    {opportunity.subCategory}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                {opportunity.title}
              </h1>
              <p className="text-xl text-zinc-400 font-medium">{opportunity.organization}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {canEdit && (
                <>
                  <button 
                    onClick={() => {
                      setEditFormData({
                        title: opportunity.title,
                        description: opportunity.description,
                        organization: opportunity.organization,
                        mode: opportunity.mode,
                        registrationUrl: opportunity.registrationUrl || ''
                      });
                      setShowEditModal(true);
                    }}
                    className="flex items-center justify-center px-4 h-12 rounded-full glass-card hover:bg-white/10 transition-colors group text-indigo-400 font-semibold"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </button>
                  <button 
                    onClick={handleDeleteEvent}
                    className="flex items-center justify-center px-4 h-12 rounded-full glass-card hover:bg-rose-500/10 transition-colors group text-rose-500 font-semibold"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
                </>
              )}
              <button 
                onClick={async () => {
                  if (opportunity) {
                    const next = await toggleOpportunitySave(opportunity);
                    setIsSaved(next);
                  }
                }}
                className="flex items-center justify-center w-12 h-12 rounded-full glass-card hover:bg-white/10 transition-colors group"
                title={isSaved ? 'Remove from saved' : 'Save opportunity'}
              >
                <Heart className={`w-5 h-5 transition-colors ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-zinc-300 group-hover:text-white'}`} />
              </button>
              <button className="flex items-center justify-center w-12 h-12 rounded-full glass-card hover:bg-white/10 transition-colors group">
                <Share2 className="w-5 h-5 text-zinc-300 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Main Content */}
        <div className="flex-1 space-y-12 pb-24 lg:pb-0">
          
          {/* Info Grid */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center text-zinc-400 mb-2">
                  <Calendar className="w-4 h-4 mr-2" /> <span className="text-sm font-medium">Dates</span>
                </div>
                <div className="font-semibold text-white">
                  {new Date(opportunity.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(opportunity.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center text-zinc-400 mb-2">
                  <Clock className="w-4 h-4 mr-2" /> <span className="text-sm font-medium">Duration</span>
                </div>
                <div className="font-semibold text-white">{opportunity.duration}</div>
              </div>

              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center text-zinc-400 mb-2">
                  <MapPin className="w-4 h-4 mr-2" /> <span className="text-sm font-medium">Mode</span>
                </div>
                <div className="font-semibold text-white">{opportunity.mode}</div>
              </div>

              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center text-zinc-400 mb-2">
                  <IndianRupee className="w-4 h-4 mr-2" /> <span className="text-sm font-medium">Payment</span>
                </div>
                <div className="font-semibold text-white">{opportunity.paymentType}</div>
              </div>
            </div>
          </section>

          {/* Timeline Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-indigo-400" /> Timeline
            </h2>
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <div className="relative border-l-2 border-zinc-700 ml-4 space-y-8">
                
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-zinc-900 border-2 border-indigo-400"></div>
                  <div className="pl-6">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Start Date</h3>
                    <p className="text-lg font-medium text-white">{formatDate(opportunity.startDate)}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-zinc-900 border-2 border-indigo-400"></div>
                  <div className="pl-6">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">End Date</h3>
                    <p className="text-lg font-medium text-white">{formatDate(opportunity.endDate)}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-zinc-900 border-2 border-rose-500 animate-pulse"></div>
                  <div className="pl-6 bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 -ml-2 -mt-3">
                    <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Application Deadline
                    </h3>
                    <p className="text-lg font-bold text-white">{formatDate(opportunity.applicationDeadline)}</p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* About Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">About</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-zinc-300 leading-relaxed text-lg">{opportunity.description}</p>
            </div>
          </section>

          {/* Requirements Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Requirements & Eligibility</h2>
            <ul className="space-y-3">
              {opportunity.requirements.map((req, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-3 text-emerald-400 shrink-0" />
                  <span className="text-zinc-300 text-lg">{req}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Benefits Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Benefits & Prizes</h2>
            <ul className="space-y-3">
              {opportunity.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3 mt-0.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  </div>
                  <span className="text-zinc-300 text-lg">{benefit}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Certificate Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Award className="w-6 h-6 mr-3 text-amber-400" /> Certificate Information
            </h2>
            <div className="glass-card rounded-xl p-6 border-amber-500/20">
              {opportunity.certificateAvailable ? (
                <p className="text-zinc-300">
                  Yes, a verifiable digital certificate will be provided upon successful completion of this program.
                </p>
              ) : (
                <p className="text-zinc-300">
                  No certificate is provided for this specific opportunity.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar / Sticky Bottom on Mobile */}
        <div className="lg:w-[400px] shrink-0">
          <div className="glass-card rounded-3xl p-6 md:p-8 sticky top-24 border border-white/10 shadow-2xl">
            
            <div className="text-center mb-8 pb-8 border-b border-white/10">
              <h3 className="text-lg font-semibold text-zinc-400 mb-2">Application Deadline</h3>
              <p className="text-2xl font-bold text-rose-400">
                {new Date(opportunity.applicationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>



            {applyState === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Successfully Applied!</h4>
                <p className="text-emerald-400/80 text-sm">We will notify you about the next steps.</p>
              </div>
            ) : (
              <button 
                onClick={handleApply}
                disabled={isDeadlinePassed}
                className={`w-full py-5 rounded-2xl text-lg font-bold transition-all shadow-lg flex justify-center items-center ${
                  isDeadlinePassed 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isDeadlinePassed ? 'Applications Closed' : 'Apply Now'}
              </button>
            )}

            <p className="text-center text-xs text-zinc-500 mt-6">
              By applying, you agree to the platform's terms and conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowApplyModal(false)}></div>
          <div className="relative glass-card bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-4 pr-8">Confirm Application</h3>
            <p className="text-zinc-400 mb-8">
              Are you sure you want to apply for <strong className="text-white">{opportunity.title}</strong> by {opportunity.organization}?
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmApply}
                disabled={applyState === 'loading'}
                className="flex-1 py-3 px-4 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold transition-colors flex justify-center items-center"
              >
                {applyState === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Confirm Application'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative glass-card bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-6 pr-8">Edit Event Details</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={editFormData.title} 
                  onChange={e => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Organization</label>
                <input 
                  type="text" 
                  value={editFormData.organization} 
                  onChange={e => setEditFormData({...editFormData, organization: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Mode (e.g. ONLINE, HYBRID)</label>
                <input 
                  type="text" 
                  value={editFormData.mode} 
                  onChange={e => setEditFormData({...editFormData, mode: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Registration URL (Optional)</label>
                <input 
                  type="url" 
                  value={editFormData.registrationUrl} 
                  onChange={e => setEditFormData({...editFormData, registrationUrl: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white"
                  placeholder="https://example.com/apply"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description</label>
                <textarea 
                  rows={4}
                  value={editFormData.description} 
                  onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white"
                ></textarea>
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors flex justify-center items-center"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
