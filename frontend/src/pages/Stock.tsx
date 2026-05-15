import React, { useState, useEffect } from 'react'
import { asArray, stockService, productService } from '../services/api'
import { Stock, Product } from '../types'

export default function StockPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stockAdjustment, setStockAdjustment] = useState({
    product_id: '',
    quantity_change: 0,
    warehouse_location: '',
    batch_number: '',
    received_date: '',
    reorder_threshold: 10,
  })

  useEffect(() => {
    loadData()
  }, [lowStockOnly])

  async function loadData() {
    try {
      setLoading(true)
      const productsRes = await productService.getAll()
      const stockRes = lowStockOnly ? await stockService.getLowStock(10) : await stockService.getAll()
      const loadedProducts = asArray<Product>(productsRes.data, 'products')
      const loadedStocks = asArray<Stock>(stockRes.data, 'stock')

      setProducts(loadedProducts)
      setStocks(loadedStocks)

      if (!stockAdjustment.product_id && loadedProducts.length > 0) {
        setStockAdjustment((prev) => ({ ...prev, product_id: loadedProducts[0].id }))
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getProductName(product_id: string): string {
    return products.find((p) => p.id === product_id)?.name || 'Unknown'
  }

  async function handleAdjustStock(e: React.FormEvent) {
    e.preventDefault()

    if (!stockAdjustment.product_id) {
      return alert('Please choose a product to adjust.')
    }

    try {
      await stockService.updateQuantity(stockAdjustment.product_id, stockAdjustment.quantity_change, {
        warehouse_location: stockAdjustment.warehouse_location || undefined,
        batch_number: stockAdjustment.batch_number || undefined,
        received_date: stockAdjustment.received_date || undefined,
        reorder_threshold: stockAdjustment.reorder_threshold,
      })
      setStockAdjustment((prev) => ({ ...prev, quantity_change: 0 }))
      loadData()
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="stock">
      <h2>Stock Management</h2>

      <label>
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => setLowStockOnly(e.target.checked)}
        />
        Show low stock only
      </label>

      <form onSubmit={handleAdjustStock} className="form">
        <label htmlFor="stock-product-select">Product</label>
        <select
          id="stock-product-select"
          value={stockAdjustment.product_id}
          onChange={(e) => setStockAdjustment({ ...stockAdjustment, product_id: e.target.value })}
          required
        >
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity change (+/-)"
          value={stockAdjustment.quantity_change}
          onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity_change: parseInt(e.target.value, 10) || 0 })}
          required
        />

        <input
          type="text"
          placeholder="Warehouse Location"
          value={stockAdjustment.warehouse_location}
          onChange={(e) => setStockAdjustment({ ...stockAdjustment, warehouse_location: e.target.value })}
        />

        <input
          type="text"
          placeholder="Batch Number"
          value={stockAdjustment.batch_number}
          onChange={(e) => setStockAdjustment({ ...stockAdjustment, batch_number: e.target.value })}
        />

        <input
          type="date"
          placeholder="Received Date"
          value={stockAdjustment.received_date}
          onChange={(e) => setStockAdjustment({ ...stockAdjustment, received_date: e.target.value })}
        />

        <input
          type="number"
          placeholder="Reorder Threshold"
          value={stockAdjustment.reorder_threshold}
          onChange={(e) => setStockAdjustment({ ...stockAdjustment, reorder_threshold: parseInt(e.target.value, 10) || 0 })}
          min={0}
        />

        <button type="submit">Adjust Stock</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Batch</th>
            <th>Received</th>
            <th>Reorder Level</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td>{getProductName(stock.product_id)}</td>
              <td>{stock.quantity}</td>
              <td>{stock.warehouse_location || 'N/A'}</td>
              <td>{stock.batch_number || '—'}</td>
              <td>{stock.received_date ? new Date(stock.received_date).toLocaleDateString() : '—'}</td>
              <td>{stock.reorder_threshold ?? '—'}</td>
              <td>{new Date(stock.last_updated).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
