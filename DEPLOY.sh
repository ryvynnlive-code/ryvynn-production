#!/bin/bash
# RYVYNN v7.1.1 - PRODUCTION DEPLOYMENT SCRIPT
# Multiple deployment options

set -e

echo "🔥🔥🔥 RYVYNN v7.1.1 DEPLOYMENT 🔥🔥🔥"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the ryvynn-production directory"
    exit 1
fi

echo "Choose deployment method:"
echo ""
echo "1. GitHub + Vercel (Recommended)"
echo "2. Vercel CLI Direct"
echo "3. Vercel Dashboard Import"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 GITHUB + VERCEL DEPLOYMENT"
        echo ""
        echo "This will push to GitHub and trigger Vercel deployment"
        echo ""
        
        # Check if git remote exists
        if ! git remote | grep -q origin; then
            echo "Setting up GitHub remote..."
            git remote add origin https://github.com/aonixxlive-code/ryvynn-app.git
            git branch -M main
        fi
        
        echo "✅ Git configured"
        echo ""
        echo "Next steps:"
        echo "1. Ensure you're authenticated with GitHub"
        echo "2. Run: git push -u origin main --force"
        echo "3. Vercel will auto-deploy if connected"
        echo ""
        ;;
        
    2)
        echo ""
        echo "🚀 VERCEL CLI DEPLOYMENT"
        echo ""
        
        # Check if vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm i -g vercel
        fi
        
        echo "✅ Vercel CLI ready"
        echo ""
        echo "Deploying to production..."
        vercel --prod --yes
        ;;
        
    3)
        echo ""
        echo "📋 VERCEL DASHBOARD IMPORT"
        echo ""
        echo "Steps:"
        echo "1. Go to: https://vercel.com/new"
        echo "2. Select 'Import Git Repository'"
        echo "3. Choose: aonixxlive-code/ryvynn-app"
        echo "4. Framework: Next.js"
        echo "5. Add environment variables:"
        echo "   - DATABASE_URL"
        echo "   - ANTHROPIC_API_KEY"
        echo "   - STRIPE_SECRET_KEY"
        echo "   - STRIPE_WEBHOOK_SECRET"
        echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
        echo "   - NEXT_PUBLIC_APP_URL=https://ryvynn.live"
        echo "6. Click Deploy"
        echo ""
        echo "After deployment:"
        echo "- Add domain ryvynn.live in project settings"
        echo "- Configure Stripe webhook: https://ryvynn.live/api/stripe/webhook"
        echo ""
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📚 FULL DOCUMENTATION: README.md"
echo ""
echo "🔥 DEPLOYMENT READY 🔥"
