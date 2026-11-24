#!/usr/bin/env bash
# Cloud-container shim: Remotion launches Chrome with --no-proxy-server, but this container's egress
# goes through the agent proxy in $HTTPS_PROXY (Google Fonts need it). This wrapper drops Remotion's
# three "direct connection" switches and points Chrome at that proxy instead; every other flag passes through.
# Use: --browser-executable="$PWD/scratchpad/chrome-proxy.sh" (CLI) or browserExecutable (Node API).
# Outside the cloud container (no HTTPS_PROXY) it just runs the stock headless shell unchanged.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CH="${REMOTION_CHROME:-$DIR/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell.real}"
PROXY="${HTTPS_PROXY:-${https_proxy:-}}"
args=()
for a in "$@"; do
  if [ -n "$PROXY" ]; then
    case "$a" in
      --no-proxy-server|--proxy-server=*|--proxy-bypass-list=*) continue ;;
    esac
  fi
  args+=("$a")
done
[ -n "$PROXY" ] && args+=("--proxy-server=$PROXY")
exec "$CH" "${args[@]}"
