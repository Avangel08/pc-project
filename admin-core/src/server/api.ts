import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import OrderHistory from '../models/OrderHistory';
import StockHistory from '../models/StockHistory.js';

const app = express();
const port = process.env.PORT || 3001;

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/pc-shop')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/products', async (_req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category products' });
  }
});

// Thêm sản phẩm
app.post('/api/products', async (req, res) => {
  try {
    // Tạo ID tự động
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const productId = `PROD_${timestamp}_${randomId}`;
    
    const productData = {
      ...req.body,
      id: productId,
      productCode: req.body.productCode || `PC_${timestamp}_${randomId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Creating product with data:', productData);
    const product = await Product.create(productData);
    console.log('Created product:', product);
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Sửa sản phẩm
app.put('/api/products/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    const product = await Product.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Xóa sản phẩm
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Order APIs
app.get('/api/orders', async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const oldStatus = order.status;
    // Cập nhật trạng thái và các trường khác nếu có
    if (req.body.status) order.status = req.body.status;
    Object.assign(order, req.body, { updatedAt: new Date() });
    await order.save();

    // Nếu có thay đổi trạng thái, lưu lịch sử
    if (req.body.status && req.body.status !== oldStatus) {
      await OrderHistory.create({
        orderId: order.orderId,
        action: 'status_change',
        oldStatus,
        newStatus: req.body.status,
        user: req.body.user || 'Admin',
        timestamp: new Date()
      });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Xóa đơn hàng
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// API: Tạo lịch sử đơn hàng
app.post('/api/order-history', async (req, res) => {
  try {
    const history = new OrderHistory(req.body);
    await history.save();
    res.status(201).json(history);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API: Lấy lịch sử đơn hàng theo orderId
app.get('/api/order-history/:orderId', async (req, res) => {
  try {
    const histories = await OrderHistory.find({ orderId: req.params.orderId }).sort({ timestamp: -1 });
    res.json(histories);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API: Nhập kho
app.post('/api/stock/import', async (req, res) => {
  try {
    const { productId, stock, note } = req.body;
    
    // Tìm sản phẩm theo productCode hoặc id
    const product = await Product.findOne({
      $or: [
        { productCode: productId },
        { id: productId }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }
    
    // Cập nhật số lượng tồn kho
    const newStock = (product.stock || 0) + stock;
    await Product.findOneAndUpdate(
      { _id: product._id },
      { stock: newStock, updatedAt: new Date().toISOString() }
    );
    
    // Lưu lịch sử nhập kho
    await StockHistory.create({
      productId: product.productCode || product.id,
      type: 'import',
      quantity: stock,
      user: req.body.user || 'Admin',
      note: note || 'Nhập kho',
      createdAt: new Date()
    });
    
    res.json({ 
      success: true, 
      message: 'Nhập kho thành công',
      newStock 
    });
  } catch (error) {
    console.error('Error importing stock:', error);
    res.status(500).json({ error: 'Lỗi khi nhập kho' });
  }
});

// API: Xuất kho
app.post('/api/stock/export', async (req, res) => {
  try {
    const { productId, stock, note } = req.body;
    
    // Tìm sản phẩm theo productCode hoặc id
    const product = await Product.findOne({
      $or: [
        { productCode: productId },
        { id: productId }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }
    
    // Kiểm tra số lượng tồn kho
    if ((product.stock || 0) < stock) {
      return res.status(400).json({ error: 'Số lượng tồn kho không đủ' });
    }
    
    // Cập nhật số lượng tồn kho
    const newStock = (product.stock || 0) - stock;
    await Product.findOneAndUpdate(
      { _id: product._id },
      { stock: newStock, updatedAt: new Date().toISOString() }
    );
    
    // Lưu lịch sử xuất kho
    await StockHistory.create({
      productId: product.productCode || product.id,
      type: 'export',
      quantity: stock,
      user: req.body.user || 'Admin',
      note: note || 'Xuất kho',
      createdAt: new Date()
    });
    
    res.json({ 
      success: true, 
      message: 'Xuất kho thành công',
      newStock 
    });
  } catch (error) {
    console.error('Error exporting stock:', error);
    res.status(500).json({ error: 'Lỗi khi xuất kho' });
  }
});

// API: Lấy lịch sử kho hàng theo sản phẩm
app.get('/api/stock/history/:productId', async (req, res) => {
  try {
    const histories = await StockHistory.find({ 
      productId: req.params.productId 
    }).sort({ createdAt: -1 });
    res.json(histories);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Lỗi khi lấy lịch sử kho' });
  }
});

// API: Thống kê kho hàng theo danh mục
app.get('/api/stock/category-stats', async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgStock: { $avg: '$stock' },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          }
        }
      },
      { $sort: { totalStock: -1 } }
    ]);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thống kê danh mục' });
  }
});

// API: Báo cáo tồn kho
app.get('/api/stock/report', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalStock = await Product.aggregate([
      { $group: { _id: null, total: { $sum: '$stock' } } }
    ]);
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ 
      stock: { $gt: 0, $lt: 10 } 
    });
    
    res.json({
      stats: {
        totalProducts,
        totalStock: totalStock[0]?.total || 0,
        outOfStock,
        lowStock
      },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generating stock report:', error);
    res.status(500).json({ error: 'Lỗi khi tạo báo cáo tồn kho' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
}); 