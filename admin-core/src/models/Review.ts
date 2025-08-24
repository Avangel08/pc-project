import mongoose from mongoose';

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  customerId: { type: Number, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max:5
  comment: { type: String, required: true, maxlength: 500 },
  date: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending, proved', 'rejected', 'flagged'], 
    default:pending
  },
  helpful: { type: Number, default: 0  reported: { type: Boolean, default: false },
  reportReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index để tối ưu query
reviewSchema.index({ productId:1atus: 1reviewSchema.index({ customerId: 1reviewSchema.index({ createdAt: -1 });

export const Review = mongoose.model('Review, reviewSchema); 