import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Order {
  id: string;
  userId?: number;
  isGuest: boolean;
  guestEmail?: string;
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    province: string;
    district: string;
    address: string;
    note?: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Thiếu orderId hoặc status' },
        { status: 400 }
      );
    }

    // Read orders from file
    const ordersPath = path.join(process.cwd(), 'orders.json');
    let orders: Order[] = [];
    
    try {
      const ordersData = await fs.readFile(ordersPath, 'utf-8');
      orders = JSON.parse(ordersData);
    } catch (error) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Find and update order
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Update order status
    orders[orderIndex].status = status;

    // Save to file
    await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      order: orders[orderIndex]
    });

  } catch (error) {
    console.error('Sync order status error:', error);
    return NextResponse.json(
      { error: 'Lỗi server, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
} 