# Project instructions for Claude Code

This is my individual course project: a Math Practice web app for children ages 7–12.
Reference documents in this folder:
- `math-practice-specification.md`: the requirements (source of truth)
- `math-practice-todo-list.md`: the 22 implementation phases
- `DECISIONS.md`: choices I made where the spec is vague (created in Step 0)

## Conversation log (required for my assignment)

After EVERY request I make, append an entry to `AI_LOG.md` (create it if missing):

```
### [YYYY-MM-DD HH:MM] [Phase N or short step name]
**My prompt:** [my exact prompt, verbatim, not paraphrased]
**What you did:** [3–6 bullets: changes made, files touched, commands run]
**Verification:** [test/lint/build results with pass/fail counts, plus the manual checks I should do]
**Problems / open issues:** [anything that failed, was skipped, or is uncertain; write "None" if none]
```

Rules for the log:
- Never edit or delete earlier entries. Only append.
- If I add my own notes (lines starting with `> ME:`), leave them untouched.
- Be honest: record failures and retries, not just successes.

## Working rules

- Do ONE phase per request. Do not start the next phase until I ask.
- Before coding a phase, list its tasks from the TODO and say which already exist.
- Follow the spec's data models (sections 8–11) and folder structure (section 18).
- Where the spec is ambiguous, follow `DECISIONS.md`. If it doesn't cover the case, ask me.
- Only check off TODO items that you actually verified (by a test, the build, or a check you ran).
  If something can only be verified manually by me, leave it unchecked and say so.
- After each phase, run: `npm run lint`, `npm test -- --run`, and `npm run build`. Report the results.
- Do NOT run `git commit` or `git push` unless I ask. I commit after I've tested the phase myself.
- Never commit secrets, API keys, tokens, or `.env` files.
- When fixing a bug: find the root cause first, explain it, then fix it and add a regression test.
- Keep the UI child-friendly: large text and tap targets, bright but high-contrast colors,
  supportive wording only (never shaming).

## Commands

- Dev server: `npm run dev`
- Tests: `npm test -- --run`
- Lint / format: `npm run lint` / `npm run format`
- Production build + preview: `npm run build && npm run preview`
