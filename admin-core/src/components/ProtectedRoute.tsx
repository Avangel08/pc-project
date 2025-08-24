
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-orbitron font-bold text-gradient mb-4">
              Arena PC
            </h1>
            <p className="text-gray-400 mb-6">
              Vui lòng đăng nhập để truy cập hệ thống quản trị
            </p>
            <Button
              onClick={() => setShowLoginModal(true)}
              className="bg-gradient-to-r from-gaming-cyan to-gaming-purple hover:from-gaming-cyan/80 hover:to-gaming-purple/80"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Đăng nhập
            </Button>
          </div>
        </div>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </>
    );
  }

  return <>{children}</>;
};
