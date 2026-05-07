import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './database';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Stock {
  id: string;
  product_id: string;
  quantity: number;
  warehouse_location?: string;
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

  static async updateQuantity(product_id: string, quantity_change: number): Promise<void> {
    const supabase: SupabaseClient = getDatabase();
    
    const { data: stock, error: selectError } = await supabase
      .from('stock')
      .select('quantity')
      .eq('product_id', product_id)
      .single();

    if (selectError) throw selectError;
    
    const newQuantity = (stock?.quantity || 0) + quantity_change;
    const { error } = await supabase
      .from('stock')
      .update({ quantity: newQuantity, last_updated: new Date().toISOString() })
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
