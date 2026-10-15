'use client';

import { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="glass-card rounded-3xl p-10 max-w-md text-center border-rose-500/20">
        <AlertOctagon className="w-16 h-16 text-rose-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-zinc-400 mb-8">
          We couldn't load this page. Please try again or return home.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-zinc-800 text-white font-semibold rounded-full hover:bg-zinc-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
