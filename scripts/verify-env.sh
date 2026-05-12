#!/bin/bash
# Environment variable verification script
# Run: ./scripts/verify-env.sh

set -e

echo "🔍 Verifying environment variables..."
echo ""

# Check if .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo "❌ frontend/.env.local not found"
    echo "   Please copy .env.example to frontend/.env.local and fill in your credentials"
    exit 1
fi

# Check required variables
required_vars=(
    "PUBLIC_SUPABASE_URL"
    "PUBLIC_SUPABASE_ANON_KEY"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" "frontend/.env.local" 2>/dev/null; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing required variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    exit 1
fi

echo "✅ All required environment variables are configured"
echo ""
echo "Frontend environment:"
grep "PUBLIC_SUPABASE_URL" "frontend/.env.local" | sed 's/=.*/=***/' || true
echo ""
echo "🚀 Ready to run: npm run dev"
