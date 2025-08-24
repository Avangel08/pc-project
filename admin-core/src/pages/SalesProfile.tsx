import React from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import { SalesSidebar } from '../components/SalesSidebar';
import { Card } from '../components/ui/card';

const profile = {
  name: 'Sales User',
  email: 'sales@arena-pc.vn',
  role: 'Nhân viên bán hàng',
};

const SalesProfile = () => (
  <SidebarProvider>
    <div className="flex h-screen bg-gaming-dark">
      <SalesSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-xl mx-auto space-y-8">
          <h1 className="text-2xl font-orbitron font-bold text-gradient mb-6">Tài khoản của tôi</h1>
          <Card className="bg-gaming-darker/50 border-gaming-cyan/20 p-6 space-y-4">
            <div>
              <span className="text-gray-400">Họ tên:</span>
              <span className="ml-2 text-white font-medium">{profile.name}</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="ml-2 text-white font-medium">{profile.email}</span>
            </div>
            <div>
              <span className="text-gray-400">Chức vụ:</span>
              <span className="ml-2 text-white font-medium">{profile.role}</span>
            </div>
          </Card>
        </div>
      </main>
    </div>
  </SidebarProvider>
);

export default SalesProfile; 