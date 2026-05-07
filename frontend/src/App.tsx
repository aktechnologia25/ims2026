import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import StockPage from './pages/Stock'
import Orders from './pages/Orders'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h1>IMS - Aircon Inventory Management</h1>
          <ul>
            <li><a href="/">Dashboard</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/stock">Stock</a></li>
            <li><a href="/orders">Orders</a></li>
          </ul>
        </nav>
        
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
