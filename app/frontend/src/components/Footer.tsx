import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-100 py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-slate-900">
            <Sparkles className="h-4 w-4 text-primary-500" />
            Standor
          </Link>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Standor — The Standard for Technical Interviews
          </p>
          <div className="flex gap-4 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
