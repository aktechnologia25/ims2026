import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './database';
import { SupabaseClient } from '@supabase/supabase-js';

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
    const supabase: SupabaseClient = getDatabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Order | null> {
    const supabase: SupabaseClient = getDatabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async create(data: Omit<Order, 'id' | 'order_date'>): Promise<Order> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const supabase: SupabaseClient = getDatabase();

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{ id, order_date: now, status: data.status, total_amount: data.total_amount, notes: data.notes || '' }])
      .select()
      .single();

    if (error) throw error;
    return order;
  }

  static async updateStatus(id: string, status: Order['status']): Promise<void> {
    const supabase: SupabaseClient = getDatabase();
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }

  static async getItems(order_id: string): Promise<OrderItem[]> {
    const supabase: SupabaseClient = getDatabase();
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id);

    if (error) throw error;
    return data || [];
  }

  static async addItem(item: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const id = uuidv4();
    const supabase: SupabaseClient = getDatabase();

    const { data: orderItem, error } = await supabase
      .from('order_items')
      .insert([{ id, order_id: item.order_id, product_id: item.product_id, quantity: item.quantity, unit_price: item.unit_price }])
      .select()
      .single();

    if (error) throw error;
    return orderItem;
  }
}
