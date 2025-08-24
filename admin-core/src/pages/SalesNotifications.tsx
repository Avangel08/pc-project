import React from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import { SalesSidebar } from '../components/SalesSidebar';
import { Card } from '../components/ui/card';

const notifications = [
  { id: 'NT001', message: 'Bạn có 2 đơn hàng mới cần xác nhận', time: '10 phút trước' },
  { id: 'NT002', message: 'Chương trình SALE10 đã bắt đầu', time: '1 giờ trước' },
];

const SalesNotifications = () => (
  <SidebarProvider>
    <div className="flex h-screen bg-gaming-dark">
      <SalesSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-2xl font-orbitron font-bold text-gradient mb-6">Thông báo</h1>
          <Card className="bg-gaming-darker/50 border-gaming-cyan/20 p-6">
            <ul className="space-y-4">
              {notifications.map(notif => (
                <li key={notif.id} className="p-4 bg-gaming-darker rounded-lg border border-gaming-cyan/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{notif.message}</span>
                    <span className="text-xs text-gray-400">{notif.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  </SidebarProvider>
);

export default SalesNotifications; 