#!/usr/bin/env bash
set -euo pipefail
npm install -g @bubblewrap/cli
mkdir -p android
cp -f twa-manifest.json android/twa-manifest.json
cd android
if [ ! -f gradlew ]; then
  bubblewrap init --manifest=./twa-manifest.json --directory=.
fi
bubblewrap build --skipPwaValidation
