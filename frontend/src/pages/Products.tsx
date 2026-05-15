import React, { useState, useEffect } from 'react'
import { productService } from '../services/api'
import { Product } from '../types'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    category: '',
    description: '',
    sku: '',
    serial_number: '',
    supplier: '',
    purchased_by: '',
    purchase_date: '',
    manufacturing_date: '',
    warranty_provider: '',
    warranty_expiry: '',
    warranty_terms: '',
    unit_price: 0,
  })

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

  function startEdit(product: Product) {
    const { id, created_at, updated_at, ...rest } = product
    setNewProduct(rest)
    setEditingId(id)
    setShowForm(true)
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingId) {
        await productService.update(editingId, newProduct)
        setEditingId(null)
      } else {
        await productService.create(newProduct)
      }
      setNewProduct({
        name: '',
        category: '',
        description: '',
        sku: '',
        serial_number: '',
        supplier: '',
        purchased_by: '',
        purchase_date: '',
        manufacturing_date: '',
        warranty_provider: '',
        warranty_expiry: '',
        warranty_terms: '',
        unit_price: 0,
      })
      setShowForm(false)
      loadProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
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

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Product'}
      </button>

      {showForm && (
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
            type="text"
            placeholder="SKU"
            value={newProduct.sku}
            onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
          />
          <input
            type="text"
            placeholder="Serial Number"
            value={newProduct.serial_number}
            onChange={(e) => setNewProduct({ ...newProduct, serial_number: e.target.value })}
          />
          <input
            type="text"
            placeholder="Supplier"
            value={newProduct.supplier}
            onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
          />
          <input
            type="text"
            placeholder="Purchased By"
            value={newProduct.purchased_by}
            onChange={(e) => setNewProduct({ ...newProduct, purchased_by: e.target.value })}
          />
          <input
            type="date"
            placeholder="Purchase Date"
            value={newProduct.purchase_date || ''}
            onChange={(e) => setNewProduct({ ...newProduct, purchase_date: e.target.value })}
          />
          <input
            type="date"
            placeholder="Manufacturing Date"
            value={newProduct.manufacturing_date || ''}
            onChange={(e) => setNewProduct({ ...newProduct, manufacturing_date: e.target.value })}
          />
          <input
            type="text"
            placeholder="Warranty Provider"
            value={newProduct.warranty_provider}
            onChange={(e) => setNewProduct({ ...newProduct, warranty_provider: e.target.value })}
          />
          <input
            type="date"
            placeholder="Warranty Expiry"
            value={newProduct.warranty_expiry || ''}
            onChange={(e) => setNewProduct({ ...newProduct, warranty_expiry: e.target.value })}
          />
          <textarea
            placeholder="Warranty Terms"
            value={newProduct.warranty_terms}
            onChange={(e) => setNewProduct({ ...newProduct, warranty_terms: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Unit Price"
            value={newProduct.unit_price}
            onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) || 0 })}
            required
            min="0"
            step="0.01"
          />
          <button type="submit">{editingId ? 'Update Product' : 'Add Product'}</button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Supplier</th>
            <th>Purchased By</th>
            <th>Purchase Date</th>
            <th>Warranty Expiry</th>
            <th>Unit Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.supplier || '—'}</td>
              <td>{product.purchased_by || '—'}</td>
              <td>{product.purchase_date ? new Date(product.purchase_date).toLocaleDateString() : '—'}</td>
              <td>{product.warranty_expiry ? new Date(product.warranty_expiry).toLocaleDateString() : '—'}</td>
              <td>₱{product.unit_price.toFixed(2)}</td>
              <td>
                <button onClick={() => startEdit(product)}>Edit</button>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
