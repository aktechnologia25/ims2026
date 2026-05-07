import React, { useState, useEffect } from 'react'
import { orderService, productService } from '../services/api'
import { Order, Product } from '../types'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const ordersRes = await orderService.getAll()
      const productsRes = await productService.getAll()
      setOrders(ordersRes.data)
      setProducts(productsRes.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(orderId: string, status: string) {
    try {
      await orderService.updateStatus(orderId, status)
      loadData()
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="orders">
      <h2>Orders</h2>

      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id.substring(0, 8)}</td>
              <td>{new Date(order.order_date).toLocaleDateString()}</td>
              <td>₱{order.total_amount.toFixed(2)}</td>
              <td>{order.status}</td>
              <td>
                <select                  title="Order Status"                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
