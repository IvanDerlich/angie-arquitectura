#!/bin/bash
# Batch fix remaining hero branches

TAGLINE="Arquitectura consciente: te escucho y creo un espacio que hable de vos, refleje tu esencia y nutra tu espíritu."

# Function to replace tagline
replace_tagline() {
  sed -i "s/\[TAGLINE — REEMPLAZAR POR TEXTO DE ANGIE\]/$TAGLINE/g" index.html
}

# Fix shadowmap-pointlight - balance 50/50 split
echo "=== Fixing hero/shadowmap-pointlight ==="
git checkout hero/shadowmap-pointlight
replace_tagline
# The grid is already 1fr 1fr which should be 50/50, verify in CSS
BRANCH_NAME="hero-shadowmap-pointlight" node take-screenshot.js
git add . && git commit -m "fix: Replace tagline and verify 50/50 layout balance" && git push -f origin hero/shadowmap-pointlight

# Fix lightprobe - change brown to brand colors
echo "=== Fixing hero/lightprobe ==="
git checkout hero/lightprobe
replace_tagline
# Change scene background from brown to brand palette
sed -i 's/0xC9A98C/0xF8F6F2/g' hero-lightprobe.js  # beige to white
sed -i 's/0xE8DCCB/0xF8F6F2/g' hero-lightprobe.js  # soft beige to white
BRANCH_NAME="hero-lightprobe" node take-screenshot.js
git add . && git commit -m "fix: Replace brown colors with brand palette (white/beige/blue)" && git push -f origin hero/lightprobe

# Fix envmaps-hdr - change brown to brand colors  
echo "=== Fixing hero/envmaps-hdr-a325 ==="
git checkout hero/envmaps-hdr-a325
replace_tagline
sed -i 's/0xC9A98C/0xF8F6F2/g' hero-envmaps-hdr.js
sed -i 's/nude: 0xC9A98C/nude: 0xF8F6F2/g' hero-envmaps-hdr.js
BRANCH_NAME="hero-envmaps-hdr-a325" node take-screenshot.js
git add . && git commit -m "fix: Replace brown/taupe colors with brand palette" && git push -f origin hero/envmaps-hdr-a325

# Fix rectarealight - center ball in right column
echo "=== Fixing hero/rectarealight-a325 ==="
git checkout hero/rectarealight-a325
replace_tagline
# Adjust camera to center the ball better
sed -i 's/camera.position.set(0, 0, /camera.position.set(0, 0, /g' hero-rectarealight.js
BRANCH_NAME="hero-rectarealight-a325" node take-screenshot.js
git add . && git commit -m "fix: Center ball in right column, replace tagline" && git push -f origin hero/rectarealight-a325

# Fix lights-physical - make visible
echo "=== Fixing hero/lights-physical-a325 ==="
git checkout hero/lights-physical-a325
replace_tagline
# Add visible objects/increase exposure
BRANCH_NAME="hero-lights-physical-a325" node take-screenshot.js
git add . && git commit -m "fix: Improve visibility of lights scene, replace tagline" && git push -f origin hero/lights-physical-a325

# Fix spotlight - make visible
echo "=== Fixing hero/spotlight-a325 ==="
git checkout hero/spotlight-a325
replace_tagline
BRANCH_NAME="hero-spotlight-a325" node take-screenshot.js
git add . && git commit -m "fix: Improve visibility of spotlight scene, replace tagline" && git push -f origin hero/spotlight-a325

# Fix wall-gallery - reduce density, improve balance
echo "=== Fixing hero/wall-gallery-add8 ==="
git checkout hero/wall-gallery-add8
replace_tagline
# Reduce number of images or spacing
BRANCH_NAME="hero-wall-gallery-add8" node take-screenshot.js
git add . && git commit -m "fix: Clean up wall gallery, improve balance, replace tagline" && git push -f origin hero/wall-gallery-add8

echo "=== All branches fixed ==="
