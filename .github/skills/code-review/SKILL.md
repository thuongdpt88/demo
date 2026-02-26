---
name: code-review
description: Review code for bugs, risks, regressions, and missing tests. Use for small PHP/JS files and highlight actionable issues.
---

# Skill Instructions

Use this skill when the user asks to review code or requests feedback on a file or snippet.

## What to focus on

- Prioritize bugs, behavioral regressions, security risks, and missing tests.
- Provide file/line references and clear, actionable fixes.
- Keep summaries brief; findings first, then questions and next steps.

## Procedure

1) Open the target file(s) and scan for logic errors and side effects.
2) Call out risky patterns (global state, unsafe IO, hidden dependencies).
3) Propose minimal fixes or refactors.
4) Suggest tests for the most critical paths.

## Output format

- Findings ordered by severity.
- Each finding includes a file path and line reference.
- Follow with open questions or assumptions, then optional next steps.

## Example

Request: "review code"
Response:
- High: [src/foo.php](src/foo.php#L10-L25) Potential null dereference; guard before use.
- Medium: [src/bar.php](src/bar.php#L40) Function writes to disk without error handling.

Questions:
- Should this path be allowed to fail fast?

Next steps:
1) Add a null check and unit test for missing input.
