#!/usr/bin/env bash
# Verifica meta tags e assets usados na prévia do WhatsApp/Facebook.
set -euo pipefail

URL="${1:-https://ajuda-elizangela.netlify.app/}"
BASE="${URL%/}"

html="$(curl -fsSL "$URL")"
html_file="$(mktemp)"
printf '%s' "$html" > "$html_file"
trap 'rm -f "$html_file"' EXIT

check_meta() {
  local pattern="$1"
  local label="$2"
  if grep -qiE "$pattern" "$html_file"; then
    echo "OK  $label"
  else
    echo "FALTA  $label"
    exit 1
  fi
}

check_meta 'property="og:title"' "og:title"
check_meta 'property="og:description"' "og:description"
check_meta 'property="og:image"' "og:image"
check_meta 'property="og:url"' "og:url"

og_image="$(grep -oiE 'property="og:image" content="[^"]+"' "$html_file" | head -1 | sed 's/.*content="//;s/"$//')"
og_desc="$(grep -oiE 'property="og:description" content="[^"]+"' "$html_file" | head -1 | sed 's/.*content="//;s/"$//')"

echo "og:image = $og_image"
echo "og:description (${#og_desc} chars) = $og_desc"

if [ "${#og_desc}" -gt 110 ]; then
  echo "AVISO: descrição longa (${#og_desc} chars); WhatsApp costuma cortar ~100."
fi

code="$(curl -s -o /dev/null -w '%{http_code}' "$og_image")"
if [ "$code" != "200" ]; then
  echo "FALHA og:image HTTP $code"
  exit 1
fi
echo "OK  og:image HTTP 200"

python3 - <<PY
from PIL import Image
import io, urllib.request
url = "$og_image"
data = urllib.request.urlopen(url, timeout=20).read()
im = Image.open(io.BytesIO(data))
w, h = im.size
print(f"OK  og:image dimensões {w}x{h}")
if w < 300 or h < 157:
    raise SystemExit("FALHA: imagem pequena demais para preview")
PY

for path in /assets/favicon.ico /assets/favicon-32.png; do
  c=$(curl -s -o /dev/null -w '%{http_code}' "${BASE}${path}")
  if [ "$c" = "200" ]; then
    echo "OK  ${path}"
  else
    echo "FALHA ${path} HTTP $c"
    exit 1
  fi
done

echo "Tudo certo para preview social."
