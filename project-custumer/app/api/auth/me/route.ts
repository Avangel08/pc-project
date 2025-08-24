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
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Tài khoản đã bị khóa' },
        { status: 403 }
      );
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Lỗi server, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
} 