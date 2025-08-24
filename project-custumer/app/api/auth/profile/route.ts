import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
  phone?: string;
  address?: string;
  isDefaultAddress?: boolean;
  avatar?: string;
  isActive: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function PUT(request: NextRequest) {
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

    const { name, phone, address, isDefaultAddress } = await request.json();

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tên không được để trống' },
        { status: 400 }
      );
    }

    // Read users from file
    const usersPath = path.join(process.cwd(), 'users.json');
    let users: User[] = [];
    
    try {
      const usersData = await fs.readFile(usersPath, 'utf-8');
      users = JSON.parse(usersData);
    } catch (error) {
      return NextResponse.json(
        { error: 'Không tìm thấy dữ liệu người dùng' },
        { status: 404 }
      );
    }

    // Find user by ID
    const userIndex = users.findIndex(u => u.id === decoded.userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      name: name.trim(),
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      isDefaultAddress: isDefaultAddress || false,
      updatedAt: new Date().toISOString()
    };

    // Save to file
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

    // Sync with admin-core
    try {
      const adminResponse = await fetch(`http://localhost:3001/api/customers/${users[userIndex].id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: users[userIndex].name,
          phone: users[userIndex].phone,
          address: users[userIndex].address,
          updatedAt: users[userIndex].updatedAt
        })
      });

      if (!adminResponse.ok) {
        console.error('Failed to sync with admin-core:', await adminResponse.text());
      }
    } catch (error) {
      console.error('Error syncing with admin-core:', error);
    }

    // Return updated user data (without password)
    const { password: _, ...userWithoutPassword } = users[userIndex];
    return NextResponse.json({
      message: 'Cập nhật thành công',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Lỗi server, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
} 