#!/bin/sh
# Generate self-signed SSL certificate for development/testing
# For production, replace with Let's Encrypt or your own certificates

SSL_DIR="$(dirname "$0")/ssl"
mkdir -p "$SSL_DIR"

echo "🔐 Generating self-signed SSL certificate..."

openssl req -x509 -nodes \
  -newkey rsa:4096 \
  -keyout "$SSL_DIR/key.pem" \
  -out    "$SSL_DIR/cert.pem" \
  -days   365 \
  -subj "/C=DE/ST=Bavaria/L=Munich/O=UniTracker/OU=Dev/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"

echo "✅ SSL certificate generated:"
echo "   cert: $SSL_DIR/cert.pem"
echo "   key:  $SSL_DIR/key.pem"
echo ""
echo "⚠️  This is a self-signed certificate for development only."
echo "   For production, use Let's Encrypt: https://letsencrypt.org"
