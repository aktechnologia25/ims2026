import React, { useState, useEffect } from 'react'
import { asArray, orderService, productService, stockService } from '../services/api'
import { Order, Product, Stock } from '../types'

interface OrderItemForm {
  product_id: string
  quantity: number
  unit_price: number
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<(Order & { items: any[] }) | null>(null)
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([
    { product_id: '', quantity: 0, unit_price: 0 },
  ])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [ordersRes, productsRes, stocksRes] = await Promise.all([
        orderService.getAll(),
        productService.getAll(),
        stockService.getAll(),
      ])
      setOrders(asArray<Order>(ordersRes.data, 'orders'))
      setProducts(asArray<Product>(productsRes.data, 'products'))
      setStocks(asArray<Stock>(stocksRes.data, 'stock'))
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadOrderDetails(orderId: string) {
    try {
      const response = await orderService.getById(orderId)
      setSelectedOrder({
        ...response.data,
        items: asArray(response.data?.items, 'order items'),
      })
    } catch (error) {
      console.error('Failed to load order details:', error)
    }
  }

  function getProductName(productId: string): string {
    return products.find((p) => p.id === productId)?.name || 'Unknown'
  }

  function getProductPrice(productId: string): number {
    return products.find((p) => p.id === productId)?.unit_price || 0
  }

  function getProductStock(productId: string): number {
    return stocks.find((s) => s.product_id === productId)?.quantity || 0
  }

  function updateOrderItem(index: number, field: string, value: any) {
    const updated = [...orderItems]
    if (field === 'product_id') {
      updated[index].product_id = value
      updated[index].unit_price = getProductPrice(value)
    } else if (field === 'quantity') {
      updated[index].quantity = parseInt(value, 10) || 0
    }
    setOrderItems(updated)
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault()

    const validItems = orderItems.filter((item) => item.product_id && item.quantity > 0)
    if (validItems.length === 0) {
      return alert('Please add at least one item with quantity > 0')
    }

    // Check stock availability
    for (const item of validItems) {
      const available = getProductStock(item.product_id)
      if (item.quantity > available) {
        return alert(
          `Insufficient stock for ${getProductName(item.product_id)}. Available: ${available}, Requested: ${item.quantity}`
        )
      }
    }

    try {
      await orderService.create({
        items: validItems,
        notes,
      })
      setOrderItems([{ product_id: '', quantity: 0, unit_price: 0 }])
      setNotes('')
      setShowCreateForm(false)
      loadData()
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Failed to create order')
    }
  }

  async function handleUpdateStatus(orderId: string, status: string) {
    try {
      await orderService.updateStatus(orderId, status)
      loadData()
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="orders">
      <h2>Orders Management</h2>

      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create Order'}
      </button>

      {showCreateForm && (
        <form onSubmit={handleCreateOrder} className="form order-form">
          <h3>New Order</h3>

          {orderItems.map((item, index) => (
            <div key={index} className="order-item-row">
              <label htmlFor={`product-${index}`}>Product</label>
              <select
                id={`product-${index}`}
                value={item.product_id}
                onChange={(e) => updateOrderItem(index, 'product_id', e.target.value)}
                required
              >
                <option value="">Select product</option>
                {products.map((p) => {
                  const availStock = getProductStock(p.id)
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} - ₱{p.unit_price.toFixed(2)} (Stock: {availStock})
                    </option>
                  )
                })}
              </select>

              <input
                type="number"
                placeholder="Quantity"
                min="1"
                value={item.quantity}
                onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                required
              />

              <span>₱{(item.quantity * item.unit_price).toFixed(2)}</span>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => setOrderItems(orderItems.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setOrderItems([...orderItems, { product_id: '', quantity: 0, unit_price: 0 }])}
          >
            Add Item
          </button>

          <textarea
            placeholder="Order Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="order-summary">
            <strong>
              Total: ₱
              {orderItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toFixed(2)}
            </strong>
          </div>

          <button type="submit">Create Order</button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Items</th>
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
              <td>
                <button onClick={() => loadOrderDetails(order.id)}>View Items</button>
              </td>
              <td>₱{order.total_amount.toFixed(2)}</td>
              <td>{order.status}</td>
              <td>
                <select
                  title="Order Status"
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
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

      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <h3>Order Details - {selectedOrder.id.substring(0, 8)}</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td>{getProductName(item.product_id)}</td>
                    <td>{item.quantity}</td>
                    <td>₱{item.unit_price.toFixed(2)}</td>
                    <td>₱{(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
