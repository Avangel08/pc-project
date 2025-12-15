import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Search, 
  User,
  LogOut,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const AdminHeader = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn lần sau!",
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-gaming-red text-white">Admin</Badge>;
      case 'sales':
        return <Badge className="bg-gaming-cyan text-black">Sales</Badge>;
      case 'warehouse':
        return <Badge className="bg-gaming-purple text-white">Warehouse</Badge>;
      case 'support':
        return <Badge className="bg-gaming-green text-black">Support</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  return (
    <header className="bg-gaming-darker border-b border-gaming-cyan/20 px-6 py-4">
      <div className="flex items-center justify-end">
        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gaming-cyan relative">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-gaming-red text-white text-xs">
              3
            </Badge>
          </Button>
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 text-white hover:bg-gaming-cyan/20">
                <div className="w-8 h-8 bg-gradient-to-br from-gaming-cyan to-gaming-purple rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <div className="flex items-center space-x-2">
                    {user?.role && getRoleBadge(user.role)}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gaming-dark border-gaming-cyan/20">
              <DropdownMenuLabel className="text-white">
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gaming-cyan/20" />
              <DropdownMenuItem className="text-gray-300 focus:bg-gaming-cyan/20 focus:text-white">
                <User className="mr-2 h-4 w-4" />
                Thông tin cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 focus:bg-gaming-cyan/20 focus:text-white">
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt tài khoản
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gaming-cyan/20" />
              <DropdownMenuItem 
                className="text-gaming-red focus:bg-gaming-red/20 focus:text-gaming-red"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
