-- Supabase PostgreSQL Schema for IMS Aircon (Philippine Peso - PHP)
-- Run these queries in your Supabase SQL editor

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  serial_number TEXT,
  supplier TEXT,
  purchased_by TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE,
  manufacturing_date TIMESTAMP WITH TIME ZONE,
  warranty_provider TEXT,
  warranty_expiry TIMESTAMP WITH TIME ZONE,
  warranty_terms TEXT,
  unit_price NUMERIC(10, 2) NOT NULL, -- Price in Philippine Peso (₱)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create stock table
CREATE TABLE IF NOT EXISTS stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  warehouse_location TEXT,
  batch_number TEXT,
  received_date TIMESTAMP WITH TIME ZONE,
  reorder_threshold INTEGER NOT NULL DEFAULT 10,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  total_amount NUMERIC(12, 2) NOT NULL, -- Total in Philippine Peso (₱)
  notes TEXT
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL -- Price in Philippine Peso (₱)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stock_product_id ON stock(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Enable Row Level Security (optional, for later auth implementation)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
