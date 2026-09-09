---
trigger: always_on
---

# Examples — Core Principles

## 1. Think Before Coding
Surface assumptions before implementing. If request is ambiguous, list interpretations and ask.

## 2. Simplicity First
Write the simplest code that solves today's problem.
❌ Don't add caching, validation, abstraction layers unless explicitly asked.
✅ One function, minimal parameters, no speculative features.

## 3. Surgical Changes
Only change lines that fix the reported issue.
❌ Don't reformat quotes, add type hints, or refactor while fixing a bug.
✅ Match existing code style. Minimal diff.

## 4. Goal-Driven Execution
Define verifiable success criteria before starting.
❌ "I'll review and improve the code"
✅ "Write failing test → fix → verify test passes → verify no regression"

## Key Rule
Good code solves today's problem simply. Not tomorrow's problem prematurely.