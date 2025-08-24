import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const orderId = searchParams.get('orderId');

    if (!email || !orderId) {
      return NextResponse.json(
        { error: 'Email và mã đơn hàng là bắt buộc' },
        { status: 400 }
      );
    }

    // Gọi API admin-core để lấy thông tin đơn hàng mới nhất
    try {
      const response = await fetch('http://localhost:3001/api/orders/customer/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error || 'Không tìm thấy đơn hàng' },
          { status: response.status }
        );
      }

      const orderData = await response.json();
      
      return NextResponse.json({
        order: orderData
      });

    } catch (fetchError) {
      console.error('Error fetching from admin-core:', fetchError);
      return NextResponse.json(
        { error: 'Không thể kết nối với hệ thống, vui lòng thử lại sau' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json(
      { error: 'Lỗi server, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
} 