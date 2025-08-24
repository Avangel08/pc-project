import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Thiếu email' }, { status: 400 });
    }
    const usersPath = path.join(process.cwd(), 'users.json');
    let users = [];
    try {
      const usersData = await fs.readFile(usersPath, 'utf-8');
      users = JSON.parse(usersData);
    } catch {
      users = [];
    }
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'Email không tồn tại' }, { status: 404 });
    }
    // Sinh OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpsPath = path.join(process.cwd(), 'reset-otps.json');
    let otps = [];
    try {
      const otpsData = await fs.readFile(otpsPath, 'utf-8');
      otps = JSON.parse(otpsData);
    } catch {
      otps = [];
    }
    // Lưu OTP với email và timestamp
    otps = otps.filter((o: any) => o.email !== email); // Xóa OTP cũ nếu có
    otps.push({ email, otp, createdAt: Date.now() });
    await fs.writeFile(otpsPath, JSON.stringify(otps, null, 2));
    // Trả về OTP (dev mode)
    return NextResponse.json({ success: true, otp });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
} 