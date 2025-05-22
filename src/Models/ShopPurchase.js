import mongoose from 'mongoose';

const ShopPurchaseSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopProduct', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Comprado', 'Entregue'], default: 'Comprado' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ShopPurchase', ShopPurchaseSchema); 