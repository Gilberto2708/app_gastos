#!/bin/sh
set -e

echo "=== Starting Application ==="

echo "Step 1: Pushing database schema..."
yarn prisma db push --accept-data-loss

echo "Step 2: Starting Node.js server..."
exec node dist/src/main.js
