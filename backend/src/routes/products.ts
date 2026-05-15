import { Router, Request, Response } from 'express';
import { ProductModel } from '../models/product';
import { StockModel } from '../models/stock';

const router = Router();

// Get all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.getAll();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, description, unit_price } = req.body;
    
    if (!name || !category || unit_price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const normalize = (value: any) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
      }
      return value === '' ? undefined : value;
    };

    const payload: any = {
      name,
      category,
      unit_price,
    };

    if (normalize(description) !== undefined) payload.description = normalize(description);
    if (normalize(req.body.sku) !== undefined) payload.sku = normalize(req.body.sku);
    if (normalize(req.body.serial_number) !== undefined) payload.serial_number = normalize(req.body.serial_number);
    if (normalize(req.body.supplier) !== undefined) payload.supplier = normalize(req.body.supplier);
    if (normalize(req.body.purchased_by) !== undefined) payload.purchased_by = normalize(req.body.purchased_by);
    if (normalize(req.body.purchase_date) !== undefined) payload.purchase_date = normalize(req.body.purchase_date);
    if (normalize(req.body.manufacturing_date) !== undefined) payload.manufacturing_date = normalize(req.body.manufacturing_date);
    if (normalize(req.body.warranty_provider) !== undefined) payload.warranty_provider = normalize(req.body.warranty_provider);
    if (normalize(req.body.warranty_expiry) !== undefined) payload.warranty_expiry = normalize(req.body.warranty_expiry);
    if (normalize(req.body.warranty_terms) !== undefined) payload.warranty_terms = normalize(req.body.warranty_terms);

    const product = await ProductModel.create(payload);

    await StockModel.initializeStock(product.id);

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await ProductModel.update(req.params.id, req.body);
    res.json({ message: 'Product updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await ProductModel.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
