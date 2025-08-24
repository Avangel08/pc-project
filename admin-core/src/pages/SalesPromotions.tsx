import React from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import { SalesSidebar } from '../components/SalesSidebar';
import { Card } from '../components/ui/card';

const promotions = [
  { id: 'KM001', name: 'Giảm 10% cho đơn trên 2 triệu', code: 'SALE10', status: 'Đang áp dụng' },
  { id: 'KM002', name: 'Freeship toàn quốc', code: 'FREESHIP', status: 'Sắp diễn ra' },
];

const SalesPromotions = () => (
  <SidebarProvider>
    <div className="flex h-screen bg-gaming-dark">
      <SalesSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-2xl font-orbitron font-bold text-gradient mb-6">Khuyến mãi</h1>
          <Card className="bg-gaming-darker/50 border-gaming-cyan/20 p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gaming-cyan">
                  <th>Mã KM</th>
                  <th>Tên chương trình</th>
                  <th>Mã code</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map(promo => (
                  <tr key={promo.id} className="border-b border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                    <td className="py-2 font-medium text-white">{promo.id}</td>
                    <td className="py-2 text-gray-300">{promo.name}</td>
                    <td className="py-2 text-gray-300">{promo.code}</td>
                    <td className="py-2 text-gray-300">{promo.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </main>
    </div>
  </SidebarProvider>
);

export default SalesPromotions; 