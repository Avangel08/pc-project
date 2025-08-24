const { MongoClient } = require('mongodb');

// Kết nối MongoDB
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function cleanupData() {
  try {
    await client.connect();
    console.log('Đã kết nối MongoDB');
    
    const db = client.db('pc-shop');
    const productsCollection = db.collection('products');
    
    console.log('\n=== BẮT ĐẦU DỌN DỮ LIỆU ===\n');
    
    // 1. Đếm tổng số sản phẩm
    const totalProducts = await productsCollection.countDocuments();
    console.log(`Tổng số sản phẩm: ${totalProducts}`);
    
    // 2. Tìm các sản phẩm có productCode trùng lặp hoặc có khoảng trắng
    const allProducts = await productsCollection.find({}).toArray();
    
    // Tìm sản phẩm có productCode với khoảng trắng
    const productsWithSpaces = allProducts.filter(p => 
      p.productCode && p.productCode.includes(' ')
    );
    
    console.log(`\nSản phẩm có productCode chứa khoảng trắng: ${productsWithSpaces.length}`);
    productsWithSpaces.forEach(p => {
      console.log(`- "${p.productCode}" (ID: ${p.id || p._id})`);
    });
    
    // 3. Tìm sản phẩm trùng lặp theo productCode (bỏ qua khoảng trắng)
    const productCodeMap = {};
    allProducts.forEach(p => {
      if (p.productCode) {
        const cleanCode = p.productCode.trim().toLowerCase();
        if (!productCodeMap[cleanCode]) {
          productCodeMap[cleanCode] = [];
        }
        productCodeMap[cleanCode].push(p);
      }
    });
    
    const duplicates = Object.entries(productCodeMap).filter(([code, products]) => products.length > 1);
    
    console.log(`\nSản phẩm trùng lặp theo productCode: ${duplicates.length} nhóm`);
    duplicates.forEach(([code, products]) => {
      console.log(`\nProductCode "${code}":`);
      products.forEach(p => {
        console.log(`  - "${p.productCode}" (ID: ${p.id || p._id}, Stock: ${p.stock || 0})`);
      });
    });
    
    // 4. Tìm sản phẩm thiếu dữ liệu bắt buộc
    const invalidProducts = allProducts.filter(p => 
      !p.name || !p.productCode || typeof p.stock !== 'number'
    );
    
    console.log(`\nSản phẩm thiếu dữ liệu bắt buộc: ${invalidProducts.length}`);
    invalidProducts.forEach(p => {
      console.log(`- ID: ${p.id || p._id}`);
      console.log(`  Name: ${p.name || 'THIẾU'}`);
      console.log(`  ProductCode: ${p.productCode || 'THIẾU'}`);
      console.log(`  Stock: ${p.stock || 'THIẾU'}`);
    });
    
    // 5. Hướng dẫn xóa thủ công
    console.log('\n=== HƯỚNG DẪN XÓA THỦ CÔNG ===');
    console.log('Để xóa sản phẩm trùng lặp, sử dụng lệnh sau trong mongosh:');
    
    if (duplicates.length > 0) {
      duplicates.forEach(([code, products]) => {
        // Giữ lại sản phẩm đầu tiên, xóa các sản phẩm còn lại
        const toDelete = products.slice(1);
        toDelete.forEach(p => {
          console.log(`db.products.deleteOne({ "_id": ObjectId("${p._id}") });`);
        });
      });
    }
    
    // 6. Sửa lỗi dữ liệu
    console.log('\n=== SỬA LỖI DỮ LIỆU ===');
    
    // Sửa productCode có khoảng trắng
    for (const product of productsWithSpaces) {
      const cleanCode = product.productCode.trim();
      console.log(`Sửa productCode: "${product.productCode}" -> "${cleanCode}"`);
      await productsCollection.updateOne(
        { _id: product._id },
        { $set: { productCode: cleanCode } }
      );
    }
    
    // Sửa stock null/undefined thành 0
    const nullStockProducts = allProducts.filter(p => p.stock === null || p.stock === undefined);
    if (nullStockProducts.length > 0) {
      console.log(`\nSửa ${nullStockProducts.length} sản phẩm có stock null/undefined thành 0`);
      await productsCollection.updateMany(
        { stock: { $in: [null, undefined] } },
        { $set: { stock: 0 } }
      );
    }
    
    // 7. Thống kê sau khi dọn dữ liệu
    console.log('\n=== THỐNG KÊ SAU KHI DỌN DỮ LIỆU ===');
    const finalCount = await productsCollection.countDocuments();
    console.log(`Tổng số sản phẩm sau khi dọn: ${finalCount}`);
    
    const validProducts = await productsCollection.find({
      name: { $exists: true, $ne: null },
      productCode: { $exists: true, $ne: null },
      stock: { $exists: true, $type: 'number' }
    }).count();
    console.log(`Sản phẩm hợp lệ: ${validProducts}`);
    
    console.log('\n=== HOÀN THÀNH DỌN DỮ LIỆU ===');
    
  } catch (error) {
    console.error('Lỗi khi dọn dữ liệu:', error);
  } finally {
    await client.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

// Chạy script
cleanupData().catch(console.error); 