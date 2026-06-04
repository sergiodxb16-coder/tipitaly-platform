#!/bin/bash
# Pusha lo stato locale sul branch remoto "design-preview" (per il deploy di anteprima Vercel)
cd "$(dirname "$0")"
echo "== Push di main locale su origin/design-preview =="
git push origin main:design-preview --force-with-lease=design-preview
echo ""
echo "Fatto. Puoi chiudere questa finestra."
read -n 1 -s -r -p "Premi un tasto per chiudere..."
