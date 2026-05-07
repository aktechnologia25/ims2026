import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './database';

export interface Order {
  id: string;
  order_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export class OrderModel {
  static async getAll(): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.all('SELECT * FROM orders ORDER BY order_date DESC', (err, rows: Order[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  static async getById(id: string): Promise<Order | null> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row: Order) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  static async create(data: Omit<Order, 'id' | 'order_date'>): Promise<Order> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.run(
        'INSERT INTO orders (id, order_date, status, total_amount, notes) VALUES (?, ?, ?, ?, ?)',
        [id, now, data.status, data.total_amount, data.notes || ''],
        (err) => {
          if (err) reject(err);
          else resolve({ ...data, id, order_date: now });
        }
      );
    });
  }

  static async updateStatus(id: string, status: Order['status']): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static async getItems(order_id: string): Promise<OrderItem[]> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.all('SELECT * FROM order_items WHERE order_id = ?', [order_id], (err, rows: OrderItem[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  static async addItem(item: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const id = uuidv4();
    
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.run(
        'INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
        [id, item.order_id, item.product_id, item.quantity, item.unit_price],
        (err) => {
          if (err) reject(err);
          else resolve({ ...item, id });
        }
      );
    });
  }
}
