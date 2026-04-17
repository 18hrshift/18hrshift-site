#!/usr/bin/env bash
set -e

echo "→ type check..."
npx tsc --noEmit

echo "→ build..."
npm run build

echo "✓ all checks passed"
