const { MongoClient } = require('mongodb');

// Kết nối MongoDB
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function deleteDuplicates() {
  try {
    await client.connect();
    console.log('Đã kết nối MongoDB');
    
    const db = client.db('pc-shop');
    const productsCollection = db.collection('products');
    
    console.log('\n=== XÓA SẢN PHẨM TRÙNG LẶP ===\n');
    
    // Xóa sản phẩm có productCode "xenon6 " (có khoảng trắng)
    console.log('1. Xóa sản phẩm có productCode "xenon6 " (có khoảng trắng)...');
    const result1 = await productsCollection.deleteOne({ productCode: "xenon6 " });
    console.log(`   Kết quả: ${result1.deletedCount} sản phẩm đã được xóa`);
    
    // Xóa sản phẩm có productCode "Xenon6" (không có khoảng trắng)
    console.log('2. Xóa sản phẩm có productCode "Xenon6" (không có khoảng trắng)...');
    const result2 = await productsCollection.deleteOne({ productCode: "Xenon6" });
    console.log(`   Kết quả: ${result2.deletedCount} sản phẩm đã được xóa`);
    
    // Kiểm tra lại tổng số sản phẩm
    const totalProducts = await productsCollection.countDocuments();
    console.log(`\nTổng số sản phẩm sau khi xóa: ${totalProducts}`);
    
    // Liệt kê tất cả sản phẩm còn lại
    console.log('\nDanh sách sản phẩm còn lại:');
    const remainingProducts = await productsCollection.find({}).toArray();
    remainingProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.productCode}) - Stock: ${product.stock || 0}`);
    });
    
    console.log('\n=== HOÀN THÀNH XÓA SẢN PHẨM TRÙNG LẶP ===');
    
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm trùng lặp:', error);
  } finally {
    await client.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

// Chạy script
deleteDuplicates().catch(console.error); 