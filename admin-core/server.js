import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Product } from './src/models/Product.js';
import { Order } from './src/models/Order.js';
import OrderHistory from './src/models/OrderHistory.js';
import StockHistory from './src/models/StockHistory.js';
import nodemailer from 'nodemailer';
import { Promotion } from './src/models/Promotion.js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { Review } from './src/models/Review.js';
import { PaymentMethods } from './src/models/PaymentMethods.js';

// Banner Schema
const bannerImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  title: { type: String, default: '' }
});

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  images: [bannerImageSchema],
  linkUrl: { type: String, default: '' },
  position: { 
    type: String, 
    enum: ['hero', 'promotion', 'sidebar', 'category'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'draft'], 
    default: 'draft' 
  },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  priority: { type: Number, default: 1 },
  clicks: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  autoPlay: { type: Boolean, default: true },
  autoPlaySpeed: { type: Number, default: 5 }, // seconds
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

const Banner = mongoose.model('Banner', bannerSchema);

// Customer Schema
const customerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
});

const Customer = mongoose.model('Customer', customerSchema);

const app = express();
const port = process.env.PORT || 3001;

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pc-shop')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/products', async (_req, res) => {
  try {
    const products = await Product.find();
    console.log('Fetched products:', products.length);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    // Tìm theo id trước, nếu không có thì tìm theo productCode
    let product = await Product.findOne({ id: req.params.id });
    if (!product) {
      product = await Product.findOne({ productCode: req.params.id });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.get('/api/products/by-ids', async (req, res) => {
  try {
    const idsParam = req.query.ids;
    if (!idsParam) return res.json([]);
    const ids = idsParam.split(',');
    const products = await Product.find({ id: { $in: ids } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products by ids' });
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
    const { productCode, name, category, price, stock, description } = req.body;
    
    console.log('CREATE PRODUCT REQUEST:', req.body);
    
    // Validation chi tiết
    const errors = [];
    
    // Kiểm tra productCode
    if (!productCode || !productCode.trim()) {
      errors.push("Mã sản phẩm không được để trống");
    } else if (productCode.trim().length < 2) {
      errors.push("Mã sản phẩm phải có ít nhất 2 ký tự");
    } else if (productCode.includes(' ')) {
      errors.push("Mã sản phẩm không được chứa khoảng trắng");
    }
    
    // Kiểm tra tên sản phẩm
    if (!name || !name.trim()) {
      errors.push("Tên sản phẩm không được để trống");
    } else if (name.trim().length < 3) {
      errors.push("Tên sản phẩm phải có ít nhất 3 ký tự");
    }
    
    // Kiểm tra danh mục
    if (!category || !category.trim()) {
      errors.push("Danh mục không được để trống");
    }
    
    // Kiểm tra giá
    if (!price || price <= 0) {
      errors.push("Giá sản phẩm phải lớn hơn 0");
    }
    
    // Kiểm tra stock
    if (stock === undefined || stock === null || stock < 0) {
      errors.push("Số lượng tồn kho phải lớn hơn hoặc bằng 0");
    }
    
    // Kiểm tra description
    if (!description || !description.trim()) {
      errors.push("Mô tả sản phẩm không được để trống");
    }
    
    // Hiển thị lỗi nếu có
    if (errors.length > 0) {
      console.error('CREATE PRODUCT VALIDATION ERRORS:', errors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    // Kiểm tra productCode đã tồn tại chưa
    const existingProduct = await Product.findOne({ 
      productCode: productCode.trim() 
    });
    
    if (existingProduct) {
      console.error('CREATE PRODUCT: ProductCode đã tồn tại:', productCode);
      return res.status(409).json({ 
        error: 'Mã sản phẩm đã tồn tại trong hệ thống' 
      });
    }
    
    // Tạo ID tự động
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const productId = `PROD_${timestamp}_${randomId}`;
    
    // Clean và chuẩn bị dữ liệu
    const cleanedData = {
      ...req.body,
      productCode: productCode.trim(),
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      supplier: req.body.supplier?.trim() || '',
      id: productId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Creating product with cleaned data:', cleanedData);
    const product = await Product.create(cleanedData);
    console.log('Created product successfully:', { 
      id: product.id, 
      productCode: product.productCode, 
      name: product.name 
    });
    res.json(product);
  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error);
    
    // Xử lý lỗi MongoDB duplicate key
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Mã sản phẩm đã tồn tại trong hệ thống' 
      });
    }
    
    res.status(500).json({ error: 'Lỗi server khi tạo sản phẩm: ' + error.message });
  }
});

// Sửa sản phẩm
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
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

// ========== ORDER API ENDPOINTS ==========

// Lấy tất cả đơn hàng
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log('Orders API - Total orders count:', orders.length);
    console.log('Orders API - Fetched at:', new Date().toISOString());
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Lấy đơn hàng theo ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Trả về đầy đủ trường shippingAddress (tự động ghép nếu không có)
    res.json({
      ...order.toObject(),
      shippingAddress: order.shippingAddress 
        || [order.customer?.address, order.customer?.district, order.customer?.province]
            .filter(Boolean).join(', ')
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Tạo đơn hàng mới
app.post('/api/orders', async (req, res) => {
  try {
    // Log giá trị nhận từ client
    console.log('Order nhận từ client:', req.body);
    // Sử dụng orderId từ request nếu có, nếu không thì tạo mới (12 ký tự)
    let orderId = req.body.orderId;
    if (!orderId) {
      const timestamp = Date.now().toString().slice(-6); // 6 chữ số cuối
      const randomId = Math.random().toString(36).substr(2, 6); // 6 ký tự
      orderId = `DH${timestamp}${randomId}`.toUpperCase(); // 12 ký tự total
    }
    const orderData = {
      ...req.body,
      promotionCode: req.body.promotionCode || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // Log giá trị chuẩn bị lưu
    console.log('OrderData chuẩn bị lưu:', orderData);
    const order = new Order(orderData);
    await order.save();
    console.log('Created order:', order);

    // Tự động trừ tồn kho và lưu lịch sử cho từng sản phẩm
    for (const item of order.items) {
      console.log('Đang trừ stock cho sản phẩm:', item.product?.productCode, 'Số lượng:', item.quantity);
      await Product.findOneAndUpdate(
        { productCode: item.product.productCode },
        { $inc: { stock: -item.quantity } }
      );
      await StockHistory.create({
        productId: item.product.productCode,
        type: 'order',
        quantity: item.quantity, // Sửa ở đây, thay vì stock: item.quantity
        user: order.customer?.name || 'Khách hàng',
        note: `Tạo đơn hàng ${orderId}`
      });
    }

    // Trừ lượt dùng mã giảm giá nếu có
    if (order.promotionCode) {
      console.log('Cập nhật usage cho mã giảm giá:', order.promotionCode);
      try {
        const updatedPromo = await Promotion.findOneAndUpdate(
          { code: order.promotionCode },
          { $inc: { usage: 1 } },
          { new: true }
        );
        console.log('Kết quả cập nhật promotion:', updatedPromo);
      } catch (promoError) {
        console.error('Lỗi cập nhật promotion usage:', promoError);
      }
    }

    res.json({ success: true, orderId: order.orderId, order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Cập nhật trạng thái đơn hàng
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Sync với customer app
    try {
      await fetch('http://localhost:3000/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: req.params.id,
          status: status
        })
      });
      console.log('Synced order status to customer app:', req.params.id, status);
    } catch (error) {
      console.error('Failed to sync with customer app:', error);
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Cập nhật thông tin đơn hàng
app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Hủy đơn hàng (cộng lại tồn kho)
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Cộng lại tồn kho và lưu lịch sử cho từng sản phẩm
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { productCode: item.product.productCode },
        { $inc: { stock: item.quantity } }
      );
      await StockHistory.create({
        productId: item.product.productCode,
        type: 'cancel',
        stock: item.quantity,
        user: order.customer?.name || 'Admin',
        note: `Hủy đơn hàng ${order.orderId}`
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Thống kê đơn hàng
app.get('/api/orders/stats/summary', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const shippingOrders = await Order.countDocuments({ status: 'shipping' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    // Tính tổng doanh thu
    const completedOrdersData = await Order.find({ status: 'completed' });
    const totalRevenue = completedOrdersData.reduce((sum, order) => sum + order.total, 0);
    
    // Đơn hàng hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });
    
    res.json({
      totalOrders,
      pendingOrders,
      shippingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      todayOrders
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Failed to fetch order stats' });
  }
});

// Cập nhật trạng thái đơn hàng
app.patch('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId },
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Sync với customer app
    try {
      await fetch('http://localhost:3000/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          status: status
        })
      });
      console.log('Synced order status to customer app:', orderId, status);
    } catch (error) {
      console.error('Failed to sync with customer app:', error);
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
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

// ========== CUSTOMER API ENDPOINTS ==========

// Lấy tất cả customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    // Lấy tất cả userId
    const userIds = customers.map(c => c.id);

    // Lấy tất cả đơn hàng của các user này
    const orders = await Order.find({ userId: { $in: userIds } });

    // Gom đơn hàng theo userId
    const orderMap = {};
    orders.forEach(order => {
      if (!orderMap[order.userId]) orderMap[order.userId] = [];
      orderMap[order.userId].push(order);
    });

    // Tính toán thống kê cho từng customer
    const customersWithStats = customers.map(c => {
      const userOrders = orderMap[c.id] || [];
      const orderCount = userOrders.length;
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const sortedOrders = [...userOrders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const joinDate = c.createdAt || (sortedOrders[0]?.createdAt || '');
      const lastOrder = sortedOrders.length > 0 ? sortedOrders[sortedOrders.length - 1] : null;
      return {
        ...c.toObject(),
        orders: orderCount,
        totalSpent,
        joinDate: joinDate ? new Date(joinDate).toISOString().slice(0, 10) : '',
        lastOrder: lastOrder ? lastOrder.orderId : ''
      };
    });

    res.json(customersWithStats);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Lấy customer theo ID
app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ id: req.params.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Tạo customer mới (từ customer registration)
app.post('/api/customers', async (req, res) => {
  try {
    const { id, name, email, phone, address, role, createdAt, isActive } = req.body;
    
    console.log('CREATE CUSTOMER REQUEST:', req.body);
    
    // Validation
    if (!id || !name || !email) {
      return res.status(400).json({ 
        error: 'ID, name và email là bắt buộc' 
      });
    }
    
    // Kiểm tra email đã tồn tại chưa
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      console.error('CREATE CUSTOMER: Email đã tồn tại:', email);
      return res.status(409).json({ 
        error: 'Email đã tồn tại trong hệ thống' 
      });
    }
    
    // Tạo customer mới
    const customer = new Customer({
      id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      role: role || 'customer',
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: isActive !== undefined ? isActive : true
    });
    
    await customer.save();
    console.log('Created customer successfully:', { 
      id: customer.id, 
      name: customer.name, 
      email: customer.email 
    });
    
    res.status(201).json(customer);
  } catch (error) {
    console.error('CREATE CUSTOMER ERROR:', error);
    
    // Xử lý lỗi MongoDB duplicate key
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Email hoặc ID đã tồn tại trong hệ thống' 
      });
    }
    
    res.status(500).json({ error: 'Lỗi server khi tạo customer: ' + error.message });
  }
});

// Cập nhật customer
app.put('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { id: req.params.id }, 
      { ...req.body, updatedAt: new Date().toISOString() }, 
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Xóa customer (soft delete)
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false, updatedAt: new Date().toISOString() },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Lock customer
app.put('/api/customers/:id/lock', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false, updatedAt: new Date().toISOString() },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer locked successfully', customer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to lock customer' });
  }
});

// Unlock customer
app.put('/api/customers/:id/unlock', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { id: req.params.id },
      { isActive: true, updatedAt: new Date().toISOString() },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer unlocked successfully', customer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlock customer' });
  }
});

// Thống kê customers
app.get('/api/customers/stats', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ isActive: true });
    const newCustomersToday = await Customer.countDocuments({
      createdAt: { $gte: new Date().toISOString().split('T')[0] }
    });
    
    res.json({
      totalCustomers,
      activeCustomers,
      newCustomersToday
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: 'Failed to fetch customer stats' });
  }
});

// API cho customer app - lấy thông tin đơn hàng với xác thực email
app.post('/api/orders/customer/lookup', async (req, res) => {
  try {
    const { orderId, email } = req.body;
    
    if (!orderId || !email) {
      return res.status(400).json({ 
        error: 'Thiếu thông tin: orderId và email là bắt buộc' 
      });
    }

    const order = await Order.findOne({ orderId: orderId });
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra email có khớp không
    const orderEmail = order.customer?.email || order.guestEmail;
    if (orderEmail !== email) {
      return res.status(403).json({ 
        error: 'Email không khớp với đơn hàng này' 
      });
    }

    // Trả về thông tin đơn hàng (ẩn một số thông tin nhạy cảm)
    const orderInfo = {
      orderId: order.orderId,
      status: order.status,
      total: order.total,
      items: order.items,
      customer: {
        name: order.customer?.name || order.guestName,
        email: order.customer?.email || order.guestEmail,
        phone: order.customer?.phone || order.guestPhone,
        address: order.shippingAddress
      },
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      isGuest: order.isGuest || false
    };

    res.json(orderInfo);
  } catch (error) {
    console.error('Error looking up order for customer:', error);
    res.status(500).json({ error: 'Lỗi server khi tra cứu đơn hàng' });
  }
});

// API cho customer app - lấy danh sách đơn hàng theo userId
app.get('/api/orders/customer/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'Thiếu thông tin: userId là bắt buộc' 
      });
    }

    // Tìm tất cả đơn hàng của user này (không phải guest)
    const orders = await Order.find({ 
      userId: parseInt(userId),
      isGuest: { $ne: true } // Không phải guest orders
    }).sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

    // Chuyển đổi format để phù hợp với customer app
    const formattedOrders = orders.map(order => ({
      id: order.orderId,
      userId: order.userId,
      items: order.items,
      subtotal: order.subtotal || 0,
      shipping: order.shipping || 0,
      total: order.total,
      payment: order.payment,
      customer: {
        name: order.customer?.name || '',
        phone: order.customer?.phone || '',
        email: order.customer?.email || '',
        province: order.shippingAddress?.split(', ').pop() || '',
        district: order.shippingAddress?.split(', ').slice(-2, -1)[0] || '',
        address: order.shippingAddress?.split(', ').slice(0, -2).join(', ') || '',
        note: order.note || ''
      },
      shippingAddress: order.shippingAddress || '',
      status: order.status,
      date: order.createdAt,
      createdAt: order.createdAt
    }));

    res.json({
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching orders for customer:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách đơn hàng' });
  }
});

// API gửi email
app.post('/api/send-email', async (req, res) => {
  const { to, subject, message } = req.body;
  if (!to || !subject || !message) {
    return res.status(400).json({ error: 'Thiếu thông tin gửi email' });
  }

  // Cấu hình transporter với Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'avangel8803@gmail.com',
      pass: 'dnhwzxyyttuxpavu' // Mật khẩu ứng dụng Gmail
    }
  });

  try {
    await transporter.sendMail({
      from: '"Arena Shop" <avangel8803@gmail.com>',
      to,
      subject,
      html: `<div>${message}</div>`
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Gửi email thất bại' });
  }
});

// API: Lấy danh sách khuyến mãi
app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được danh sách khuyến mãi' });
  }
});

// API: Tạo mới khuyến mãi
app.post('/api/promotions', async (req, res) => {
  try {
    const data = req.body;
    // Tạo id tự động
    const timestamp = Date.now().toString().slice(-6);
    const randomId = Math.random().toString(36).substr(2, 6);
    const id = `KM${timestamp}${randomId}`.toUpperCase();
    const promo = new Promotion({ ...data, id });
    await promo.save();
    res.json({ success: true, promotion: promo });
  } catch (error) {
    res.status(400).json({ error: 'Tạo khuyến mãi thất bại', detail: error.message });
  }
});

// API: Cập nhật khuyến mãi
app.put('/api/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const promo = await Promotion.findOneAndUpdate({ id }, data, { new: true });
    if (!promo) return res.status(404).json({ error: 'Không tìm thấy khuyến mãi' });
    res.json({ success: true, promotion: promo });
  } catch (error) {
    res.status(400).json({ error: 'Cập nhật khuyến mãi thất bại', detail: error.message });
  }
});

// API: Xóa khuyến mãi
app.delete('/api/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await Promotion.findOneAndDelete({ id });
    if (!promo) return res.status(404).json({ error: 'Không tìm thấy khuyến mãi' });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Xóa khuyến mãi thất bại', detail: error.message });
  }
});

// API: Kiểm tra mã giảm giá
app.post('/api/promotions/check', async (req, res) => {
  try {
    const { code, total } = req.body;
    const promo = await Promotion.findOne({ code: code.toUpperCase(), status: 'active' });
    if (!promo) return res.status(404).json({ error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    const now = new Date();
    if (now < promo.startDate || now > promo.endDate) {
      return res.status(400).json({ error: 'Khuyến mãi chưa đến hạn hoặc đã hết hạn' });
    }
    if (promo.usage >= promo.limit) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết lượt sử dụng' });
    }
    // Tính toán số tiền giảm
    let discount = 0;
    if (promo.type === 'percentage') {
      discount = Math.round((total * promo.value) / 100);
    } else {
      discount = promo.value;
    }
    res.json({ success: true, discount, promotion: promo });
  } catch (error) {
    res.status(400).json({ error: 'Lỗi kiểm tra mã giảm giá', detail: error.message });
  }
});

// ========== STOCK MANAGEMENT API ENDPOINTS ==========

// API: Nhập kho
app.post('/api/stock/import', async (req, res) => {
  try {
    const { productId, stock, note, user } = req.body;
    
    // Kiểm tra số lượng nhập phải lớn hơn 0
    if (typeof stock !== 'number' || stock <= 0) {
      return res.status(400).json({ error: 'Số lượng nhập kho phải lớn hơn 0' });
    }
    
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
      user: user || 'Admin',
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
    const { productId, stock, note, user } = req.body;
    
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
      user: user || 'Admin',
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

// ========== BANNER MANAGEMENT API ENDPOINTS ==========

// API: Lấy tất cả banner
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ priority: -1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách banner' });
  }
});

// API: Lấy banner theo vị trí
app.get('/api/banners/position/:position', async (req, res) => {
  try {
    const banners = await Banner.find({ 
      position: req.params.position,
      status: 'active',
      startDate: { $lte: new Date().toISOString() },
      endDate: { $gte: new Date().toISOString() }
    }).sort({ priority: -1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners by position:', error);
    res.status(500).json({ error: 'Lỗi khi lấy banner theo vị trí' });
  }
});

// API: Tạo banner mới
app.post('/api/banners', async (req, res) => {
  try {
    console.log('Banner creation request body:', JSON.stringify(req.body, null, 2));
    const { title, description, images, linkUrl, position, status, startDate, endDate, priority, autoPlay, autoPlaySpeed } = req.body;
    
    // Validation
    if (!title || !images || !Array.isArray(images) || images.length === 0 || !position || !startDate || !endDate) {
      console.log('Validation failed:', {
        hasTitle: !!title,
        hasImages: !!images,
        isArray: Array.isArray(images),
        imagesLength: images?.length,
        hasPosition: !!position,
        hasStartDate: !!startDate,
        hasEndDate: !!endDate
      });
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc hoặc danh sách ảnh không hợp lệ' });
    }
    
    console.log('Creating banner with data:', {
      title,
      description: description || '',
      images,
      linkUrl: linkUrl || '',
      position,
      status: status || 'draft',
      startDate,
      endDate,
      priority: priority || 1,
      autoPlay: autoPlay !== undefined ? autoPlay : true,
      autoPlaySpeed: autoPlaySpeed || 5
    });
    
    const banner = await Banner.create({
      title,
      description: description || '',
      images,
      linkUrl: linkUrl || '',
      position,
      status: status || 'draft',
      startDate,
      endDate,
      priority: priority || 1,
      autoPlay: autoPlay !== undefined ? autoPlay : true,
      autoPlaySpeed: autoPlaySpeed || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('Banner created successfully:', banner);
    res.json(banner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Lỗi khi tạo banner' });
  }
});

// API: Cập nhật banner
app.put('/api/banners/:id', async (req, res) => {
  try {
    const { title, description, images, linkUrl, position, status, startDate, endDate, priority, autoPlay, autoPlaySpeed } = req.body;
    
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description: description || '',
        images,
        linkUrl: linkUrl || '',
        position,
        status,
        startDate,
        endDate,
        priority: priority || 1,
        autoPlay: autoPlay !== undefined ? autoPlay : true,
        autoPlaySpeed: autoPlaySpeed || 5,
        updatedAt: new Date().toISOString()
      },
      { new: true }
    );
    
    if (!banner) {
      return res.status(404).json({ error: 'Banner không tồn tại' });
    }
    
    res.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật banner' });
  }
});

// API: Xóa banner
app.delete('/api/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ error: 'Banner không tồn tại' });
    }
    
    res.json({ message: 'Xóa banner thành công' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Lỗi khi xóa banner' });
  }
});

// API: Tăng lượt click banner
app.post('/api/banners/:id/click', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );
    
    if (!banner) {
      return res.status(404).json({ error: 'Banner không tồn tại' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error incrementing banner clicks:', error);
    res.status(500).json({ error: 'Lỗi khi tăng lượt click' });
  }
});

// API: Tăng lượt xem banner
app.post('/api/banners/:id/view', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!banner) {
      return res.status(404).json({ error: 'Banner không tồn tại' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error incrementing banner views:', error);
    res.status(500).json({ error: 'Lỗi khi tăng lượt xem' });
  }
});

// Reviews API
// Lấy danh sách đánh giá (có thể lọc theo productId)
app.get('/api/reviews', async (req, res) => {
  try {
    const { productId, status } = req.query;
    const filter = {};
    if (productId) filter.productId = productId;
    if (status) filter.status = status;
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Thêm đánh giá mới
app.post('/api/reviews', async (req, res) => {
  try {
    const { id, productId, customerId, customerName, customerEmail, rating, comment } = req.body;
    if (!productId || !customerId || !customerName || !customerEmail || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const review = await Review.create({
      id: id || `REV_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      productId,
      customerId,
      customerName,
      customerEmail,
      rating,
      comment,
      date: new Date().toISOString(),
      status: 'pending',
      helpful: 0,
      reported: false,
      reportReason: null
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Cập nhật trạng thái đánh giá
app.put('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const review = await Review.findOneAndUpdate({ id }, { status, updatedAt: new Date() }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Xóa đánh giá
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findOneAndDelete({ id });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ========== PAYMENT METHODS SETTINGS API ==========
// Lấy trạng thái các phương thức thanh toán
app.get('/api/settings/payment-methods', async (req, res) => {
  try {
    let doc = await PaymentMethods.findById('default');
    if (!doc) {
      // Nếu chưa có thì tạo mặc định
      doc = await PaymentMethods.create({ _id: 'default' });
    }
    res.json({ cod: doc.cod, bank: doc.bank, ewallet: doc.ewallet, bankQrUrl: doc.bankQrUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payment methods', details: error.message });
  }
});

// Cập nhật trạng thái các phương thức thanh toán
app.post('/api/settings/payment-methods', async (req, res) => {
  try {
    const { cod, bank, ewallet, bankQrUrl } = req.body;
    const doc = await PaymentMethods.findByIdAndUpdate(
      'default',
      { cod, bank, ewallet, bankQrUrl },
      { new: true, upsert: true }
    );
    res.json({ cod: doc.cod, bank: doc.bank, ewallet: doc.ewallet, bankQrUrl: doc.bankQrUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment methods', details: error.message });
  }
});

const BACKUP_DIR = path.join(process.cwd(), 'backup');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pc-shop';

// Đảm bảo thư mục backup tồn tại
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

// API tạo bản backup mới
app.post('/api/backup', async (req, res) => {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
  const filename = `backup_${timestamp}.archive`;
  const filepath = path.join(BACKUP_DIR, filename);
  const cmd = `mongodump --uri=\"${MONGO_URI}\" --archive=\"${filepath}\" --gzip`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Backup failed', details: stderr || error.message });
    }
    res.json({ success: true, filename });
  });
});

// API lấy danh sách file backup
app.get('/api/backup/list', (req, res) => {
  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read backup directory' });
    const list = files.filter(f => f.endsWith('.archive')).map(f => ({
      name: f,
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
    })).sort((a, b) => b.time - a.time);
    res.json(list);
  });
});

// API tải file backup
app.get('/api/backup/download', (req, res) => {
  const file = req.query.file;
  if (!file) return res.status(400).json({ error: 'Missing file param' });
  const filepath = path.join(BACKUP_DIR, file);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'File not found' });
  res.download(filepath);
});

// API khôi phục từ file backup
app.post('/api/restore', (req, res) => {
  const { file } = req.body;
  if (!file) return res.status(400).json({ error: 'Missing file param' });
  const filepath = path.join(BACKUP_DIR, file);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'File not found' });
  const cmd = `mongorestore --uri=\"${MONGO_URI}\" --archive=\"${filepath}\" --gzip --drop`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Restore failed', details: stderr || error.message });
    }
    res.json({ success: true });
  });
});

// ========== DASHBOARD API ENDPOINTS ==========

// API: Lấy dữ liệu tổng quan cho dashboard
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    // Tính tổng doanh thu (từ đơn hàng đã hoàn thành)
    const completedOrders = await Order.find({ status: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Đếm tổng đơn hàng
    const orderCount = await Order.countDocuments();
    console.log('Dashboard - Total orders count:', orderCount);

    // Đếm khách hàng mới (trong tháng hiện tại)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: currentMonth.toISOString() }
    });

    // Đếm tổng sản phẩm
    const productCount = await Product.countDocuments();

    // Dữ liệu doanh thu 7 tháng gần đây
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthOrders = await Order.find({
        status: 'completed',
        createdAt: {
          $gte: startOfMonth.toISOString(),
          $lte: endOfMonth.toISOString()
        }
      });

      const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const monthOrderCount = monthOrders.length;

      revenueData.push({
        name: `T${date.getMonth() + 1}`,
        revenue: monthRevenue,
        orders: monthOrderCount
      });
    }

    // Top sản phẩm bán chạy (dựa trên số lượng đơn hàng)
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 4 }
    ]);

    // Lấy thông tin chi tiết cho top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (product) => {
        const productInfo = await Product.findOne({ id: product._id });
        return {
          name: productInfo?.name || `Sản phẩm ${product._id}`,
          sales: product.sales,
          revenue: product.revenue
        };
      })
    );

    const response = {
      totalRevenue,
      orderCount,
      newCustomers,
      productCount,
      revenueData,
      topProducts: topProductsWithDetails,
      fetchedAt: new Date().toISOString() // Thêm timestamp để debug
    };

    console.log('Dashboard summary response:', {
      orderCount: response.orderCount,
      totalRevenue: response.totalRevenue,
      newCustomers: response.newCustomers,
      productCount: response.productCount,
      fetchedAt: response.fetchedAt
    });

    res.json(response);

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy dữ liệu tổng quan' });
  }
});

// ========== BANNER MANAGEMENT API ENDPOINTS ==========

// Start server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
}); 