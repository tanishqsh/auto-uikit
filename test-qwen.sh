#!/bin/bash
# Quick test: is Qwen running and responding?
# Usage: ./test-qwen.sh [optional prompt]

PROMPT="${1:-Write a one-line React button with Tailwind. Code only.}"
MODEL="qwen2.5-coder:7b"
URL="http://localhost:11434/api/generate"

echo "🧪 Testing Qwen ($MODEL)..."
echo "📝 Prompt: $PROMPT"
echo "---"

RESPONSE=$(curl -s "$URL" -d "{\"model\":\"$MODEL\",\"prompt\":\"$PROMPT\",\"stream\":false}" 2>&1)

if echo "$RESPONSE" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['response'])" 2>/dev/null; then
  echo "---"
  echo "✅ Qwen is working!"
else
  echo "❌ Qwen failed. Is ollama running?"
  echo "   Try: ollama serve"
  echo "   Raw response: $RESPONSE"
  exit 1
fi
