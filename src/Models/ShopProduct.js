import mongoose from 'mongoose';

const ShopProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  category: { type: String },
  status: { type: String, default: 'Visível' },
  value: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  limit: { type: Number, default: -1 },
  isEmblem: { type: Boolean, default: false },
  multiBuy: { type: Boolean, default: false },
  isBanner: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ShopProduct', ShopProductSchema); 