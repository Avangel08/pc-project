import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface Order {
  id: string;
  userId?: number; // Optional for guest users
  isGuest: boolean; // Flag to identify guest orders
  guestEmail?: string; // For guest tracking
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
    const orderData = await request.json();
    
    // Validation
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Giỏ hàng không được để trống' },
        { status: 400 }
      );
    }

    if (!orderData.customer?.name || !orderData.customer?.phone || !orderData.customer?.address) {
      return NextResponse.json(
        { error: 'Thông tin khách hàng không đầy đủ' },
        { status: 400 }
      );
    }

    // Check if user is authenticated (chỉ dùng để lấy userId, không bắt buộc phải có token)
    const token = request.cookies.get('auth-token')?.value;
    let userId: number | undefined;
    let isGuest = true;
    let guestEmail: string | undefined;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
        isGuest = false;
      } catch (error) {
        // Token invalid, treat as guest
        isGuest = true;
      }
    }

    // KHÔNG bắt buộc email cho khách vãng lai nữa
    if (isGuest) {
      guestEmail = orderData.customer.email;
    }

    // Create order object with short ID (12 characters)
    const timestamp = Date.now().toString().slice(-6); // 6 digits
    const randomId = Math.random().toString(36).substr(2, 6); // 6 characters
    const orderId = `DH${timestamp}${randomId}`.toUpperCase(); // 12 characters total
    
    const order: Order = {
      id: orderId,
      userId,
      isGuest,
      guestEmail,
      items: orderData.items,
      subtotal: orderData.subtotal || 0,
      shipping: orderData.shipping || 0,
      total: orderData.total || 0,
      payment: orderData.payment || 'cod',
      customer: orderData.customer,
      status: 'pending',
      date: new Date().toLocaleString('vi-VN'),
      createdAt: new Date().toISOString()
    };

    // Read existing orders
    const ordersPath = path.join(process.cwd(), 'orders.json');
    let orders: Order[] = [];
    
    try {
      const ordersData = await fs.readFile(ordersPath, 'utf-8');
      orders = JSON.parse(ordersData);
    } catch (error) {
      // File doesn't exist, start with empty array
      orders = [];
    }

    // Add new order
    orders.push(order);

    // Save to file
    await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));

    // Send to admin-core API
    try {
      // Ghép địa chỉ giao hàng chuyên nghiệp
      const shippingAddress = [orderData.customer.address, orderData.customer.district, orderData.customer.province]
        .filter(Boolean)
        .join(', ');
      // Khi gửi lên backend:
      const orderToSend = {
        ...orderData,
        shippingAddress,
        // ... các trường khác ...
      };

      const adminResponse = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          orderId: order.id,
          userId: order.userId || null,
          isGuest: order.isGuest,
          guestEmail: order.guestEmail,
          customer: {
            name: order.customer.name,
            phone: order.customer.phone,
            email: order.customer.email,
          },
          shippingAddress: shippingAddress,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          payment: order.payment,
          status: order.status,
          createdAt: order.createdAt,
          promotionCode: orderData.promotionCode || '' // Thêm dòng này để truyền mã giảm giá
        })
      });

      if (!adminResponse.ok) {
        console.error('Failed to sync with admin-core:', await adminResponse.text());
    }
    } catch (error) {
      console.error('Error syncing with admin-core:', error);
    }
    
    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: 'Đặt hàng thành công',
      isGuest: order.isGuest
    }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Lỗi server, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Không tìm thấy token xác thực' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      );
    }

    // Gọi API admin-core để lấy danh sách đơn hàng mới nhất
    try {
      const response = await fetch(`http://localhost:3001/api/orders/customer/${decoded.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    
    if (!response.ok) {
      const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error || 'Không thể lấy danh sách đơn hàng' },
          { status: response.status }
        );
    }

      const data = await response.json();
      return NextResponse.json(data);

    } catch (fetchError) {
      console.error('Error fetching from admin-core:', fetchError);
      return NextResponse.json(
        { error: 'Không thể kết nối với hệ thống, vui lòng thử lại sau' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Lỗi server, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
} 