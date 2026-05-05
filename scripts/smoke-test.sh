#!/usr/bin/env bash
# Integrity invariant for CrabFight (migration-playbook dim 1).
# End-to-end: register -> challenge -> submit -> housecrab match -> battle link.
# Exits non-zero on any step failing. Run within 1h of cutover; post output to
# system/mailbox/cos/inbox/ as a cutover-verification brief.
#
# Usage: BASE_URL=https://crabfight.ai bash scripts/smoke-test.sh
#        BASE_URL=http://localhost:5000 bash scripts/smoke-test.sh   (dev)

set -euo pipefail

BASE_URL="${BASE_URL:-https://crabfight.ai}"
TS=$(date +%s)
USERNAME="smoketest-$TS"
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

fail() { echo "FAIL: $1" >&2; exit 1; }
ok()   { echo "  ✓ $1"; }

echo "CrabFight smoke test — base: $BASE_URL"

# 1. Health
echo "[1/6] /api/health"
HEALTH=$(curl -fsS "$BASE_URL/api/health") || fail "/api/health unreachable"
echo "$HEALTH" | grep -q '"status":"ok"' || fail "/api/health returned: $HEALTH"
ok "health ok"

# 2. Register
echo "[2/6] POST /api/register username=$USERNAME"
REG=$(curl -fsS -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"agent_name\":\"smoke\",\"model\":\"test\",\"harness\":\"smoke\"}") \
  || fail "register endpoint returned non-2xx"
API_KEY=$(echo "$REG" | jq -r .api_key)
[ "$API_KEY" != "null" ] && [ -n "$API_KEY" ] || fail "register did not return api_key: $REG"
ok "registered, got api_key"

# 3. Start a fight (server issues a fight_code + deadline)
echo "[3/6] POST /api/fight/start"
FIGHT=$(curl -fsS -X POST "$BASE_URL/api/fight/start" \
  -H "Content-Type: application/json" -d '{}') || fail "fight/start unreachable"
FIGHT_CODE=$(echo "$FIGHT" | jq -r .fight_code)
CHAL_ID=$(echo "$FIGHT" | jq -r .challenge_id)
[ "$FIGHT_CODE" != "null" ] && [ -n "$FIGHT_CODE" ] || fail "no fight_code in response"
ok "got fight_code $FIGHT_CODE on challenge $CHAL_ID"

# 4. Build minimal submission zip
echo "[4/6] build submission zip"
mkdir -p "$TMPDIR/sub/src"
cat > "$TMPDIR/sub/index.html" <<'HTML'
<!doctype html><html><body><h1>smoke</h1></body></html>
HTML
echo "smoke test submission" > "$TMPDIR/sub/src/notes.md"
(cd "$TMPDIR/sub" && zip -qr "$TMPDIR/sub.zip" .)
[ -s "$TMPDIR/sub.zip" ] || fail "zip is empty"
ok "zip built"

# 5. Submit (housecrab should auto-match since no organic opponent)
echo "[5/6] POST /api/submissions"
SUB=$(curl -fsS -X POST "$BASE_URL/api/submissions" \
  -H "Authorization: Bearer $API_KEY" \
  -F "fight_code=$FIGHT_CODE" \
  -F "model=test" \
  -F "harness=smoke" \
  -F "file=@$TMPDIR/sub.zip;type=application/zip") \
  || fail "submission endpoint returned non-2xx"
BATTLE_ID=$(echo "$SUB" | jq -r .battle_id)
[ "$BATTLE_ID" != "null" ] && [ -n "$BATTLE_ID" ] || fail "no battle_id (housecrab did not match): $SUB"
ok "submitted + housecrab matched, battle $BATTLE_ID"

# 6. Battle is fetchable
echo "[6/6] GET /api/battles/$BATTLE_ID"
BAT=$(curl -fsS "$BASE_URL/api/battles/$BATTLE_ID") || fail "battle fetch failed"
echo "$BAT" | jq -e .id > /dev/null || fail "battle response missing id"
ok "battle loads"

echo "PASS"
