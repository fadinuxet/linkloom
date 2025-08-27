#!/bin/bash

# LinkLoom Trello Power-Up Deployment Script
# This script helps you deploy your Power-Up to various platforms

echo "🚀 LinkLoom Trello Power-Up Deployment"
echo "======================================"
echo ""

# Check if required files exist
if [ ! -f "connector.html" ] || [ ! -f "popup.html" ] || [ ! -f "card-popup.html" ] || [ ! -f "manifest.json" ]; then
    echo "❌ Error: Required files are missing!"
    echo "Make sure you have:"
    echo "  - connector.html"
    echo "  - popup.html"
    echo "  - card-popup.html"
    echo "  - manifest.json"
    exit 1
fi

echo "✅ All required files found!"
echo ""

# Load domain from config file if it exists
if [ -f ".deploy-config" ]; then
    source .deploy-config
    DOMAIN="$POWERUP_DOMAIN"
    echo "📁 Using saved domain: $DOMAIN"
    echo ""
else
    # Ask user for their domain
    read -p "Enter your Power-Up domain (e.g., your-powerup.netlify.app): " DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        echo "❌ Error: Domain is required!"
        exit 1
    fi
    
    # Save domain to config file
    echo "POWERUP_DOMAIN=\"$DOMAIN\"" > .deploy-config
    echo "DEPLOYMENT_PLATFORM=\"1\"" >> .deploy-config
    echo "💾 Domain saved to .deploy-config for future use"
    echo ""
fi

echo ""
echo "🔧 Updating configuration files..."

# Update manifest.json
sed -i.bak "s|https://your-powerup-domain.com|https://$DOMAIN|g" manifest.json

# Update connector.html
sed -i.bak "s|https://your-powerup-domain.com|https://$DOMAIN|g" connector.html

echo "✅ Configuration updated!"
echo ""

# Load platform choice from config file if it exists
if [ -f ".deploy-config" ] && [ ! -z "$DEPLOYMENT_PLATFORM" ]; then
    CHOICE="$DEPLOYMENT_PLATFORM"
    echo "📁 Using saved platform choice: $CHOICE"
    echo ""
else
    # Ask user which platform they want to deploy to
    echo "Choose your deployment platform:"
    echo "1) Netlify (drag & drop)"
    echo "2) GitHub Pages"
    echo "3) Vercel"
    echo "4) Manual deployment"
    echo ""
    
    read -p "Enter your choice (1-4): " CHOICE
    
    # Save platform choice to config file
    if [ -f ".deploy-config" ]; then
        sed -i.bak "s|DEPLOYMENT_PLATFORM=.*|DEPLOYMENT_PLATFORM=\"$CHOICE\"|" .deploy-config
    else
        echo "DEPLOYMENT_PLATFORM=\"$CHOICE\"" >> .deploy-config
    fi
    echo "💾 Platform choice saved to .deploy-config for future use"
    echo ""
fi

case $CHOICE in
    1)
        echo ""
        echo "🌐 Netlify Deployment Instructions:"
        echo "=================================="
        echo "1. Go to https://netlify.com"
        echo "2. Sign up or log in"
        echo "3. Drag and drop this folder to deploy"
        echo "4. Your Power-Up will be available at: https://$DOMAIN"
        echo ""
        echo "📝 Next steps:"
        echo "- Update your Trello Power-Up registration with:"
        echo "  Iframe Connector URL: https://$DOMAIN/connector.html"
        echo "  Origins: https://$DOMAIN"
        ;;
    2)
        echo ""
        echo "📚 GitHub Pages Deployment Instructions:"
        echo "======================================="
        echo "1. Create a new GitHub repository"
        echo "2. Upload all files from this folder"
        echo "3. Go to Settings > Pages"
        echo "4. Enable GitHub Pages from main branch"
        echo "5. Your Power-Up will be available at: https://$DOMAIN"
        echo ""
        echo "📝 Next steps:"
        echo "- Update your Trello Power-Up registration with:"
        echo "  Iframe Connector URL: https://$DOMAIN/connector.html"
        echo "  Origins: https://$DOMAIN"
        ;;
    3)
        echo ""
        echo "⚡ Vercel Deployment Instructions:"
        echo "=================================="
        echo "1. Install Vercel CLI: npm i -g vercel"
        echo "2. Run: vercel --prod"
        echo "3. Follow the prompts"
        echo "4. Your Power-Up will be available at: https://$DOMAIN"
        echo ""
        echo "📝 Next steps:"
        echo "- Update your Trello Power-Up registration with:"
        echo "  Iframe Connector URL: https://$DOMAIN/connector.html"
        echo "  Origins: https://$DOMAIN"
        ;;
    4)
        echo ""
        echo "🔧 Manual Deployment:"
        echo "===================="
        echo "1. Upload all files to your web server"
        echo "2. Ensure HTTPS is enabled"
        echo "3. Your Power-Up will be available at: https://$DOMAIN"
        echo ""
        echo "📝 Next steps:"
        echo "- Update your Trello Power-Up registration with:"
        echo "  Iframe Connector URL: https://$DOMAIN/connector.html"
        echo "  Origins: https://$DOMAIN"
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "📋 Final steps:"
echo "1. Deploy your files to the chosen platform"
echo "2. Go to https://trello.com/power-ups/admin"
echo "3. Create a new Power-Up with your domain"
echo "4. Test the Power-Up on a Trello board"
echo ""
echo "📚 For detailed instructions, see README.md"
echo "🆘 Need help? Check the troubleshooting section in README.md"
