const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function fixMissingProductIds() {
  try {
    await client.connect();
    console.log('Đã kết nối MongoDB');
    const db = client.db('pc-shop');
    const products = db.collection('products');

    // Tìm sản phẩm thiếu id hoặc id rỗng/null
    const missingIdProducts = await products.find({ $or: [ { id: { $exists: false } }, { id: '' }, { id: null } ] }).toArray();
    console.log(`Tìm thấy ${missingIdProducts.length} sản phẩm thiếu id hoặc id rỗng.`);

    for (const product of missingIdProducts) {
      const newId = 'PROD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await products.updateOne(
        { _id: product._id },
        { $set: { id: newId } }
      );
      console.log(`Đã cập nhật id cho sản phẩm _id=${product._id} => id=${newId}`);
    }

    console.log('Hoàn thành cập nhật id cho tất cả sản phẩm bị thiếu.');
  } catch (error) {
    console.error('Lỗi khi cập nhật id:', error);
  } finally {
    await client.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

fixMissingProductIds().catch(console.error); 