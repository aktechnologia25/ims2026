import React, { useState, useEffect } from 'react'
import { stockService, productService } from '../services/api'
import { Stock, Product } from '../types'

export default function StockPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [lowStockOnly, setLowStockOnly] = useState(false)

  useEffect(() => {
    loadData()
  }, [lowStockOnly])

  async function loadData() {
    try {
      const productsRes = await productService.getAll()
      setProducts(productsRes.data)
      
      if (lowStockOnly) {
        const stockRes = await stockService.getLowStock(10)
        setStocks(stockRes.data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  function getProductName(product_id: string): string {
    return products.find(p => p.id === product_id)?.name || 'Unknown'
  }

  return (
    <div className="stock">
      <h2>Stock Management</h2>
      
      <label>
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => setLowStockOnly(e.target.checked)}
        />
        Show Low Stock Only
      </label>

      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td>{getProductName(stock.product_id)}</td>
              <td>{stock.quantity}</td>
              <td>{stock.warehouse_location || 'N/A'}</td>
              <td>{new Date(stock.last_updated).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
