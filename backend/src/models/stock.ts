import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './database';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Stock {
  id: string;
  product_id: string;
  quantity: number;
  warehouse_location?: string;
  batch_number?: string;
  received_date?: string;
  reorder_threshold?: number;
  last_updated: string;
}

export class StockModel {
  static async getByProductId(product_id: string): Promise<Stock | null> {
    const supabase: SupabaseClient = getDatabase();
    const { data, error } = await supabase
      .from('stock')
      .select('*')
      .eq('product_id', product_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async getAll(): Promise<Stock[]> {
    const supabase: SupabaseClient = getDatabase();
    const { data, error } = await supabase
      .from('stock')
      .select('*')
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getAllLowStock(threshold: number = 10): Promise<Stock[]> {
    const supabase: SupabaseClient = getDatabase();
    const { data, error } = await supabase
      .from('stock')
      .select('*')
      .lt('quantity', threshold)
      .order('quantity', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async updateQuantity(
    product_id: string,
    quantity_change: number,
    updates: Partial<Stock> = {}
  ): Promise<void> {
    const supabase: SupabaseClient = getDatabase();
    
    const { data: stock, error: selectError } = await supabase
      .from('stock')
      .select('*')
      .eq('product_id', product_id)
      .single();

    if (selectError) throw selectError;
    
    const newQuantity = (stock?.quantity || 0) + quantity_change;
    const payload: Partial<Stock> = {
      quantity: newQuantity,
      last_updated: new Date().toISOString(),
    };

    if (updates.warehouse_location !== undefined) payload.warehouse_location = updates.warehouse_location;
    if (updates.batch_number !== undefined) payload.batch_number = updates.batch_number;
    if (updates.received_date !== undefined) payload.received_date = updates.received_date;
    if (updates.reorder_threshold !== undefined) payload.reorder_threshold = updates.reorder_threshold;

    const { error } = await supabase
      .from('stock')
      .update(payload)
      .eq('product_id', product_id);

    if (error) throw error;
  }

  static async initializeStock(product_id: string): Promise<Stock> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const supabase: SupabaseClient = getDatabase();

    const { data, error } = await supabase
      .from('stock')
      .insert([{ id, product_id, quantity: 0, last_updated: now }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
