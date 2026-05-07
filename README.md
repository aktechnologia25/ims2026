# Inventory Management System (IMS) for Aircon Dealer & Installer

Full-stack inventory management system built with Express, React, and SQLite for tracking Aircon parts, stock levels, and orders.

## Project Structure

```
ims/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   ├── models/         # Database models (Product, Stock, Order)
│   │   ├── routes/         # API routes (/products, /stock, /orders)
│   │   ├── controllers/    # Business logic (for future expansion)
│   │   ├── middleware/     # Auth, validation (for future expansion)
│   │   └── utils/          # Helper functions
│   └── package.json
├── frontend/               # React TypeScript app
│   ├── src/
│   │   ├── pages/         # Dashboard, Products, Stock, Orders
│   │   ├── components/    # Reusable UI components (for future)
│   │   ├── services/      # API client (api.ts)
│   │   ├── types/         # TypeScript interfaces
│   │   └── App.tsx        # Main app component
│   └── package.json
├── database/              # SQLite database
│   ├── inventory.db       # Main database file
│   └── migrations/        # Schema evolution scripts
└── .github/
    └── copilot-instructions.md  # This file
```

## Core Features

### 1. **Products Management**
- CRUD operations for Aircon products (compressors, refrigerants, filters, etc.)
- Track by category and unit price
- API: `GET/POST /api/products`, `PUT/DELETE /api/products/:id`

### 2. **Stock Management**
- Track inventory quantities per product
- Warehouse location mapping
- Low stock alerts (threshold: 10 units)
- API: `GET /api/stock/product/:id`, `PATCH /api/stock/update/:id`

### 3. **Order Management**
- Create orders with multiple items
- Automatic stock deduction on order creation
- Order status tracking (pending/completed/cancelled)
- API: `POST /api/orders`, `PATCH /api/orders/:id/status`

## Key Architecture Decisions

### SQLite Database
- **Why**: Simplifies deployment, no external database setup, file-based persistence
- **Schema**: 4 tables (products, stock, orders, order_items) with foreign keys
- Location: `database/inventory.db`

### Monorepo Structure
- Backend and frontend as separate workspaces
- Root `package.json` enables `npm run dev` for concurrent development
- Shared types between frontend and backend services

### API Design
- RESTful with standard HTTP methods
- Resource-centric routes: `/api/{resource}`
- Error responses include status codes and messages
- Request/response body: JSON

## Development Setup

### Prerequisites
- Node.js 16+ (with npm)
- Windows PowerShell or equivalent terminal

### Installation
```bash
cd c:\Users\Administrator\ims
npm install
```

### Run Development Server
```bash
npm run dev
```
This runs both backend (port 3000) and frontend (port 5173) concurrently.

### Build for Production
```bash
npm run build
```
Outputs backend dist/ and frontend dist/

### Start Production Backend
```bash
npm start
```

## Important Patterns & Conventions

### Database Operations
- All DB calls wrapped in Promises for consistency
- Models use static methods: `ProductModel.getAll()`, `ProductModel.create()`
- Location: `backend/src/models/*.ts`
- **Pattern**: Promise-based callbacks, error propagation through reject()

### Frontend API Calls
- Centralized in `frontend/src/services/api.ts`
- axios instance with `/api` baseURL
- Service methods: `productService.getAll()`, `stockService.updateQuantity()`
- Loading states managed per-page with useState hooks

### Type Safety
- Frontend types in `frontend/src/types/index.ts` (Product, Stock, Order interfaces)
- Backend types inline in models and routes
- Avoid `any` type - use proper interfaces

### Stock Deduction Logic
- **Location**: `backend/src/routes/orders.ts` (POST /orders)
- When order created: quantity_change = -item.quantity
- Direct SQL: `UPDATE stock SET quantity = quantity + ?, ...`

## Common Tasks

### Add a New Aircon Product Category
1. Backend: No schema changes needed (category is string field)
2. Frontend: Product form already supports category input
3. Test: POST to `/api/products` with new category

### Query Low Stock Items
```bash
curl http://localhost:3000/api/stock/low-stock/all?threshold=10
```

### View All Orders with Details
```javascript
// In frontend component:
const response = await orderService.getById(orderId);
console.log(response.data.items); // Contains all order items
```

### Update Stock Manually
```bash
curl -X PATCH http://localhost:3000/api/stock/update/{product_id} \
  -H "Content-Type: application/json" \
  -d '{"quantity_change": 50}'
```

## Testing Strategy

### Backend
- Integration tests for models (connect to test DB)
- Route tests verify HTTP responses
- Command: `npm test -w backend`

### Frontend
- Component tests for pages
- Service tests mock axios
- Command: `npm test -w frontend`

## Deployment Considerations

### Database Persistence
- SQLite file must be writable: `database/inventory.db`
- For Docker: mount volume at `/app/database`

### Environment Variables
- `.env` file (backend root)
- `SQLITE_PATH`: database location (default: database/inventory.db)
- `PORT`: server port (default: 3000)

### CORS Configuration
- Currently allows all origins: `cors()` in index.ts
- For production: specify allowed origins: `cors({ origin: 'https://yourdomain.com' })`

## Troubleshooting

**"Cannot find module 'express'"**: Run `npm install -w backend`

**Database locked error**: Ensure only one backend instance running

**Frontend can't reach API**: Check proxy config in `frontend/vite.config.ts` points to correct backend port

**Stock shows 0 after order**: Verify order was created successfully and StockModel.updateQuantity called

## Future Enhancements

- [ ] User authentication (JWT)
- [ ] Audit logging for stock changes
- [ ] Batch import (CSV upload)
- [ ] Advanced filtering and search
- [ ] Order receipt PDF generation
- [ ] Real-time notifications with WebSocket
- [ ] Role-based access (admin/user)
- [ ] Barcode scanning integration
