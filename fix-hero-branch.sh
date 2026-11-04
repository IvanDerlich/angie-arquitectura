#!/bin/bash
# Script to fix a hero branch with common fixes

BRANCH=$1
COMMIT_MSG=$2

if [ -z "$BRANCH" ] || [ -z "$COMMIT_MSG" ]; then
  echo "Usage: $0 <branch-name> <commit-message>"
  exit 1
fi

echo "=== Fixing $BRANCH ==="

# Checkout branch
git checkout "$BRANCH" || exit 1

# Copy test files and CSS from sky branch
git checkout hero/sky -- test-hero-overlap.spec.js take-screenshot.js styles.css || exit 1

# Find hero JS file
HERO_JS=$(ls hero-*.js 2>/dev/null | head -1)

if [ -n "$HERO_JS" ]; then
  echo "Found hero file: $HERO_JS"
  
  # Fix window.innerWidth/innerHeight to container dimensions
  sed -i 's/window\.innerWidth/width/g' "$HERO_JS"
  sed -i 's/window\.innerHeight/height/g' "$HERO_JS"
  
  # Add container dimension variables if not present
  if ! grep -q "const width = container.offsetWidth" "$HERO_JS"; then
    # Insert after container check
    sed -i '/if (!container) return;/a\    const width = container.offsetWidth;\n    const height = container.offsetHeight;' "$HERO_JS"
  fi
fi

# Run tests
npx playwright test test-hero-overlap.spec.js --reporter=list

if [ $? -eq 0 ]; then
  echo "Tests passed!"
  
  # Take screenshot
  BRANCH_NAME="${BRANCH##*/}" node take-screenshot.js
  
  # Commit and push
  git add .
  git commit -m "$COMMIT_MSG"
  git push -f origin "$BRANCH"
  
  echo "=== $BRANCH completed successfully ==="
else
  echo "=== Tests failed for $BRANCH ==="
  exit 1
fi
