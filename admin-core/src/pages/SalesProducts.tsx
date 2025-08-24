import React from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import { SalesSidebar } from '../components/SalesSidebar';
import { Card } from '../components/ui/card';

const products = [
  { id: 'SP001', name: 'Chuột Gaming XYZ', price: '1,200,000đ', stock: 10 },
  { id: 'SP002', name: 'Bàn phím Cơ ABC', price: '2,000,000đ', stock: 5 },
  { id: 'SP003', name: 'Tai nghe Gaming DEF', price: '900,000đ', stock: 15 },
];

const SalesProducts = () => (
  <SidebarProvider>
    <div className="flex h-screen bg-gaming-dark">
      <SalesSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-2xl font-orbitron font-bold text-gradient mb-6">Quản lý sản phẩm</h1>
          <Card className="bg-gaming-darker/50 border-gaming-cyan/20 p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gaming-cyan">
                  <th>Mã SP</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {products.map(prod => (
                  <tr key={prod.id} className="border-b border-gaming-cyan/10 hover:bg-gaming-cyan/5">
                    <td className="py-2 font-medium text-white">{prod.id}</td>
                    <td className="py-2 text-gray-300">{prod.name}</td>
                    <td className="py-2 text-gray-300">{prod.price}</td>
                    <td className="py-2 text-gray-300">{prod.stock}</td>
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

export default SalesProducts; 