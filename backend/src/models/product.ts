import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './database';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export class ProductModel {
  static async getAll(): Promise<Product[]> {
    const supabase: SupabaseClient = getDatabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Product | null> {
    const supabase: SupabaseClient = getDatabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async create(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const supabase: SupabaseClient = getDatabase();

    const { data: result, error } = await supabase
      .from('products')
      .insert([{ id, ...data, created_at: now, updated_at: now }])
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async update(id: string, data: Partial<Product>): Promise<void> {
    const now = new Date().toISOString();
    const supabase: SupabaseClient = getDatabase();

    const { error } = await supabase
      .from('products')
      .update({ ...data, updated_at: now })
      .eq('id', id);

    if (error) throw error;
  }

  static async delete(id: string): Promise<void> {
    const supabase: SupabaseClient = getDatabase();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
