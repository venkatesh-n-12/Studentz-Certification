'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Check, X, Trash2, Users, UserPlus } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

export default function OwnerDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const user = parsed.user || parsed;
      setCurrentUser(user);
      if (user.role === 'OWNER') {
        fetchData();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [adminsRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/owner/admins`, { headers }),
        fetch(`${API_BASE_URL}/api/owner/admin-requests`, { headers })
      ]);

      const adminsData = await adminsRes.json();
      const requestsData = await requestsRes.json();

      if (adminsData.success) setAdmins(adminsData.data);
      if (requestsData.success) setRequests(requestsData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/api/owner/admin-requests/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleReject = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/api/owner/admin-requests/${id}/reject`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin permanently?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/owner/admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to delete admin');
      }
    } catch(err) {
      alert('Failed to connect to server');
    }
    fetchData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div></div>;

  if (!currentUser || currentUser.role !== 'OWNER') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Owner Dashboard</h1>
          <p className="text-zinc-400">Manage platform administrators and requests.</p>
        </div>

        {/* Pending Requests */}
        <section className="glass-card rounded-3xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <UserPlus className="w-6 h-6 mr-3 text-indigo-400" /> Pending Admin Requests
          </h2>
          
          {requests.length === 0 ? (
            <p className="text-zinc-500">No pending admin requests at this time.</p>
          ) : (
            <div className="grid gap-4">
              {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div>
                    <h3 className="text-white font-medium">{req.name}</h3>
                    <p className="text-sm text-zinc-400">{req.email}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(req.id)} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleReject(req.id)} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Admins */}
        <section className="glass-card rounded-3xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Users className="w-6 h-6 mr-3 text-indigo-400" /> Active Administrators
          </h2>
          
          {admins.length === 0 ? (
            <p className="text-zinc-500">No active administrators.</p>
          ) : (
            <div className="grid gap-4">
              {admins.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div>
                    <h3 className="text-white font-medium">{admin.name}</h3>
                    <p className="text-sm text-zinc-400">{admin.email}</p>
                  </div>
                  <button onClick={() => handleDelete(admin.id)} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
