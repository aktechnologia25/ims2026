export interface Product {
  id: string
  name: string
  category: string
  description?: string
  unit_price: number // Price in PHP (₱)
  created_at: string
  updated_at: string
}

export interface Stock {
  id: string
  product_id: string
  quantity: number
  warehouse_location?: string
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
