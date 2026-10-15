import { Opportunity } from '@/types';

const STORAGE_KEY = 'studentzcert_saved_opps';
const EVENT_KEY = 'studentzcert_bookmarks_changed';

// Get array of saved opportunities from localStorage
export function getSavedOpportunities(): Opportunity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading saved opportunities:', e);
    return [];
  }
}

// Get array of IDs
export function getSavedIds(): string[] {
  return getSavedOpportunities().map(o => o.id);
}

// Check if a specific ID is saved
export function isOpportunitySaved(id: string): boolean {
  if (typeof window === 'undefined') return false;
  const ids = getSavedIds();
  return ids.includes(id);
}

// Save or unsave an opportunity (works offline + syncs with backend if user is logged in)
export async function toggleOpportunitySave(opp: Opportunity): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const current = getSavedOpportunities();
  const exists = current.some(item => item.id === opp.id);
  let updated: Opportunity[];
  let newState: boolean;

  if (exists) {
    updated = current.filter(item => item.id !== opp.id);
    newState = false;
  } else {
    updated = [opp, ...current];
    newState = true;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { opportunityId: opp.id, isSaved: newState } }));

  // Background sync with backend if token exists
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const url = `http://localhost:5000/api/opportunities/${opp.id}/save`;
      await fetch(url, {
        method: newState ? 'POST' : 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (err) {
    // Non-critical background sync error, local state remains persisted
    console.warn('Backend bookmark sync note:', err);
  }

  return newState;
}

// Sync saved items with backend on login
export async function syncSavedWithBackend(): Promise<void> {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('http://localhost:5000/api/users/me/saved', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      const backendSaved = data.data.map((item: any) => item.opportunity).filter(Boolean);
      const localSaved = getSavedOpportunities();
      
      // Merge unique
      const map = new Map<string, Opportunity>();
      backendSaved.forEach((o: Opportunity) => map.set(o.id, o));
      localSaved.forEach((o: Opportunity) => map.set(o.id, o));

      const merged = Array.from(map.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent(EVENT_KEY));
    }
  } catch (err) {
    console.warn('Sync with backend error:', err);
  }
}

// Hook-like event subscriber for components
export function subscribeToBookmarks(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_KEY, callback);
  return () => window.removeEventListener(EVENT_KEY, callback);
}
