#!/usr/bin/env bash
# Smoke-tests a running API: ./scripts/smoke.sh https://your-api.onrender.com
set -euo pipefail
BASE="${1:?usage: smoke.sh <base-url>}"
EMAIL="smoke$(date +%s)@example.com"
PASS='Password123!'
fail() { echo "FAIL: $*"; exit 1; }
code() { curl -s -o /tmp/smoke_body -w '%{http_code}' "$@"; }

[ "$(code "$BASE/api/health")" = 200 ] || fail health
echo "ok   health"

[ "$(code -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' \
  -d "{\"fullName\":\"Smoke Test\",\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")" = 201 ] || fail "register $(cat /tmp/smoke_body)"
grep -qi password /tmp/smoke_body && fail "register response contains password field"
echo "ok   register"

[ "$(code -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")" = 200 ] || fail "login $(cat /tmp/smoke_body)"
TOKEN=$(sed -E 's/.*"token":"([^"]+)".*/\1/' /tmp/smoke_body)
echo "ok   login"

[ "$(code "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN")" = 200 ] || fail me
echo "ok   me"
[ "$(code "$BASE/api/auth/me")" = 401 ] || fail "me without token should be 401"
echo "ok   me without token -> 401"
[ "$(code -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrong-pass\"}")" = 401 ] || fail "wrong password should be 401"
echo "ok   wrong password -> 401"

[ "$(code -X POST "$BASE/api/auth/logout" -H "Authorization: Bearer $TOKEN")" = 204 ] || fail logout
[ "$(code "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN")" = 401 ] || fail "token still valid after logout"
echo "ok   logout revokes token"

ACAO=$(curl -s -D - -o /dev/null -H 'Origin: http://evil.example' "$BASE/api/health" | grep -i '^access-control-allow-origin' || true)
[ -z "$ACAO" ] || fail "CORS allows unknown origin: $ACAO"
echo "ok   CORS rejects unknown origin"
echo "ALL SMOKE CHECKS PASSED"
