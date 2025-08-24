import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderHistory extends Document {
  orderId: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  timestamp: Date;
  user: string;
}

const OrderHistorySchema: Schema = new Schema({
  orderId: { type: String, required: true },
  action: { type: String, required: true },
  oldStatus: { type: String },
  newStatus: { type: String },
  timestamp: { type: Date, default: Date.now },
  user: { type: String, required: true }
});

export default mongoose.model<IOrderHistory>('OrderHistory', OrderHistorySchema); 