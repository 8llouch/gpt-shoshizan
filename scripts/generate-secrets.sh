set -e

echo "🔐 Secrets generation..."

# secrets generations
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "\n")

cat > .env.secrets << EOF
# Generated on $(date)
# DO NOT COMMIT THIS FILE

# Database password (same for POSTGRES_PASSWORD and DB_PASSWORD)
POSTGRES_PASSWORD=${DB_PASSWORD}
DB_PASSWORD=${DB_PASSWORD}

# JWT Secret
JWT_SECRET=${JWT_SECRET}
EOF

chmod 600 .env.secrets

echo "✅ Secrets have been generated !"
echo ""
echo "📁 Files created:"
echo "   - .env.secrets"
echo ""
echo "⚠️ : Never commit these files !"