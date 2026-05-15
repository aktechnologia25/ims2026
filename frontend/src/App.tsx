import React from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Products from './pages/Products'
import StockPage from './pages/Stock'
import Orders from './pages/Orders'
import './App.css'

function AppShell() {
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <div className="app">
      <nav className="navbar">
        <h1>Senfrost Warehouse Inventory System</h1>

        {isAuthenticated && (
          <>
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/stock">Stock</Link></li>
              <li><Link to="/orders">Orders</Link></li>
            </ul>

            <div className="navbar-actions">
              <span className="navbar-user">{user?.username}</span>
              <button type="button" onClick={() => logout()}>
                Logout
              </button>
            </div>
          </>
        )}
      </nav>

      <main className="content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
