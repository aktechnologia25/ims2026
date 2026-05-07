import React, { useState, useEffect } from 'react'
import { productService } from '../services/api'
import { Product } from '../types'

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalValue: 0 })

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await productService.getAll()
        const products: Product[] = response.data
        const totalValue = products.reduce((sum, p) => sum + p.unit_price, 0)
        setStats({
          totalProducts: products.length,
          totalValue
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }
    loadStats()
  }, [])

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
    </div>
  )
}
