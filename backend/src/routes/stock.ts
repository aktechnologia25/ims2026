import { Router, Request, Response } from 'express';
import { StockModel } from '../models/stock';
import { ProductModel } from '../models/product';

const router = Router();

// Get all stock records
router.get('/', async (req: Request, res: Response) => {
  try {
    const stock = await StockModel.getAll();
    res.json(stock);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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

// Update stock quantity and metadata
router.patch('/update/:product_id', async (req: Request, res: Response) => {
  try {
    const { quantity_change, warehouse_location, batch_number, received_date, reorder_threshold } = req.body;

    if (
      quantity_change === undefined &&
      warehouse_location === undefined &&
      batch_number === undefined &&
      received_date === undefined &&
      reorder_threshold === undefined
    ) {
      return res.status(400).json({ error: 'At least one update field is required' });
    }

    // Verify product exists
    const product = await ProductModel.getById(req.params.product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await StockModel.updateQuantity(req.params.product_id, quantity_change || 0, {
      warehouse_location,
      batch_number,
      received_date,
      reorder_threshold,
    });

    res.json({ message: 'Stock updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
