# CreteSuite hiring challenge: Family Calendar (internal)

This repo is internal. Never share it as-is.

| Folder         | Audience            | Notes                                                    |
| -------------- | ------------------- | -------------------------------------------------------- |
| `challenge/`   | Candidate           | The app they receive 24h before the session.             |
| `interviewer/` | Interviewers only   | `INTERVIEWER.md`: the planted problem, script, rubric.   |

## Shipping the challenge to a candidate

Send only a fresh copy of `challenge/`, with no history from this repo:

```bash
rm -rf /tmp/family-calendar && cp -R challenge /tmp/family-calendar
cd /tmp/family-calendar && rm -rf node_modules
git init -q && git add . && git commit -qm "Family calendar v1"
# then zip it or push it to a new private repo for the candidate
```

Before each session, run `pnpm db:reset` in your own copy so the seed dates match the current week.
