import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids');
  if (!idsParam) return NextResponse.json({ products: [] });
  // Proxy sang backend
  const backendUrl = `http://localhost:3001/api/products/by-ids?ids=${idsParam}`;
  const res = await fetch(backendUrl);
  const products = await res.json();
  return NextResponse.json({ products });
} 