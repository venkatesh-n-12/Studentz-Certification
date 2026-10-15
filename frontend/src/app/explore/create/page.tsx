'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { PlusCircle, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

export default function CreateEventPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    category: 'Hackathons',
    subCategory: '',
    description: '',
    requirements: '',
    benefits: '',
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    duration: '',
    mode: 'Online',
    location: '',
    registrationUrl: '',
    price: 0,
    paymentType: 'Free',
    certificateAvailable: false,
    spots: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const user = parsed.user || parsed;
      setCurrentUser(user);
      if (user.role === 'OWNER' || user.role === 'ADMIN') {
        setLoading(false);
      } else {
        notFound();
      }
    } else {
      notFound();
    }
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        price: Number(formData.price),
        spots: formData.spots ? Number(formData.spots) : undefined,
        requirements: formData.requirements.split(',').map(s => s.trim()).filter(Boolean),
        benefits: formData.benefits.split(',').map(s => s.trim()).filter(Boolean),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
      };

      const res = await fetch(`${API_BASE_URL}/api/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert('Event created successfully!');
        router.push(`/explore/${data.data.id}`);
      } else {
        alert(data.message || 'Failed to create event');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div></div>;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <PlusCircle className="w-8 h-8 mr-3 text-indigo-400" /> Create New Event
          </h1>
          <p className="text-zinc-400">Post a new opportunity, hackathon, or certification to the platform.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Event Title *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="e.g. Google Cloud Certification" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Organization *</label>
              <input required type="text" name="organization" value={formData.organization} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="e.g. Google" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all">
                <option value="Hackathons">Hackathon</option>
                <option value="Internships">Internship</option>
                <option value="Certifications">Certification</option>
                <option value="Workstations">Workstation</option>
                <option value="Other Programs">Other Program</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Mode *</label>
              <select name="mode" value={formData.mode} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all">
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description *</label>
            <textarea required rows={4} name="description" value={formData.description} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Describe the event..."></textarea>
          </div>

          <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <label className="block text-sm font-bold text-indigo-400 mb-2 flex items-center">
              <LinkIcon className="w-4 h-4 mr-2" /> Registration / External URL
            </label>
            <p className="text-xs text-zinc-400 mb-3">If you provide a URL here, the "Apply Now" button will instantly redirect students to this website instead of handling applications locally.</p>
            <input type="url" name="registrationUrl" value={formData.registrationUrl} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="https://example.com/apply" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Requirements (comma separated) *</label>
              <textarea required rows={2} name="requirements" value={formData.requirements} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="18+ years, College Student..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Benefits (comma separated) *</label>
              <textarea required rows={2} name="benefits" value={formData.benefits} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Certificate, Swag, Prize Pool..."></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Start Date *</label>
              <input required type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">End Date</label>
              <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Apply Deadline *</label>
              <input required type="datetime-local" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
          </div>

          <div className="flex items-center p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 mt-6">
            <input type="checkbox" id="certificateAvailable" name="certificateAvailable" checked={formData.certificateAvailable} onChange={handleChange} className="w-5 h-5 rounded border-zinc-600 text-indigo-500 focus:ring-indigo-500 bg-zinc-900" />
            <label htmlFor="certificateAvailable" className="ml-3 text-sm font-medium text-white flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" /> Certificate provided upon completion
            </label>
          </div>

          <div className="pt-6 border-t border-white/10">
            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center disabled:opacity-70 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              {isSubmitting ? 'Creating Event...' : 'Launch Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
