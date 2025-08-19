#!/bin/bash

# Deployment script for Hostinger
# Run this script to prepare your website for production deployment

echo "Preparing UniSelfie website for production deployment..."

# Create production environment file
echo "Creating production environment configuration..."
cp .env.example .env.production

# Install production dependencies
echo "Installing production dependencies..."
npm install --production

# Create deployment package
echo "Creating deployment package..."
mkdir -p deploy
cp -r public deploy/
cp -r views deploy/
cp server.js deploy/
cp package.json deploy/
cp .env.production deploy/.env
cp README.md deploy/

echo "Deployment package created in 'deploy' directory"
echo ""
echo "Upload the contents of the 'deploy' directory to your Hostinger hosting account"
echo ""
echo "Don't forget to:"
echo "1. Set environment variables in your hosting control panel"
echo "2. Update contact information and replace placeholder images"
echo "3. Configure your domain and SSL certificate"
echo "4. Test all contact forms and functionality"
echo ""
echo "Your UniSelfie website is ready for production!"
