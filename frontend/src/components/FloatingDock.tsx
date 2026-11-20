'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, User } from 'lucide-react';

interface DockItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DOCK_ITEMS: DockItem[] = [
  { name: 'Reels Gallery', href: '/dashboard', icon: LayoutGrid },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Profile', href: '/settings', icon: User },
];

export const FloatingDock: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <nav className="bg-white border-4 border-black rounded-full px-5 py-2.5 shadow-brutal flex items-center gap-4 sm:gap-6">
        {DOCK_ITEMS.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.name}>
              {index === 2 && (
                <div className="w-[3px] h-7 bg-black/20 rounded-full mx-1 hidden sm:block" />
              )}
              <Link
                href={item.href}
                className={`group relative p-2.5 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-brand-yellow text-black border-2 border-black shadow-brutal-sm -translate-y-0.5'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100'
                }`}
                aria-label={item.name}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />

                {/* Neobrutalist Hover Tooltip */}
                <span className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white font-display font-bold text-[11px] px-3 py-1 rounded-full border border-black shadow-brutal-sm pointer-events-none whitespace-nowrap uppercase tracking-wider">
                  {item.name}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full" />
                )}
              </Link>
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
};
