---
name: Working Style Feedback
description: Preferences and patterns learned from working with this user
type: feedback
---

Keep responses concise — the user approves work quickly and doesn't need lengthy explanations.

**Why:** User communicates in short messages and approves changes with brief confirmations.

**How to apply:** After making changes, give a short bullet summary of what changed and which files to upload. Don't over-explain decisions already made.

---

When adding questions to data.js, always verify the last question ID in each subject array before numbering new ones, to avoid ID collisions.

**Why:** Early in the project, bio_unit4_questions.js used IDs b31–b69 which conflicted with newly added Unit 3 questions (also b31–b65). Required a Python renumbering fix.

**How to apply:** Before adding new questions, grep for the highest existing ID in that subject's array.

---

Always bump the service worker cache version (microlearn-vN) after any file changes.

**Why:** PWA caches aggressively. Without bumping the version, the browser serves stale cached files and changes don't appear.

**How to apply:** After any code/content change, increment the CACHE constant in sw.js.
