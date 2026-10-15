import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
          <SearchX className="w-12 h-12 text-zinc-500" />
        </div>
        <h2 className="text-4xl font-extrabold text-white mb-4">404 - Page Not Found</h2>
        <p className="text-xl text-zinc-400 mb-8 max-w-md mx-auto">
          The page or opportunity you are looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
