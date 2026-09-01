import { Bell, Menu, Search } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="relative hidden flex-1 sm:block sm:max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            AS
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-900">Aarav Sharma</p>
            <p className="text-xs text-slate-500">CSE · Final Year</p>
          </div>
        </div>
      </div>
    </header>
  );
}
