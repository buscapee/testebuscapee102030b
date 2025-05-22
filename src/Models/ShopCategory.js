import mongoose from 'mongoose';

const ShopCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }
});

export default mongoose.model('ShopCategory', ShopCategorySchema); 