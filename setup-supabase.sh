#!/bin/bash

# IMS Supabase Setup Script
# This script helps you set up the migrated IMS backend with Supabase

set -e

echo "================================"
echo "IMS Backend - Supabase Setup"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo "✓ npm found: $(npm --version)"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "✓ Dependencies installed"

# Check for .env file
echo ""
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env not found"
    echo "   Creating from template..."
    cp backend/.env.example backend/.env
    echo "   ⚠️  Please update backend/.env with your Supabase credentials:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_KEY (service_role key)"
else
    echo "✓ backend/.env found"
fi

echo ""
echo "================================"
echo "Next Steps:"
echo "================================"
echo ""
echo "1. Update backend/.env with Supabase credentials:"
echo "   - Get URL from: https://supabase.com → Projects → Project Settings → API"
echo "   - Get service_role key from same location"
echo ""
echo "2. Create tables in Supabase:"
echo "   - Go to Supabase SQL Editor"
echo "   - Run contents of: database/supabase-schema.sql"
echo ""
echo "3. Start the backend:"
echo "   npm run dev (from root or backend folder)"
echo ""
echo "4. In another terminal, start frontend:"
echo "   npm run dev (from frontend folder)"
echo ""
echo "5. Visit: http://localhost:5173"
echo ""
echo "✓ Setup complete!"
