import { Router, Request, Response } from 'express';
import { OrderModel, Order } from '../models/order';
import { StockModel } from '../models/stock';

const router = Router();

// Get all orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.getAll();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await OrderModel.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const items = await OrderModel.getItems(req.params.id);
    res.json({ ...order, items });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create order with items and automatic stock deduction
router.post('/', async (req: Request, res: Response) => {
  try {
    const { items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Validate items and calculate total
    let total_amount = 0;
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Invalid item data' });
      }
      total_amount += item.quantity * (item.unit_price || 0);
    }

    // Create order
    const order = await OrderModel.create({
      status: 'pending',
      total_amount,
      notes: notes || '',
    });

    // Add items and reduce stock
    for (const item of items) {
      await OrderModel.addItem({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      });

      // Automatically reduce stock for pending orders
      await StockModel.updateQuantity(item.product_id, -item.quantity);
    }

    res.status(201).json({ ...order, items });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status (with stock adjustment logic)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await OrderModel.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If cancelling, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const items = await OrderModel.getItems(req.params.id);
      for (const item of items) {
        await StockModel.updateQuantity(item.product_id, item.quantity);
      }
    }

    // If restoring from cancelled, deduct stock again
    if (order.status === 'cancelled' && status !== 'cancelled') {
      const items = await OrderModel.getItems(req.params.id);
      for (const item of items) {
        await StockModel.updateQuantity(item.product_id, -item.quantity);
      }
    }
    
    await OrderModel.updateStatus(req.params.id, status);
    res.json({ message: 'Order status updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
