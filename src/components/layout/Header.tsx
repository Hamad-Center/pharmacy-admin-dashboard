'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user } = useAuth();

  const getInitials = () => {
    if (!user?.name) return 'AD';
    const names = user.name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-xl border-gray-200/50 flex items-center justify-between px-6 shadow-sm sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search tenants, users, or activities..."
            className="pl-10 w-full bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-300 transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {user?.name || 'Admin User'}
            </p>
            <div className="flex items-center gap-2 justify-end">
              <Badge variant="secondary" className="text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">
                Super Admin
              </Badge>
            </div>
          </div>

          <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-blue-500/20 cursor-pointer hover:ring-blue-500/40 transition-all">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
