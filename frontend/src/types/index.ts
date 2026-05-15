export interface Product {
  id: string
  name: string
  category: string
  description?: string
  sku?: string
  serial_number?: string
  supplier?: string
  purchased_by?: string
  purchase_date?: string
  manufacturing_date?: string
  warranty_provider?: string
  warranty_expiry?: string
  warranty_terms?: string
  unit_price: number // Price in PHP (₱)
  created_at: string
  updated_at: string
}

export interface Stock {
  id: string
  product_id: string
  quantity: number
  warehouse_location?: string
  batch_number?: string
  received_date?: string
  reorder_threshold?: number
  last_updated: string
}

export interface Order {
  id: string
  order_date: string
  status: 'pending' | 'completed' | 'cancelled'
  total_amount: number // Total in PHP (₱)
  notes?: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number // Price in PHP (₱)
}
