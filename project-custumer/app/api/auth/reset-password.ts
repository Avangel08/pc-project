import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, password } = await request.json();
    if (!email || !otp || !password) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }
    const otpsPath = path.join(process.cwd(), 'reset-otps.json');
    let otps = [];
    try {
      const otpsData = await fs.readFile(otpsPath, 'utf-8');
      otps = JSON.parse(otpsData);
    } catch {
      otps = [];
    }
    const otpEntry = otps.find((o: any) => o.email === email && o.otp === otp);
    if (!otpEntry) {
      return NextResponse.json({ error: 'OTP không hợp lệ' }, { status: 400 });
    }
    // Kiểm tra hạn OTP (5 phút)
    if (Date.now() - otpEntry.createdAt > 5 * 60 * 1000) {
      return NextResponse.json({ error: 'OTP đã hết hạn' }, { status: 400 });
    }
    // Hash password mới
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Cập nhật users.json
    const usersPath = path.join(process.cwd(), 'users.json');
    let users = [];
    try {
      const usersData = await fs.readFile(usersPath, 'utf-8');
      users = JSON.parse(usersData);
    } catch {
      users = [];
    }
    let updated = false;
    users = users.map((u: any) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        updated = true;
        return { ...u, password: hashedPassword, updatedAt: new Date().toISOString() };
      }
      return u;
    });
    if (!updated) {
      return NextResponse.json({ error: 'Không tìm thấy user' }, { status: 404 });
    }
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
    // Xóa OTP đã dùng
    otps = otps.filter((o: any) => !(o.email === email && o.otp === otp));
    await fs.writeFile(otpsPath, JSON.stringify(otps, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
} 