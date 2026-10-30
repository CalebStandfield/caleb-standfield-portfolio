# Copy review rubric

Shared by every reviewer in `.claude/agents/review-*.md`. Reviewers read this
before answering so all output lines up and can be aggregated.

## Input you will get

- **Surface**: where the copy lives (LinkedIn headline, site hero tagline,
  About paragraph, project summary, etc.) and any hard limits (char count).
- **Goal**: what the copy should get the reader to do.
- **Candidates**: labeled options (A, B, C...). One may be the current copy.
- **Prior feedback** (optional): what earlier rounds said, so you can check
  whether the new candidates fixed it.

Facts about Caleb live in `portfolio/src/content/profile.content.ts`. Read it
if you need to check a claim. Flag any candidate that overstates or invents
something not backed by that file.

## How to judge

Judge as your persona would in real life, at real speed. A recruiter skims for
6 seconds; an engineer reads the details. Do not grade like an English teacher.

Score each candidate 1-10 on:
- **Clarity**: do I know who this is and what they do on first read?
- **Signal**: does it give me a reason to click or reach out?
- **Distinct**: would I remember it after scrolling past 50 others?
- **Credible**: does it sound true and earned, not inflated or cringe?

## Output format (exact)

```
REVIEWER: <persona name>

SCORES
<label> | clarity <n> | signal <n> | distinct <n> | credible <n> | total <sum>/40 | <one line why>
...

RANKING: <labels best to worst, comma separated>

TOP PICK: <label>
WHY: <2-3 sentences, from your persona's point of view>

KILL LIST: <phrases or patterns that hurt any candidate, and why, one per line>

KEEP LIST: <phrases or patterns that work, one per line>

MY VERSION: <your own rewrite that fits the surface limits>
CHAR COUNT: <n>
```

Be blunt. No praise padding. If every candidate is weak, say so.
