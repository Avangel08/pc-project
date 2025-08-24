import React, { useState } from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import { SalesSidebar } from '../components/SalesSidebar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface Order {
  id: string;
  customer: string;
  total: string;
  status: string;
  phone: string;
  address: string;
  orderDate: string;
  paymentMethod: string;
  items: {
    name: string;
    qty: number;
    price: string;
  }[];
}

const ordersData: Order[] = [
  {
    id: "ORD001",
    customer: "Nguyễn Văn A",
    total: "15.000.000đ",
    status: "Chờ xác nhận",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    orderDate: "20/03/2024",
    paymentMethod: "Chuyển khoản",
    items: [
      { name: "PC Gaming Pro", qty: 1, price: "15.000.000đ" }
    ]
  },
  {
    id: "ORD002", 
    customer: "Trần Thị B",
    total: "25.000.000đ",
    status: "Đang xử lý",
    phone: "0987654321",
    address: "456 Đường XYZ, Quận 2, TP.HCM",
    orderDate: "19/03/2024",
    paymentMethod: "Tiền mặt",
    items: [
      { name: "PC Workstation", qty: 1, price: "25.000.000đ" }
    ]
  },
  {
    id: "ORD003",
    customer: "Lê Văn C",
    total: "18.500.000đ",
    status: "Hoàn thành",
    phone: "0369852147",
    address: "789 Đường DEF, Quận 3, TP.HCM",
    orderDate: "18/03/2024",
    paymentMethod: "Chuyển khoản",
    items: [
      { name: "PC Gaming Standard", qty: 1, price: "18.500.000đ" }
    ]
  }
];

const statusList = ['Tất cả', 'Đang xử lý', 'Đã xác nhận', 'Hoàn thành'];

const SalesOrders = () => {
  const [filter, setFilter] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredOrders = ordersData.filter(order =>
    (filter === 'Tất cả' || order.status === filter) &&
    (order.customer.toLowerCase().includes(search.toLowerCase()) || order.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gaming-dark">
        <SalesSidebar />
        <main className="flex-1 overflow-y-auto p-0 ml-10">
          <div className="w-full px-0 space-y-8">
            <h1 className="text-3xl font-orbitron font-bold text-gradient mb-8 text-left pl-8 pt-8">Quản lý đơn hàng</h1>
            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 w-full px-8">
              <div className="flex gap-2">
                {statusList.map(st => (
                  <Button key={st} size="sm" variant={filter === st ? 'default' : 'outline'} className={filter === st ? 'bg-gaming-cyan text-white' : 'border-gaming-cyan/40 text-gaming-cyan text-base px-6 py-2'} onClick={() => setFilter(st)}>{st}</Button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã đơn..."
                className="px-4 py-2 rounded bg-gaming-darker border border-gaming-cyan/20 text-white outline-none text-base w-full md:w-72"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex justify-center w-full">
              <Card className="w-full max-w-6xl bg-gaming-darker/80 border-gaming-cyan/40 p-0 shadow-2xl overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead>
                    <tr className="text-gaming-cyan bg-gaming-darker/90 border-b border-gaming-cyan/30">
                      <th className="py-3 px-8 font-bold">Mã đơn</th>
                      <th className="py-3 px-8 font-bold">Khách hàng</th>
                      <th className="py-3 px-8 font-bold">Tổng tiền</th>
                      <th className="py-3 px-8 font-bold">Ngày đặt</th>
                      <th className="py-3 px-8 font-bold">Thanh toán</th>
                      <th className="py-3 px-8 font-bold">Trạng thái</th>
                      <th className="py-3 px-8 font-bold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="border-b border-gaming-cyan/10 hover:bg-gaming-cyan/10 transition-all">
                        <td className="py-3 px-8 font-bold text-white">{order.id}</td>
                        <td className="py-3 px-8 text-gray-200">{order.customer}</td>
                        <td className="py-3 px-8 text-gray-200">{order.total}</td>
                        <td className="py-3 px-8 text-gray-200">{order.orderDate}</td>
                        <td className="py-3 px-8 text-gray-200">{order.paymentMethod}</td>
                        <td className="py-3 px-8 text-gray-200">{order.status}</td>
                        <td className="py-3 px-8">
                          <Button size="sm" variant="outline" className="border-gaming-cyan/40 text-gaming-cyan font-bold px-6 py-2 text-base" onClick={() => { setSelectedOrder(order); setShowModal(true); }}>Chi tiết</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
            {/* Modal chi tiết đơn hàng */}
            {showModal && selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-gaming-darker rounded-xl p-8 w-full max-w-lg border border-gaming-cyan/30 relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowModal(false)}>&times;</button>
                  <h2 className="text-xl font-bold text-gaming-cyan mb-4">Chi tiết đơn hàng {selectedOrder.id}</h2>
                  <div className="mb-2 text-white">Khách hàng: <span className="font-medium">{selectedOrder.customer}</span></div>
                  <div className="mb-2 text-white">SĐT: <span className="font-medium">{selectedOrder.phone}</span></div>
                  <div className="mb-2 text-white">Địa chỉ: <span className="font-medium">{selectedOrder.address}</span></div>
                  <div className="mb-2 text-white">Tổng tiền: <span className="font-medium">{selectedOrder.total}</span></div>
                  <div className="mb-2 text-white">Trạng thái: <span className="font-medium">{selectedOrder.status}</span></div>
                  <div className="mb-4">
                    <div className="text-gaming-cyan font-medium mb-1">Sản phẩm:</div>
                    <ul className="list-disc pl-5 text-white">
                      {selectedOrder.items.map((item, idx) => (
                        <li key={idx}>{item.name} x{item.qty} - {item.price}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    {statusList.filter(st => st !== 'Tất cả').map(st => (
                      <Button key={st} size="sm" variant={selectedOrder.status === st ? 'default' : 'outline'} className={selectedOrder.status === st ? 'bg-gaming-cyan text-white' : 'border-gaming-cyan/40 text-gaming-cyan'} onClick={() => { setSelectedOrder({ ...selectedOrder, status: st }); }}>{st}</Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SalesOrders; 