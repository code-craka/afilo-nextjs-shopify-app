#!/bin/bash

# Fixed Global Cache Save Script for Local Project
# Version: v2.0_local_fixed

# ==================== ENVIRONMENT SETUP ====================

load_claude_env() {
    # Try local settings first
    local local_settings=".claude/settings.local.json"
    local global_settings="$HOME/.claude/settings.json"

    if [[ -f "$local_settings" ]]; then
        # Extract from local settings
        if [[ -z "$DATABASE_URL" ]]; then
            DATABASE_URL=$(jq -r '.env.DATABASE_URL // empty' "$local_settings" 2>/dev/null)
        fi
        if [[ -z "$UPSTASH_REDIS_REST_URL" ]]; then
            UPSTASH_REDIS_REST_URL=$(jq -r '.env.UPSTASH_REDIS_REST_URL // empty' "$local_settings" 2>/dev/null)
        fi
        if [[ -z "$UPSTASH_REDIS_REST_TOKEN" ]]; then
            UPSTASH_REDIS_REST_TOKEN=$(jq -r '.env.UPSTASH_REDIS_REST_TOKEN // empty' "$local_settings" 2>/dev/null)
        fi
        if [[ -z "$MEM0_API_KEY" ]]; then
            MEM0_API_KEY=$(jq -r '.env.MEM0_API_KEY // empty' "$local_settings" 2>/dev/null)
        fi
    elif [[ -f "$global_settings" ]]; then
        # Fallback to global settings
        if [[ -z "$DATABASE_URL" ]]; then
            DATABASE_URL=$(jq -r '.env.DATABASE_URL // empty' "$global_settings" 2>/dev/null)
        fi
        if [[ -z "$UPSTASH_REDIS_REST_URL" ]]; then
            UPSTASH_REDIS_REST_URL=$(jq -r '.env.UPSTASH_REDIS_REST_URL // empty' "$global_settings" 2>/dev/null)
        fi
        if [[ -z "$UPSTASH_REDIS_REST_TOKEN" ]]; then
            UPSTASH_REDIS_REST_TOKEN=$(jq -r '.env.UPSTASH_REDIS_REST_TOKEN // empty' "$global_settings" 2>/dev/null)
        fi
        if [[ -z "$MEM0_API_KEY" ]]; then
            MEM0_API_KEY=$(jq -r '.env.MEM0_API_KEY // empty' "$global_settings" 2>/dev/null)
        fi
    fi

    # Export for child processes
    export DATABASE_URL UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN MEM0_API_KEY
}

# ==================== MAIN FUNCTION ====================

main() {
    # Load environment variables
    load_claude_env

    # Exit if no output to cache
    if [[ -z "$CLAUDE_OUTPUT" ]]; then
        exit 0
    fi

    # Quick validation that required env vars exist
    if [[ -z "$UPSTASH_REDIS_REST_URL" || -z "$UPSTASH_REDIS_REST_TOKEN" ]]; then
        echo "Warning: Cache not configured properly" >&2
        exit 0
    fi

    # Project context
    local project_name=$(detect_project_context)
    local query_category=$(detect_query_category "$CLAUDE_INPUT")

    # Generate cache key
    local cache_key="claude:${project_name}:${query_category}:$(echo "$CLAUDE_INPUT" | md5sum | cut -d' ' -f1)"

    # Save to Redis cache with 24-hour expiration
    local cache_result=$(curl -s -X POST \
        "$UPSTASH_REDIS_REST_URL/setex/$cache_key/86400" \
        -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$(echo "$CLAUDE_OUTPUT" | jq -R .)" \
        2>/dev/null)

    if [[ $? -eq 0 ]]; then
        echo "Cache saved: $cache_key" >&2
    else
        echo "Cache save failed" >&2
    fi

    exit 0
}

# ==================== HELPER FUNCTIONS ====================

detect_project_context() {
    local current_dir=$(pwd)
    local project_name=$(basename "$current_dir")

    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        local git_name=$(basename "$(git rev-parse --show-toplevel)")
        if [[ -n "$git_name" ]]; then
            project_name="$git_name"
        fi
    fi

    project_name=$(echo "$project_name" | sed 's/[^a-zA-Z0-9_]/_/g' | tr '[:upper:]' '[:lower:]')
    echo "$project_name"
}

detect_query_category() {
    local query="$1"

    if [[ "$query" =~ (payment|stripe|transaction|billing|checkout) ]]; then
        echo "payments"
    elif [[ "$query" =~ (chat|bot|ai|claude|anthropic|knowledge|semantic) ]]; then
        echo "chatbot"
    elif [[ "$query" =~ (database|prisma|sql|migration|schema) ]]; then
        echo "database"
    elif [[ "$query" =~ (api|endpoint|route|auth|clerk) ]]; then
        echo "api"
    elif [[ "$query" =~ (performance|lighthouse|optimization) ]]; then
        echo "performance"
    elif [[ "$query" =~ (documentation|readme|changelog) ]]; then
        echo "docs"
    else
        echo "general"
    fi
}

# Run main function
main "$@"