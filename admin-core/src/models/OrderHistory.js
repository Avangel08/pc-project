import mongoose from 'mongoose';

const OrderHistorySchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  action: { type: String, required: true },
  oldStatus: { type: String },
  newStatus: { type: String },
  timestamp: { type: Date, default: Date.now },
  user: { type: String, required: true }
});

export default mongoose.model('OrderHistory', OrderHistorySchema); 