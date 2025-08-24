import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
  avatar?: string;
  isActive: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, address } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tên, email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 8 ký tự' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Read existing users
    const usersPath = path.join(process.cwd(), 'users.json');
    let users: User[] = [];
    
    try {
      const usersData = await fs.readFile(usersPath, 'utf-8');
      users = JSON.parse(usersData);
    } catch (error) {
      // File doesn't exist, start with empty array
      users = [];
    }

    // Check if email already exists
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: User = {
      id: Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      avatar: '',
      isActive: true
    };

    // Add to users array
    users.push(newUser);

    // Save to file
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

    // Send to admin-core API
    try {
      const adminResponse = await fetch('http://localhost:3001/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          address: newUser.address,
          role: newUser.role,
          createdAt: newUser.createdAt,
          isActive: newUser.isActive
        })
      });

      if (!adminResponse.ok) {
        console.error('Failed to sync with admin-core:', await adminResponse.text());
      }
    } catch (error) {
      console.error('Error syncing with admin-core:', error);
    }

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({
      message: 'Đăng ký thành công',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Lỗi server, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
} 

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Thiếu email' }, { status: 400 });
    }
    const usersPath = path.join(process.cwd(), 'users.json');
    let users: User[] = [];
    try {
      const usersData = await fs.readFile(usersPath, 'utf-8');
      users = JSON.parse(usersData);
    } catch (error) {
      users = [];
    }
    const exists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
    return NextResponse.json({ exists });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
} 