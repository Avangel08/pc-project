import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import OrderHistory from '../models/OrderHistory.js';
import StockHistory from '../models/StockHistory.js';
import { PaymentMethods } from '../models/PaymentMethods.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3001;

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/pc-shop')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (_req: express.Request, file: any, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!') as any, false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes

// Dashboard Summary API
app.get('/api/dashboard/summary', async (_req, res) => {
  try {
    // Tính tổng doanh thu tháng này
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const ordersThisMonth = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: { $ne: 'cancelled' }
    });
    
    const totalRevenue = ordersThisMonth.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Đếm đơn hàng tháng này
    const orderCount = ordersThisMonth.length;
    
    // Đếm khách hàng mới tháng này (có thể tính từ orders hoặc có collection Customer riêng)
    const uniqueCustomers = new Set(ordersThisMonth.map(o => o.customer?.email || o.userId).filter(Boolean));
    const newCustomers = uniqueCustomers.size;
    
    // Đếm tổng sản phẩm
    const productCount = await Product.countDocuments();
    
    // Dữ liệu doanh thu 7 tháng gần đây
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      
      const monthOrders = await Order.find({
        createdAt: { $gte: monthDate, $lte: monthEnd },
        status: { $ne: 'cancelled' }
      });
      
      const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const monthOrderCount = monthOrders.length;
      
      revenueData.push({
        name: monthName,
        revenue: monthRevenue,
        orders: monthOrderCount
      });
    }
    
    res.json({
      totalRevenue,
      orderCount,
      newCustomers,
      productCount,
      revenueData
    });
  } catch (error: any) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy dữ liệu tổng quan: ' + (error?.message || 'Unknown error') });
  }
});

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
    
    // Validate required fields
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({ error: 'Tên sản phẩm là bắt buộc' });
    }
    if (req.body.name.trim().length < 3) {
      return res.status(400).json({ error: 'Tên sản phẩm phải có ít nhất 3 ký tự' });
    }
    
    // Description có thể để trống hoặc có ít nhất 10 ký tự
    const description = req.body.description?.trim() || '';
    if (description && description.length > 0 && description.length < 10) {
      return res.status(400).json({ error: 'Mô tả sản phẩm phải có ít nhất 10 ký tự hoặc để trống' });
    }
    
    if (!req.body.price || req.body.price <= 0) {
      return res.status(400).json({ error: 'Giá sản phẩm phải lớn hơn 0' });
    }
    if (!req.body.category || !req.body.category.trim()) {
      return res.status(400).json({ error: 'Danh mục sản phẩm là bắt buộc' });
    }
    
    // Validate productCode nếu có
    if (req.body.productCode) {
      const productCode = req.body.productCode.trim();
      if (productCode.length < 2) {
        return res.status(400).json({ error: 'Mã sản phẩm phải có ít nhất 2 ký tự' });
      }
      if (productCode.includes(' ')) {
        return res.status(400).json({ error: 'Mã sản phẩm không được chứa khoảng trắng' });
      }
    }
    
    // Clean và validate images
    let images: string[] = [];
    if (Array.isArray(req.body.images)) {
      images = req.body.images
        .filter((img: any) => img && typeof img === 'string' && img.trim().length > 0)
        .map((img: string) => img.trim());
    }
    
    // Clean và validate specs
    let specs: Array<{name: string, value: string}> = [];
    if (Array.isArray(req.body.specs)) {
      specs = req.body.specs
        .filter((spec: any) => spec && spec.name && spec.value && spec.name.trim() && spec.value.trim())
        .map((spec: any) => ({
          name: spec.name.trim(),
          value: spec.value.trim()
        }));
    }
    
    const productData: any = {
      id: productId,
      productCode: (req.body.productCode || `PC_${timestamp}_${randomId}`).trim(),
      name: req.body.name.trim(),
      category: req.body.category.trim(),
      price: Number(req.body.price),
      oldPrice: Number(req.body.oldPrice || 0),
      discount: Number(req.body.discount || 0),
      stock: Number(req.body.stock || 0),
      images: images, // Đã filter rỗng
      colors: Array.isArray(req.body.colors) ? req.body.colors.filter((c: any) => c && c.trim()).map((c: string) => c.trim()) : [],
      tags: Array.isArray(req.body.tags) ? req.body.tags.filter((t: any) => t && t.trim()).map((t: string) => t.trim()) : [],
      specs: specs, // Đã validate
      status: req.body.status || 'con_hang',
      supplier: req.body.supplier?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Chỉ set description nếu có và hợp lệ
    if (description && description.length >= 10) {
      productData.description = description;
    }
    // Nếu không có description hoặc quá ngắn, không set (để dùng default từ model)
    
    console.log('Creating product with data:', JSON.stringify(productData, null, 2));
    const product = await Product.create(productData);
    console.log('Created product:', product);
    res.json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      const fields = Object.keys(error.errors);
      console.error('Validation errors:', messages);
      console.error('Validation error fields:', fields);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: messages,
        fields: fields
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      console.error('Duplicate key error:', field);
      return res.status(400).json({ 
        error: `${field === 'productCode' ? 'Mã sản phẩm' : field} đã tồn tại` 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create product',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    const oldStatus = order.status as string;
    const newStatus = req.body.status as string | undefined;

    if (newStatus && newStatus !== oldStatus) {
      const FLOW = ['pending', 'confirmed', 'processing', 'shipping', 'completed'] as const;

      const isTerminal = (s: string) => s === 'cancelled' || s === 'returned';
      const isInFlow = (s: string) => FLOW.includes(s as any);

      // Không cho đổi trạng thái nếu đã huỷ hoặc trả hàng
      if (isTerminal(oldStatus)) {
        return res.status(400).json({ error: 'Đơn hàng đã ở trạng thái cuối, không thể thay đổi' });
      }

      // Huỷ đơn chỉ cho phép từ pending
      if (newStatus === 'cancelled' && oldStatus !== 'pending') {
        return res.status(400).json({ error: 'Chỉ có thể huỷ đơn ở trạng thái Chờ xác nhận' });
      }

      // Trả hàng chỉ cho phép từ confirmed trở đi (không cho từ pending)
      if (newStatus === 'returned' && oldStatus === 'pending') {
        return res.status(400).json({ error: 'Chỉ có thể trả hàng sau khi đơn đã được xác nhận' });
      }

      // Các trạng thái trong luồng chính phải chuyển tịnh tiến
      if (isInFlow(oldStatus) && isInFlow(newStatus)) {
        const currentIndex = FLOW.indexOf(oldStatus as any);
        const nextIndex = FLOW.indexOf(newStatus as any);
        if (nextIndex !== currentIndex + 1) {
          return res.status(400).json({ error: 'Trạng thái đơn hàng chỉ được phép chuyển tịnh tiến theo thứ tự' });
        }
      }
    }

    // Cập nhật trạng thái và các trường khác nếu có
    if (newStatus) order.status = newStatus as 'pending' | 'confirmed' | 'processing' | 'shipping' | 'completed' | 'cancelled' | 'returned';
    Object.assign(order, req.body, { updatedAt: new Date() });
    await order.save();

    // Nếu có thay đổi trạng thái, lưu lịch sử
    if (newStatus && newStatus !== oldStatus) {
      await OrderHistory.create({
        orderId: order.orderId,
        action: 'status_change',
        oldStatus,
        newStatus,
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
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Unknown error' });
  }
});

// API: Lấy lịch sử đơn hàng theo orderId
app.get('/api/order-history/:orderId', async (req, res) => {
  try {
    const histories = await OrderHistory.find({ orderId: req.params.orderId }).sort({ timestamp: -1 });
    res.json(histories);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Unknown error' });
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
app.get('/api/stock/category-stats', async (_req, res) => {
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
app.get('/api/stock/report', async (_req, res) => {
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

// ========== CLOUDINARY IMAGE UPLOAD API ==========

// Upload single image to Cloudinary
app.post('/api/upload/image', upload.single('image'), async (req: express.Request, res: express.Response) => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'Không có file ảnh được upload' });
    }

    // Convert buffer to base64
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'pc-project/products',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Lỗi khi upload ảnh: ' + error.message });
  }
});

// Upload multiple images to Cloudinary
app.post('/api/upload/images', upload.array('images', 8), async (req: express.Request, res: express.Response) => {
  try {
    const files = (req as any).files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Không có file ảnh được upload' });
    }

    const uploadPromises = files.map((file: any) => {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      return cloudinary.uploader.upload(base64Image, {
        folder: 'pc-project/products',
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      urls: results.map((result: any) => result.secure_url),
      public_ids: results.map((result: any) => result.public_id)
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Lỗi khi upload ảnh: ' + error.message });
  }
});

// Delete image from Cloudinary
app.delete('/api/upload/image/:publicId', async (req: express.Request, res: express.Response) => {
  try {
    const publicId = req.params.publicId;
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ success: true, message: 'Xóa ảnh thành công' });
    } else {
      res.status(404).json({ error: 'Không tìm thấy ảnh để xóa' });
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Lỗi khi xóa ảnh: ' + error.message });
  }
});

// Payment Methods Settings API
app.get('/api/settings/payment-methods', async (_req, res) => {
  try {
    let settings = await PaymentMethods.findOne();
    if (!settings) {
      // Tạo mặc định nếu chưa có
      settings = await PaymentMethods.create({
        cod: true,
        bank: true,
        ewallet: false,
        bankQrUrl: ''
      });
    }
    res.json({
      cod: settings.cod || false,
      bank: settings.bank || false,
      ewallet: settings.ewallet || false,
      bankQrUrl: settings.bankQrUrl || ''
    });
  } catch (error: any) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy cài đặt thanh toán: ' + (error?.message || 'Unknown error') });
  }
});

app.post('/api/settings/payment-methods', async (req, res) => {
  try {
    const { cod, bank, ewallet, bankQrUrl } = req.body;
    
    let settings = await PaymentMethods.findOne();
    if (!settings) {
      settings = await PaymentMethods.create({
        cod: cod !== undefined ? cod : true,
        bank: bank !== undefined ? bank : true,
        ewallet: ewallet !== undefined ? ewallet : false,
        bankQrUrl: bankQrUrl || ''
      });
    } else {
      settings.cod = cod !== undefined ? cod : settings.cod;
      settings.bank = bank !== undefined ? bank : settings.bank;
      settings.ewallet = ewallet !== undefined ? ewallet : settings.ewallet;
      settings.bankQrUrl = bankQrUrl !== undefined ? bankQrUrl : settings.bankQrUrl;
      await settings.save();
    }
    
    res.json({
      cod: settings.cod,
      bank: settings.bank,
      ewallet: settings.ewallet,
      bankQrUrl: settings.bankQrUrl
    });
  } catch (error: any) {
    console.error('Save payment methods error:', error);
    res.status(500).json({ error: 'Lỗi khi lưu cài đặt thanh toán: ' + (error?.message || 'Unknown error') });
  }
});

// Start server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
  console.log('Cloudinary configured:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'Not configured'
  });
}); 