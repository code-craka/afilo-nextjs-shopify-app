#!/bin/bash
echo "Testing Shopify MCP connection..."

# Test tools list
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' \
  https://fzjdsw-ma.myshopify.com/api/mcp

echo -e "\n\nTesting product search..."

# Test product search
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call", 
    "id": 2,
    "params": {
      "name": "search_shop_catalog",
      "arguments": {
        "query": "software",
        "context": "browsing store"
      }
    }
  }' \
  https://fzjdsw-ma.myshopify.com/api/mcp
