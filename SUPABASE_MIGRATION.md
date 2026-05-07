# Supabase Migration Guide

## What's Been Done

✅ **Backend Models Migrated**: All database models (product.ts, stock.ts, order.ts) now use Supabase PostgreSQL queries instead of SQLite callbacks.

✅ **Database Schema Created**: PostgreSQL schema is defined in `database/supabase-schema.sql` with:
- **products** table: UUID PK, name, category, description, unit_price (NUMERIC)
- **stock** table: UUID PK, product_id FK, quantity INT, warehouse_location, last_updated
- **orders** table: UUID PK, order_date, status (pending/completed/cancelled), total_amount, notes
- **order_items** table: UUID PK, order_id FK, product_id FK, quantity, unit_price
- Indexes on frequently queried columns
- Row-Level Security (RLS) policies enabled

✅ **Dependencies Updated**: package.json now includes @supabase/supabase-js

## Next Steps to Complete Migration

### Step 1: Set Up Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create an account
2. Create a new project (or use the provided URL: https://fgzgiepjoapmsfgxgfta.supabase.co)
3. Go to Project Settings → API to get:
   - **Project URL**: Your Supabase URL
   - **Service Role Key**: Copy this (anon key won't work for server operations)

### Step 2: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `database/supabase-schema.sql`
4. Paste into the SQL editor and click **Run**

This creates all 4 tables with proper constraints and indexes.

### Step 3: Configure Backend Environment

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://fgzgiepjoapmsfgxgfta.supabase.co
   SUPABASE_KEY=your-service-role-key-from-step-1
   ```

### Step 4: Test the Backend

```bash
cd backend
npm install
npm run dev
```

The backend should connect to Supabase successfully. You'll see logs like:
```
✓ Connected to Supabase at https://fgzgiepjoapmsfgxgfta.supabase.co
Server running on port 3000
```

### Step 5: Seed Initial Data (Optional)

To populate products:

```bash
# Run the seeding script
npm run seed
```

Or manually insert via Supabase SQL Editor:
```sql
INSERT INTO products (id, name, category, description, unit_price, created_at, updated_at) 
VALUES 
  ('uuid-here', 'Split AC Unit', 'Air Conditioners', 'Wall-mounted split AC', 45000.00, NOW(), NOW()),
  ('uuid-here', 'Copper Pipes', 'Accessories', '1/2" copper pipes', 1500.00, NOW(), NOW());
```

## Architecture Summary

```
Frontend (React/Vite)
  ↓ (HTTPS REST)
Backend (Express/TypeScript)
  ↓ (Supabase Client SDK)
Supabase PostgreSQL Database
```

## Key Changes from SQLite

| SQLite | Supabase |
|--------|----------|
| Callbacks (db.run/get/all) | Async/await with Promises |
| Relative file path | Cloud URL with auth token |
| Single-file DB | Managed PostgreSQL cluster |
| No authentication | Service role key required |
| INTEGER id | UUID id (primary key) |

## Troubleshooting

### Backend Connection Failed
- [ ] Check SUPABASE_URL is correct format
- [ ] Check SUPABASE_KEY is the **service_role** key (not anon)
- [ ] Verify .env file is in `backend/` directory
- [ ] Check backend can reach supabase.co (firewall/VPN issue?)

### Tables Don't Exist
- [ ] Go to Supabase SQL Editor
- [ ] Run `database/supabase-schema.sql` queries
- [ ] Check for SQL errors in editor output

### Stock Update Fails
- The new stock.ts uses two-step updates (SELECT then UPDATE) instead of SQLite arithmetic
- This requires the product to have an existing stock record
- Call `StockModel.initializeStock()` for new products first

### Type Errors with UUIDs
- All IDs are now UUIDs (strings)
- Update any frontend code expecting numeric IDs
- NUMERIC(12,2) becomes `number` in TypeScript

## Frontend Configuration

No changes needed! The Vite proxy in `frontend/vite.config.ts` already routes `/api/*` to the backend.

Test with:
```bash
cd frontend
npm run dev
```

Then visit http://localhost:5173

## Production Checklist

- [ ] Create separate "production" database (don't use development data)
- [ ] Enable RLS policies for multi-tenant safety
- [ ] Set up automated backups in Supabase Settings
- [ ] Use environment-specific SUPABASE_KEY values
- [ ] Set NODE_ENV=production in backend
- [ ] Test all CRUD operations in staging environment
- [ ] Document the database schema for team
