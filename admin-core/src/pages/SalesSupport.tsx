import React from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import { SalesSidebar } from '../components/SalesSidebar';
import { Card } from '../components/ui/card';

const supports = [
  { id: 'SR001', customer: 'Phạm Thị D', issue: 'Hỏi về bảo hành', status: 'Chờ xử lý' },
  { id: 'SR002', customer: 'Hoàng Văn E', issue: 'Yêu cầu đổi trả', status: 'Đang xử lý' },
];

const SalesSupport = () => (
  <SidebarProvider>
    <div className="flex h-screen bg-gaming-dark">
      <SalesSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-2xl font-orbitron font-bold text-gradient mb-6">Hỗ trợ khách hàng</h1>
          <Card className="bg-gaming-darker/50 border-gaming-cyan/20 p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gaming-cyan">
                  <th>Mã yêu cầu</th>
                  <th>Khách hàng</th>
                  <th>Vấn đề</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {supports.map(sup => (
                  <tr key={sup.id} className="border-b border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                    <td className="py-2 font-medium text-white">{sup.id}</td>
                    <td className="py-2 text-gray-300">{sup.customer}</td>
                    <td className="py-2 text-gray-300">{sup.issue}</td>
                    <td className="py-2 text-gray-300">{sup.status}</td>
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

export default SalesSupport; 