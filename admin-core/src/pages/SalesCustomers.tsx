import React from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import { SalesSidebar } from '../components/SalesSidebar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const customers = [
  { id: 'KH001', name: 'Nguyễn Văn A', email: 'a@gmail.com', phone: '0901234567' },
  { id: 'KH002', name: 'Trần Thị B', email: 'b@gmail.com', phone: '0902345678' },
  { id: 'KH003', name: 'Lê Văn C', email: 'c@gmail.com', phone: '0903456789' },
];

const SalesCustomers = () => (
  <SidebarProvider>
    <div className="flex h-screen bg-gaming-dark">
      <SalesSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-2xl font-orbitron font-bold text-gradient mb-6">Quản lý khách hàng</h1>
          <Card className="bg-gaming-darker/50 border-gaming-cyan/20 p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gaming-cyan">
                  <th>Mã KH</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map(cus => (
                  <tr key={cus.id} className="border-b border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                    <td className="py-2 font-medium text-white">{cus.id}</td>
                    <td className="py-2 text-gray-300">{cus.name}</td>
                    <td className="py-2 text-gray-300">{cus.email}</td>
                    <td className="py-2 text-gray-300">{cus.phone}</td>
                    <td className="py-2">
                      <Button size="sm" variant="outline" className="border-gaming-cyan/40 text-gaming-cyan">Chi tiết</Button>
                    </td>
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

export default SalesCustomers; 