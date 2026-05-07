# GitHub Copilot Instructions for IMS Codebase

## Quick Project Overview
This is a full-stack Inventory Management System (IMS) for an Aircon dealer/installer business. It tracks products (Aircon parts), warehouse stock levels, and customer orders. Built with Express.js backend, React frontend, and SQLite database.

**Key Pattern**: Monorepo with separate backend/frontend workspaces. All database operations use SQLite with Promise-wrapped queries.

## Architecture & Key Decisions

### Database Layer (SQLite - `backend/src/models/`)
- **Why SQLite**: Simplifies deployment (file-based), no external DB setup needed
- **Structure**: 4 tables with foreign keys: `products`, `stock`, `orders`, `order_items`
- **All models use static methods**: `ProductModel.getAll()`, `StockModel.updateQuantity(product_id, change)`
- **Pattern**: Wrap sqlite3 callbacks in Promises - reject on error, resolve with results

### REST API Design (`backend/src/routes/`)
- **Naming**: Resource-based routes like `/api/products`, `/api/stock`, `/api/orders`
- **Stock Logic**: Automatic deduction happens in `orders.ts` POST handler - for each item, call `StockModel.updateQuantity(product_id, -quantity)`
- **Error Pattern**: Catch errors in route handlers, respond with status + message JSON

### Frontend Architecture (`frontend/src/`)
- **Pages**: Dashboard (stats), Products (CRUD), Stock (low-stock view), Orders (status management)
- **API Service**: `services/api.ts` exports `productService`, `stockService`, `orderService` - all use axios
- **Proxy Config**: `vite.config.ts` routes `/api/*` to backend on port 3000
- **Types**: Centralized in `types/index.ts` - matches backend models (Product, Stock, Order, OrderItem)

## Developer Workflows

### Local Development
```bash
npm install              # Root: installs both backend & frontend
npm run dev             # Runs backend (port 3000) + frontend (port 5173) concurrently
```

### Build & Deploy
```bash
npm run build           # Builds both backend (dist/) and frontend (dist/)
npm start               # Runs backend only (for production)
```

### Adding a Feature
1. **New product field**: Add to Product interface in `frontend/src/types/index.ts` + update `ProductModel` in backend
2. **New stock query**: Add method to `StockModel` class, expose via new `/stock/*` route
3. **New order status**: Add to `Order['status']` type, handle in `orders.ts` PATCH route

## Important Patterns to Maintain

### Database Operations
- All methods return Promises (not callbacks)
- Use parameterized queries: `db.run('INSERT INTO ... VALUES (?, ?)', [val1, val2], callback)`
- UUIDs for all primary keys: `import { v4 as uuidv4 } from 'uuid'`
- Timestamps: Use `CURRENT_TIMESTAMP` for DB fields, `new Date().toISOString()` for app

### Frontend Components
- Use React hooks: `useState` for state, `useEffect` for side effects
- Fetch on mount: `useEffect(() => { loadData() }, [])`
- Service calls wrapped in try/catch with error logging to console
- Form submissions: prevent default, validate, call service, then reload data

### Stock Deductions & Order Flow
- **Critical**: When order created, stock MUST be reduced
- Location: `backend/src/routes/orders.ts` in POST handler
- For each item in order: `await StockModel.updateQuantity(product_id, -quantity)`
- If stock update fails, the entire order creation should fail (wrap in transaction if needed)

### API Error Handling
- Return appropriate HTTP status: 400 (bad request), 404 (not found), 500 (server error)
- Response format: `{ error: string, message?: string }`
- Frontend: Check `response.data.error` after catch blocks

## File Organization Rules

- **Backend models**: One model per entity in `backend/src/models/`
- **Backend routes**: One file per resource type in `backend/src/routes/`
- **Frontend pages**: One file per page in `frontend/src/pages/`
- **Shared types**: Always in `frontend/src/types/index.ts` - keep backend types inline
- **Database**: `database/inventory.db` is the SQLite file, migrations in `database/migrations/`

## Critical Files by Purpose

| Purpose | File Path |
|---------|-----------|
| Start backend server | `backend/src/index.ts` |
| Database schema & init | `backend/src/models/database.ts` |
| Product CRUD logic | `backend/src/models/product.ts` |
| Stock operations | `backend/src/models/stock.ts` |
| Order logic | `backend/src/models/order.ts` |
| Products API | `backend/src/routes/products.ts` |
| Stock API | `backend/src/routes/stock.ts` |
| Orders API | `backend/src/routes/orders.ts` |
| API client | `frontend/src/services/api.ts` |
| Type definitions | `frontend/src/types/index.ts` |
| Main app | `frontend/src/App.tsx` |

## Common Debugging Steps

1. **Backend won't start**: Check `database/inventory.db` permissions or run `npm install -w backend` for missing deps
2. **Frontend can't reach backend**: Verify backend running on port 3000, check `frontend/vite.config.ts` proxy config
3. **Stock not updating**: Check `orders.ts` has `await StockModel.updateQuantity()` call, verify product exists first
4. **Database locked**: Kill any other backend process using the DB (SQLite is single-writer)
5. **Type errors in frontend**: Ensure types in `types/index.ts` match backend response shape

## Next Steps / Future Work

- Add authentication layer (JWT in middleware)
- Implement audit logging for stock changes (add `audit_logs` table)
- CSV import for bulk product upload
- WebSocket for real-time low-stock alerts
- Role-based access control (admin vs user views)
- Barcode scanning module for stock intake

---

**When prompting AI agents**: Refer to this file for context. Example: "Add low-stock email alerts - see stock deduction pattern in orders.ts for transaction safety"
