import mongoose from 'mongoose';

const paymentMethodsSchema = new mongoose.Schema({
  _id: { type: String, default: 'default' }, // chỉ có 1 document duy nhất
  cod: { type: Boolean, default: true }, // Thanh toán khi nhận hàng
  bank: { type: Boolean, default: true }, // Chuyển khoản ngân hàng
  ewallet: { type: Boolean, default: false }, // Ví điện tử (Momo, ZaloPay...)
  bankQrUrl: { type: String, default: '' } // URL ảnh QR chuyển khoản
});

export const PaymentMethods = mongoose.model('PaymentMethods', paymentMethodsSchema); 