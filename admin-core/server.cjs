const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Product } = require('./src/models/Product.js');
const { Order } = require('./src/models/Order.ts');
const OrderHistory = require('./src/models/OrderHistory.js');
const StockHistory = require('./src/models/StockHistory.ts');
const nodemailer = require('nodemailer');
const { Promotion } = require('./src/models/Promotion.ts');
const fs = require('fs');
const path = require('path');

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
    console.log('Fetched orders:', orders.length);
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

// API: GET /api/banners
app.get('/api/banners', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'banners.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Không đọc được dữ liệu banner' });
    }
    try {
      const banners = JSON.parse(data);
      res.json(banners.filter(b => b.active !== false));
    } catch (e) {
      res.status(500).json({ error: 'Dữ liệu banner không hợp lệ' });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
}); 