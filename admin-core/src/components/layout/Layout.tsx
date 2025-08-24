import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, BarChart2, LayoutDashboard } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gaming-dark">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gaming-darker border-r border-gaming-border">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gaming-cyan">Admin Core</h1>
        </div>
        <nav className="px-4 space-y-2">
          <Link to="/">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive('/')
                  ? 'bg-gaming-cyan text-black hover:bg-gaming-cyan/80'
                  : 'text-white hover:bg-gaming-hover'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to="/tickets">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive('/tickets')
                  ? 'bg-gaming-cyan text-black hover:bg-gaming-cyan/80'
                  : 'text-white hover:bg-gaming-hover'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Tickets
            </Button>
          </Link>
          <Link to="/reports">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive('/reports')
                  ? 'bg-gaming-cyan text-black hover:bg-gaming-cyan/80'
                  : 'text-white hover:bg-gaming-hover'
              }`}
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Báo cáo
            </Button>
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}; 