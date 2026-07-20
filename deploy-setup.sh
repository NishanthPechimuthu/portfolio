#!/bin/bash
# ============================================================
#  Portfolio Deployment Permissions Setup Script (Linux)
#  Run this script on your Linux server after cloning the repo.
# ============================================================

echo "Setting up proper folder permissions for deployment..."

# 1. Create necessary directories if they don't exist
mkdir -p server/uploads
mkdir -p server/logs

# 2. Set base permissions for the entire project
# - Directories: 755 (Owner: read/write/execute, Group/Others: read/execute)
# - Files: 644 (Owner: read/write, Group/Others: read)
echo "Applying base permissions..."
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# 3. Make shell scripts executable
if [ -f "deploy-setup.sh" ]; then
    chmod +x deploy-setup.sh
fi

# 4. Secure the server uploads and logs directories
# The node process needs write access here. Assuming you run this as the deployment user.
echo "Securing server uploads and logs..."
chmod -R 775 server/uploads
chmod -R 775 server/logs

# 5. Secure environment files
# .env files should only be readable by the owner
echo "Securing .env files..."
if [ -f "server/.env" ]; then
    chmod 600 server/.env
fi

if [ -f "client/.env" ]; then
    chmod 600 client/.env
fi

echo "✅ Folder permissions and access rights have been successfully configured for deployment!"
