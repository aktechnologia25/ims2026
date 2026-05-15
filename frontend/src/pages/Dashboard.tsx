import React, { useState, useEffect } from 'react'
import { productService, stockService, orderService } from '../services/api'
import { Product, Stock, Order } from '../types'

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalValue: 0 })
  const [reportType, setReportType] = useState<string>('overview')
  const [reportData, setReportData] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    loadReport(reportType)
  }, [reportType, products, stocks, orders])

  async function loadDashboard() {
    try {
      const [productsRes, stocksRes, ordersRes] = await Promise.all([
        productService.getAll(),
        stockService.getAll(),
        orderService.getAll(),
      ])
      const prods: Product[] = productsRes.data
      const stks: Stock[] = stocksRes.data
      const ords: Order[] = ordersRes.data

      setProducts(prods)
      setStocks(stks)
      setOrders(ords)

      const totalValue = prods.reduce((sum, p) => sum + p.unit_price, 0)
      setStats({
        totalProducts: prods.length,
        totalValue,
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    }
  }

  async function loadReport(type: string) {
    try {
      switch (type) {
        case 'overview':
          setReportData({
            type: 'overview',
            totalProducts: products.length,
            totalInventoryValue: products.reduce((s, p) => s + p.unit_price, 0),
            totalStockItems: stocks.reduce((s, st) => s + st.quantity, 0),
            lowStockCount: stocks.filter((s) => s.quantity <= (s.reorder_threshold ?? 10)).length,
            pendingOrders: orders.filter((o) => o.status === 'pending').length,
            completedOrders: orders.filter((o) => o.status === 'completed').length,
          })
          break

        case 'low-stock':
          const lowStockItems = stocks
            .filter((s) => s.quantity <= (s.reorder_threshold ?? 10))
            .map((s) => ({
              product: products.find((p) => p.id === s.product_id)?.name || 'Unknown',
              quantity: s.quantity,
              reorderLevel: s.reorder_threshold ?? 10,
              warehouse: s.warehouse_location || 'N/A',
            }))
          setReportData({
            type: 'low-stock',
            items: lowStockItems,
          })
          break

        case 'top-value':
          const topValueProducts = [...products]
            .sort((a, b) => b.unit_price - a.unit_price)
            .slice(0, 10)
            .map((p) => {
              const stock = stocks.find((s) => s.product_id === p.id)
              return {
                name: p.name,
                unitPrice: p.unit_price,
                stock: stock?.quantity || 0,
                totalValue: (stock?.quantity || 0) * p.unit_price,
              }
            })
          setReportData({
            type: 'top-value',
            items: topValueProducts,
          })
          break

        case 'orders':
          const orderStats = {
            total: orders.length,
            pending: orders.filter((o) => o.status === 'pending').length,
            completed: orders.filter((o) => o.status === 'completed').length,
            cancelled: orders.filter((o) => o.status === 'cancelled').length,
            totalRevenue: orders
              .filter((o) => o.status === 'completed')
              .reduce((s, o) => s + o.total_amount, 0),
          }
          setReportData({
            type: 'orders',
            stats: orderStats,
          })
          break

        case 'inventory-health':
          const totalStockValue = stocks.reduce((sum, s) => {
            const product = products.find((p) => p.id === s.product_id)
            return sum + (product ? product.unit_price * s.quantity : 0)
          }, 0)
          const healthReport = {
            totalItems: stocks.length,
            totalQuantity: stocks.reduce((s, st) => s + st.quantity, 0),
            totalValue: totalStockValue,
            averageValuePerItem: stocks.length > 0 ? totalStockValue / stocks.length : 0,
            overstocked: stocks.filter(
              (s) => s.quantity > (s.reorder_threshold ?? 10) * 3
            ).length,
            understocked: stocks.filter((s) => s.quantity <= (s.reorder_threshold ?? 10)).length,
          }
          setReportData({
            type: 'inventory-health',
            data: healthReport,
          })
          break

        default:
          break
      }
    } catch (error) {
      console.error('Failed to load report:', error)
    }
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Inventory Value (PHP)</h3>
          <p className="stat-value">₱{stats.totalValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="report-section">
        <label htmlFor="report-select">Select Report:</label>
        <select
          id="report-select"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="overview">Overview</option>
          <option value="low-stock">Low Stock Items</option>
          <option value="top-value">Top Value Products</option>
          <option value="orders">Order Statistics</option>
          <option value="inventory-health">Inventory Health</option>
        </select>
      </div>

      {reportData && (
        <div className="report-content">
          {reportData.type === 'overview' && (
            <div className="report-grid">
              <div className="report-card">
                <h4>Total Products</h4>
                <p>{reportData.totalProducts}</p>
              </div>
              <div className="report-card">
                <h4>Total Inventory Value</h4>
                <p>₱{reportData.totalInventoryValue.toFixed(2)}</p>
              </div>
              <div className="report-card">
                <h4>Total Stock Items</h4>
                <p>{reportData.totalStockItems}</p>
              </div>
              <div className="report-card">
                <h4>Low Stock Items</h4>
                <p>{reportData.lowStockCount}</p>
              </div>
              <div className="report-card">
                <h4>Pending Orders</h4>
                <p>{reportData.pendingOrders}</p>
              </div>
              <div className="report-card">
                <h4>Completed Orders</h4>
                <p>{reportData.completedOrders}</p>
              </div>
            </div>
          )}

          {reportData.type === 'low-stock' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Qty</th>
                  <th>Reorder Level</th>
                  <th>Warehouse</th>
                </tr>
              </thead>
              <tbody>
                {reportData.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td>{item.product}</td>
                    <td>{item.quantity}</td>
                    <td>{item.reorderLevel}</td>
                    <td>{item.warehouse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportData.type === 'top-value' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Stock</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {reportData.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>₱{item.unitPrice.toFixed(2)}</td>
                    <td>{item.stock}</td>
                    <td>₱{item.totalValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportData.type === 'orders' && (
            <div className="report-grid">
              <div className="report-card">
                <h4>Total Orders</h4>
                <p>{reportData.stats.total}</p>
              </div>
              <div className="report-card">
                <h4>Pending</h4>
                <p>{reportData.stats.pending}</p>
              </div>
              <div className="report-card">
                <h4>Completed</h4>
                <p>{reportData.stats.completed}</p>
              </div>
              <div className="report-card">
                <h4>Cancelled</h4>
                <p>{reportData.stats.cancelled}</p>
              </div>
              <div className="report-card">
                <h4>Total Revenue</h4>
                <p>₱{reportData.stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          )}

          {reportData.type === 'inventory-health' && (
            <div className="report-grid">
              <div className="report-card">
                <h4>Total Items</h4>
                <p>{reportData.data.totalItems}</p>
              </div>
              <div className="report-card">
                <h4>Total Quantity</h4>
                <p>{reportData.data.totalQuantity}</p>
              </div>
              <div className="report-card">
                <h4>Total Value</h4>
                <p>₱{reportData.data.totalValue.toFixed(2)}</p>
              </div>
              <div className="report-card">
                <h4>Avg Value/Item</h4>
                <p>₱{reportData.data.averageValuePerItem.toFixed(2)}</p>
              </div>
              <div className="report-card">
                <h4>Overstocked</h4>
                <p>{reportData.data.overstocked}</p>
              </div>
              <div className="report-card">
                <h4>Understocked</h4>
                <p>{reportData.data.understocked}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
