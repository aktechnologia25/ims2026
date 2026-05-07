import React, { useState, useEffect } from 'react'
import { productService } from '../services/api'
import { Product } from '../types'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [newProduct, setNewProduct] = useState({ name: '', category: '', unit_price: 0 })

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      const response = await productService.getAll()
      setProducts(response.data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    try {
      await productService.create(newProduct)
      setNewProduct({ name: '', category: '', unit_price: 0 })
      loadProducts()
    } catch (error) {
      console.error('Failed to add product:', error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure?')) {
      try {
        await productService.delete(id)
        loadProducts()
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="products">
      <h2>Products</h2>
      
      <form onSubmit={handleAddProduct} className="form">
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Unit Price"
          value={newProduct.unit_price}
          onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) })}
          required
        />
        <button type="submit">Add Product</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Unit Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>${product.unit_price.toFixed(2)}</td>
              <td>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
