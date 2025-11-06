#!/usr/bin/env python3
"""
Intelligent Auto-Loading Context Hook for Claude Code
Automatically loads archived documentation based on conversation context.

Version: 1.0.0
Author: Afilo Enterprise Development Team
"""

import json
import sys
import re
import os
from pathlib import Path
from typing import Dict, List, Tuple

# Keyword mapping with weighted scoring
CONTEXT_MAP = {
    "stripe": {
        "keywords": ["stripe", "payment", "billing", "subscription", "checkout", "price", "customer", "invoice", "radar"],
        "files": [".claude/archive/CLAUDE-ENTERPRISE.md", ".claude/archive/subscriptions.md"],
        "weight": 1.0,
        "description": "Stripe payment integration, pricing, subscriptions"
    },
    "chatbot": {
        "keywords": ["chat", "bot", "ai", "knowledge", "semantic", "crawler", "embeddings", "anthropic", "claude", "conversation"],
        "files": [".claude/archive/IMPLIMENT-BOT.md", ".claude/archive/semantic-search.md"],
        "weight": 1.0,
        "description": "AI chat bot with knowledge base and semantic search"
    },
    "architecture": {
        "keywords": ["architecture", "design", "system", "structure", "diagram", "overview", "components", "flow"],
        "files": [".claude/archive/ARCHITECTURE.md"],
        "weight": 0.8,
        "description": "System architecture and design patterns"
    },
    "database": {
        "keywords": ["database", "prisma", "postgresql", "pgvector", "migration", "schema", "model", "relation"],
        "files": [".claude/archive/products-schema.md"],
        "weight": 0.9,
        "description": "Database schema and Prisma models"
    },
    "auth": {
        "keywords": ["auth", "clerk", "oauth", "login", "session", "jwt", "authentication", "authorization"],
        "files": [".claude/archive/auth-patterns.md"],
        "weight": 0.9,
        "description": "Authentication patterns with Clerk"
    },
    "skills": {
        "keywords": ["skill", "workflow", "guide", "template", "pattern", "best practice"],
        "files": [".claude/archive/Skills.md"],
        "weight": 0.7,
        "description": "Claude Code Skills and workflow patterns"
    },
    "optimization": {
        "keywords": ["performance", "lighthouse", "optimization", "speed", "bundle", "vitals"],
        "files": [".claude/archive/OPTIMIZATION-SUMMARY.md"],
        "weight": 0.8,
        "description": "Performance optimization guidelines"
    }
}

# Configuration
MAX_CONTEXT_CHARS = 12000  # ~3000 tokens max
RELEVANCE_THRESHOLD = 0.5  # Only load context above this score
HISTORY_WEIGHT = 0.3       # Weight for conversation history vs current prompt
MAX_HISTORY_MESSAGES = 8   # Number of recent messages to analyze


def log_debug(message: str) -> None:
    """Log debug message to stderr (visible in Claude Code logs)."""
    print(f"[AutoContext] {message}", file=sys.stderr)


def get_current_mode(project_dir: Path) -> str:
    """Detect current Claude Code mode from symlink."""
    mode_file = project_dir / ".claude/mcp-config.json"
    if mode_file.is_symlink():
        try:
            target = mode_file.resolve().name
            mode = target.replace("mcp-config-", "").replace(".json", "")
            return mode
        except Exception:
            pass
    return "light"


def analyze_text_relevance(text: str) -> Dict[str, float]:
    """Analyze text and return relevance scores for each context category."""
    scores = {}
    text_lower = text.lower()

    for category, config in CONTEXT_MAP.items():
        score = 0
        for keyword in config["keywords"]:
            # Count keyword occurrences with diminishing returns
            count = len(re.findall(r'\b' + re.escape(keyword) + r'\b', text_lower))
            if count > 0:
                # Logarithmic scoring to prevent keyword stuffing
                score += config["weight"] * min(1.0, 0.3 + 0.2 * count)

        scores[category] = score

    return scores


def analyze_conversation_history(transcript_path: str) -> Dict[str, float]:
    """Analyze recent conversation history for context clues."""
    history_scores = {}

    if not transcript_path or not Path(transcript_path).exists():
        return history_scores

    try:
        with open(transcript_path, 'r') as f:
            lines = f.readlines()

        # Get last N messages
        recent_messages = lines[-MAX_HISTORY_MESSAGES:] if len(lines) > MAX_HISTORY_MESSAGES else lines

        for line in recent_messages:
            try:
                message = json.loads(line.strip())
                content = message.get("content", "")

                # Analyze message content
                message_scores = analyze_text_relevance(content)
                for category, score in message_scores.items():
                    history_scores[category] = history_scores.get(category, 0) + score * HISTORY_WEIGHT

            except (json.JSONDecodeError, KeyError):
                continue

    except Exception as e:
        log_debug(f"Error analyzing conversation history: {e}")

    return history_scores


def calculate_relevance_scores(prompt: str, transcript_path: str) -> Dict[str, float]:
    """Calculate final relevance scores combining prompt and history."""
    # Analyze current prompt
    prompt_scores = analyze_text_relevance(prompt)

    # Analyze conversation history
    history_scores = analyze_conversation_history(transcript_path)

    # Combine scores
    combined_scores = {}
    all_categories = set(prompt_scores.keys()) | set(history_scores.keys())

    for category in all_categories:
        combined_scores[category] = prompt_scores.get(category, 0) + history_scores.get(category, 0)

    return combined_scores


def adjust_threshold_for_mode(mode: str, base_threshold: float) -> float:
    """Adjust relevance threshold based on current Claude Code mode."""
    mode_adjustments = {
        "light": 1.5,        # Higher threshold - be selective
        "enterprise": 0.7,   # Lower threshold - be more aggressive
        "shopify": 0.8,      # Moderate threshold
        "testing": 0.6       # Lower threshold for debugging
    }

    multiplier = mode_adjustments.get(mode, 1.0)
    return base_threshold * multiplier


def load_context_files(categories: List[str], project_dir: Path) -> str:
    """Load and combine markdown files for detected categories."""
    context_parts = []
    total_chars = 0

    # Sort by relevance score (categories should be pre-sorted)
    for category in categories:
        if category not in CONTEXT_MAP:
            continue

        config = CONTEXT_MAP[category]

        for file_path in config["files"]:
            full_path = project_dir / file_path

            if not full_path.exists():
                log_debug(f"Context file not found: {file_path}")
                continue

            try:
                with open(full_path, 'r') as f:
                    content = f.read()

                # Add header for clarity
                header = f"# Auto-loaded Context: {config['description']}\n"
                header += f"# Source: {file_path}\n\n"

                file_content = header + content

                # Check if adding this file would exceed limit
                if total_chars + len(file_content) > MAX_CONTEXT_CHARS:
                    remaining_chars = MAX_CONTEXT_CHARS - total_chars
                    if remaining_chars > 500:  # Only add if meaningful content fits
                        truncated = file_content[:remaining_chars]
                        truncated += "\n\n[...truncated for token efficiency]"
                        context_parts.append(truncated)
                    break

                context_parts.append(file_content)
                total_chars += len(file_content)

                log_debug(f"Loaded context: {file_path} ({len(content)} chars)")

            except Exception as e:
                log_debug(f"Error loading {file_path}: {e}")

    return "\n\n---\n\n".join(context_parts)


def main():
    """Main hook execution logic."""
    try:
        # Read hook input from stdin
        input_data = json.load(sys.stdin)

        prompt = input_data.get("prompt", "")
        transcript_path = input_data.get("transcript_path", "")
        cwd = input_data.get("cwd", ".")

        # Get project directory
        project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR", cwd))

        # Skip if no meaningful prompt
        if not prompt or len(prompt.strip()) < 10:
            print("{}")
            return

        # Detect current mode and adjust threshold
        current_mode = get_current_mode(project_dir)
        threshold = adjust_threshold_for_mode(current_mode, RELEVANCE_THRESHOLD)

        log_debug(f"Analyzing prompt in {current_mode} mode (threshold: {threshold:.2f})")

        # Calculate relevance scores
        scores = calculate_relevance_scores(prompt, transcript_path)

        # Filter categories above threshold
        relevant_categories = [
            cat for cat, score in sorted(scores.items(), key=lambda x: x[1], reverse=True)
            if score >= threshold
        ]

        if not relevant_categories:
            log_debug("No relevant context detected")
            print("{}")
            return

        log_debug(f"Relevant categories: {', '.join([f'{cat}({scores[cat]:.2f})' for cat in relevant_categories])}")

        # Load context files
        context = load_context_files(relevant_categories, project_dir)

        if not context:
            log_debug("No context files could be loaded")
            print("{}")
            return

        # Return context injection
        output = {
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": context
            }
        }

        log_debug(f"Injecting {len(context)} characters of context")
        print(json.dumps(output))

    except Exception as e:
        log_debug(f"Hook error: {e}")
        # Always return valid JSON to prevent hook failure
        print("{}")


if __name__ == "__main__":
    main()