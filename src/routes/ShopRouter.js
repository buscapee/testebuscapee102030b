import express from 'express';
import ShopProduct from '../Models/ShopProduct.js';
import ShopCategory from '../Models/ShopCategory.js';
import { User } from '../Models/useModel.js';
import { authGuard } from '../Middleware/authGuard.js';
import ShopPurchase from '../Models/ShopPurchase.js';

const router = express.Router();

// Produtos
router.get('/products', async (req, res) => {
  const products = await ShopProduct.find();
  res.json(products);
});

router.post('/products', async (req, res) => {
  const product = new ShopProduct(req.body);
  await product.save();
  res.json(product);
});

router.put('/products/:id', async (req, res) => {
  const product = await ShopProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

router.delete('/products/:id', async (req, res) => {
  await ShopProduct.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Categorias
router.get('/categories', async (req, res) => {
  const categories = await ShopCategory.find();
  res.json(categories);
});

router.post('/categories', async (req, res) => {
  const category = new ShopCategory(req.body);
  await category.save();
  res.json(category);
});

router.put('/categories/:id', async (req, res) => {
  const category = await ShopCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(category);
});

router.delete('/categories/:id', async (req, res) => {
  await ShopCategory.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Comprar produto (emblema)
router.post('/buy/:productId', authGuard(['User', 'Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const userId = req.idUser;
    const { productId } = req.params;
    const user = await User.findById(userId);
    const product = await ShopProduct.findById(productId);
    
    if (!user || !product) return res.status(404).json({ error: 'Usuário ou produto não encontrado.' });
    if (user.medals < product.value) {
      return res.status(400).json({ error: 'Dragonas insuficientes.' });
    }
    
    user.medals -= product.value;
    if (product.isEmblem) {
      if (!user.emblemas.includes(productId)) {
        user.emblemas.push(productId);
      }
    }
    if (product.isBanner) {
      if (!user.emblemas.includes(productId)) {
        user.emblemas.push(productId);
      }
    }
    await user.save();
    
    // Registrar compra
    const compraCriada = await ShopPurchase.create({ product: productId, buyer: userId, status: 'Comprado' });
    
    return res.json({ success: true, emblemas: user.emblemas, medals: user.medals });
  } catch (err) {
    console.error('Erro ao comprar produto:', err);
    return res.status(500).json({ error: 'Erro ao comprar produto.' });
  }
});

// Listar compradores de um produto
router.get('/purchases/:productId', authGuard(['Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { productId } = req.params;
    const compras = await ShopPurchase.find({ product: productId }).populate('buyer', 'nickname').sort({ createdAt: -1 });
    res.json(compras);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar compradores.' });
  }
});

// Atualizar status da compra
router.patch('/purchases/:purchaseId/status', authGuard(['Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { status } = req.body;
    if (!['Comprado', 'Entregue'].includes(status)) return res.status(400).json({ error: 'Status inválido.' });
    const compra = await ShopPurchase.findByIdAndUpdate(purchaseId, { status }, { new: true });
    if (!compra) return res.status(404).json({ error: 'Compra não encontrada.' });
    res.json(compra);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
});

// Remover compra
router.delete('/purchases/:purchaseId', authGuard(['Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { purchaseId } = req.params;
    await ShopPurchase.findByIdAndDelete(purchaseId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover compra.' });
  }
});

export default router; 