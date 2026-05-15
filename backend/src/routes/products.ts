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
    
    const product = await ProductModel.create({
      name,
      category,
      description,
      sku: req.body.sku,
      serial_number: req.body.serial_number,
      supplier: req.body.supplier,
      purchased_by: req.body.purchased_by,
      purchase_date: req.body.purchase_date,
      manufacturing_date: req.body.manufacturing_date,
      warranty_provider: req.body.warranty_provider,
      warranty_expiry: req.body.warranty_expiry,
      warranty_terms: req.body.warranty_terms,
      unit_price
    });

    await StockModel.initializeStock(product.id);

    res.status(201).json(product);
  } catch (error: any) {
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
