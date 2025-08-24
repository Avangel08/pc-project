import mongoose from 'mongoose';

const stockHistorySchema = new mongoose.Schema({
  productId: { type: String, required: true },
  type: { type: String, enum: ['import', 'export', 'order', 'cancel'], required: true },
  quantity: { type: Number, required: true },
  user: { type: String },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const StockHistory = mongoose.model('StockHistory', stockHistorySchema);
export default StockHistory; 