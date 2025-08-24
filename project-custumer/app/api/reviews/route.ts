import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const reviewsFilePath = path.join(process.cwd(), 'reviews.json');
const ADMIN_API_URL = 'http://localhost:3001/api/reviews';

// Đảm bảo file reviews.json tồn tại
function ensureReviewsFile() {
  if (!fs.existsSync(reviewsFilePath)) {
    fs.writeFileSync(reviewsFilePath, JSON.stringify([], null, 2));
  }
}

// Đọc tất cả đánh giá
function readReviews() {
  ensureReviewsFile();
  const data = fs.readFileSync(reviewsFilePath, 'utf-8');
  return JSON.parse(data);
}

// Ghi đánh giá vào file
function writeReviews(reviews: any[]) {
  fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
}

// Đồng bộ với MongoDB của admin app
async function syncToAdminApp(review: any) {
  try {
    const response = await fetch(ADMIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    });
    
    if (!response.ok) {
      console.error('Failed to sync to admin app:', response.statusText);
    }
  } catch (error) {
    console.error('Error syncing to admin app:', error);
  }
}

// GET - Lấy đánh giá theo productId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Thử lấy từ admin app trước, nếu không được thì dùng file JSON
    try {
      const adminResponse = await fetch(`${ADMIN_API_URL}?productId=${productId}`);
      if (adminResponse.ok) {
        const adminReviews = await adminResponse.json();
        const approvedReviews = adminReviews.filter((review: any) => review.status === 'approved');       return NextResponse.json(approvedReviews);
      }
    } catch (error) {
      console.log('Admin app not available, using local JSON file');
    }

    // Fallback: dùng file JSON local
    const reviews = readReviews();
    const productReviews = reviews.filter((review: any) => 
      review.productId === productId && review.status === 'approved'
    );

    return NextResponse.json(productReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Tạo đánh giá mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, customerId, customerName, customerEmail, rating, comment } = body;

    // Validate required fields
    if (!productId || !customerId || !customerName || !customerEmail || !rating || !comment) {
      return NextResponse.json({ 
        error: 'Missing required fields: productId, customerId, customerName, customerEmail, rating, comment' 
      }, { status: 400 });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const reviews = readReviews();
    
    // Tạo đánh giá mới
    const newReview = {
      id: `REV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      customerId,
      customerName,
      customerEmail,
      rating: Number(rating),
      comment: comment.trim(),
      date: new Date().toISOString(),
      status: 'pending', // Mặc định là chờ duyệt
      helpful: 0,
      reported: false,
      reportReason: null
    };

    // Lưu vào file JSON local
    reviews.push(newReview);
    writeReviews(reviews);

    // Đồng bộ với MongoDB của admin app
    await syncToAdminApp(newReview);

    return NextResponse.json({ 
      message: 'Review submitted successfully', 
      review: newReview 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 