import mongoose from 'mongoose';
import { Product } from './src/models/Product.ts';

const MONGO_URI = 'mongodb://localhost:27017/pc-shop';

async function syncStock() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Tìm các sản phẩm có stock = 0 và quantity > 0
  const products = await Product.find({ stock: 0, quantity: { $gt: 0 } });
  if (products.length === 0) {
    console.log('Không có sản phẩm nào cần đồng bộ.');
    process.exit(0);
  }

  for (const prod of products) {
    prod.stock = prod.quantity;
    await prod.save();
    console.log(`Đã cập nhật: ${prod.name} (productCode: ${prod.productCode}) - stock = ${prod.quantity}`);
  }
  console.log(`\nTổng số sản phẩm đã cập nhật: ${products.length}`);
  process.exit(0);
}

syncStock().catch(err => {
  console.error('Lỗi khi đồng bộ stock:', err);
  process.exit(1);
}); 