import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    id: String,
    productCode: String,
    name: String,
    price: Number,
    oldPrice: Number,
    discount: Number,
    images: [String],
    category: String,
    colors: [String],
    tags: [String],
    specs: [{
      name: String,
      value: String
    }],
    supplier: String
  },
  quantity: Number,
  selectedColor: String
});

const customerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  province: String,
  provinceName: String,
  district: String,
  districtName: String,
  address: String,
  note: String
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, default: '' },
  orderId: {
    type: String,
    required: false,
    unique: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  payment: {
    type: String,
    enum: ['cod', 'bank', 'banking', 'momo', 'zalopay'],
    default: 'cod'
  },
  customer: customerSchema,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipping', 'completed', 'cancelled', 'returned'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Thông tin bổ sung
  notes: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  promotionCode: { type: String, default: '' },
  // Thêm trường shippingAddress để lưu địa chỉ giao hàng
  shippingAddress: { type: String, default: '' }
});

// Tạo orderId tự động (12 ký tự)
orderSchema.pre('save', function(next) {
  if (!this.orderId || this.orderId.trim() === '') {
    const timestamp = Date.now().toString().slice(-6);
    const randomId = Math.random().toString(36).substr(2, 6);
    this.orderId = `DH${timestamp}${randomId}`.toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

export const Order = mongoose.model('Order', orderSchema); 