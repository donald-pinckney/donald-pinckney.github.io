#!/bin/bash
# Write the Laowa 60mm manual lens into Canon EOS R50 RAWs that have no lens recorded
# (the only manual lens used on the R50). Run on a Library folder right after copying
# photos off the card, BEFORE importing into darktable (darktable reads the lens at import).
#
#   scripts/laowa-lens.sh ~/Pictures/Library/2026-12-trip
#
# Verifies the image data is untouched (MD5 of the raw image data before/after) and only
# then deletes exiftool's *_original backups.
set -euo pipefail
d="${1:?usage: $0 <folder>}"
LENS='Laowa 60mm f/2.8 2X Ultra-Macro'   # exact lensfun name: lens correction finds it automatically
tmp=$(mktemp -d)
# Not -T here: it implies -f, which makes missing tags read as "-" (truthy) inside -if.
exiftool -q -ext CR3 -if '$Model eq "Canon EOS R50" and !$Exif:LensModel and !$Canon:LensModel' \
  -p '$Directory/$FileName' "$d" 2>/dev/null > "$tmp/files" || true
n=$(wc -l < "$tmp/files" | tr -d ' ')
[ "$n" = 0 ] && { echo "No lensless R50 RAWs in $d"; exit 0; }
echo "$n files…"
exiftool -q -T -api ImageHashType=MD5 -FileName -ImageDataHash -@ "$tmp/files" | sort > "$tmp/before"
exiftool -q -P -Exif:LensModel="$LENS" -Exif:LensMake='Venus Optics' -Exif:FocalLength=60 \
  -Exif:FocalLengthIn35mmFormat=96 -Exif:LensInfo='60 60 2.8 2.8' -Canon:LensModel="$LENS" -@ "$tmp/files"
exiftool -q -T -api ImageHashType=MD5 -FileName -ImageDataHash -@ "$tmp/files" | sort > "$tmp/after"
if cmp -s "$tmp/before" "$tmp/after"; then
  while read -r f; do rm -f -- "${f}_original"; done < "$tmp/files"
  echo "Done: $n files, image data unchanged, backups removed."
else
  echo "Image data changed?! Backups (*_original) kept. Compare $tmp/before and $tmp/after." >&2; exit 1
fi
