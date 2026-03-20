#!/bin/sh
# Run this script once after cloning to install all dependencies

set -e

echo "📦  Installing frontend dependencies..."
cd frontend
npm install
npm install -D tailwindcss-animate
cd ..

echo "📦  Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "✅  All dependencies installed!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and fill in POSTGRES_PASSWORD"
echo "  2. Generate SSL cert:  make ssl"
echo "  3. Start dev server:   make dev"
echo "  4. Run migrations:     make migrate"
echo "  5. Seed database:      make seed"
echo "  6. Open app:           http://localhost:3000"
