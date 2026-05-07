import { Router, Request, Response } from 'express';
import { StockModel } from '../models/stock';
import { ProductModel } from '../models/product';

const router = Router();

// Get stock for a product
router.get('/product/:product_id', async (req: Request, res: Response) => {
  try {
    const stock = await StockModel.getByProductId(req.params.product_id);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(stock);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock items
router.get('/low-stock/all', async (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;
    const lowStock = await StockModel.getAllLowStock(threshold);
    res.json(lowStock);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update stock quantity
router.patch('/update/:product_id', async (req: Request, res: Response) => {
  try {
    const { quantity_change } = req.body;
    
    if (quantity_change === undefined) {
      return res.status(400).json({ error: 'quantity_change is required' });
    }
    
    // Verify product exists
    const product = await ProductModel.getById(req.params.product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await StockModel.updateQuantity(req.params.product_id, quantity_change);
    res.json({ message: 'Stock updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
