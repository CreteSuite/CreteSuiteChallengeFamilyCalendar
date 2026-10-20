# Family Calendar: interviewer guide

> **Confidential.** Never share this file or this repo with a candidate. They only get a clean copy of `challenge/` (see the root README).

## Session at a glance (60 min)

| Time  | Phase              | You                                                        | Candidate                          |
| ----- | ------------------ | ---------------------------------------------------------- | ---------------------------------- |
| 0–10  | Investigation      | Play the "Product Expert" and relay the complaint. Answer questions in character. | Asks questions, reproduces, reads code. |
| 10–15 | Hypotheses         | Listen. Don't confirm or deny yet.                         | States hypotheses and a plan.      |
| 15–45 | Live coding        | Mostly quiet. Answer product questions. Note what they do. | Codes with AI, thinks out loud.    |
| 45–60 | Trade-offs         | Probe with the questions under "Debrief" below.            | Explains choices and verification. |

## Before the session

1. Ask the candidate to run `pnpm db:reset` at the start. Seed dates are relative to the **current week**: if they seeded on another week, the calendar looks empty.
2. Have your own copy running with two windows: `?user=son` and `?user=mom`.
3. Don't create events as Son in the Family group while preparing, or run `pnpm db:reset` afterwards (see "How cause 2 can hide").

## The complaint (read this out)

> "Hi! I'm the product person for our little family calendar. We got a message from a mom who uses it: *'My son says he added his dentist appointment, but I never saw it.'* Can you figure out what's going on?"

Stay in character. You're a product person, not an engineer: you know how people use the app, not how the code works.

## The two causes

Both are real and independent. Fixing one does not fix the other.

### Cause 1: no live updates

- **What happens:** `web/hooks/useEvents.ts` fetches events once, in a `useEffect` on mount. After that, the list only changes when *this* tab writes (create/update/delete patch local state). No polling, no refetch on focus or visibility, no push. Mom's open tab stays stale until she reloads.
- **Also:** week navigation (‹ Today ›) only filters in memory, so moving between weeks doesn't refetch either. Switching user in the header reloads the page, so that does refetch.
- **Reproduce:**
  1. Open `?user=mom` and `?user=son` side by side.
  2. As Son: **+ New event**, title "Haircut", change **Group** to **Family**, Save.
  3. Mom's window doesn't show it. Clicking into it or switching tabs changes nothing.
  4. Reload Mom's window: "Haircut" appears.

### Cause 2: the event goes to the wrong group

- **What happens:** the create form pre-selects the group of the user's **most recently created** event (`findRecentGroupId` in `server/events.repository.ts` → `recentGroupId` in `/api/me` → initial state of the `<select>` in `web/components/EventModal.tsx`). In the seed, Son's latest event is "Extra practice with Leo" in **Soccer team**. When Son quickly adds "Dentist", it lands in Soccer, and Mom, who is only in Family, can't ever see it, even after reloading.
- **It's visible if you look:** the form shows "Soccer team" in the Group select; the event block is green and says "Soccer team"; the header shows Son's group chips.
- **Reproduce:**
  1. As Son: **+ New event**, type "Dentist", Save (don't touch Group).
  2. Son sees a green "Dentist · Soccer team" block.
  3. Reload Mom's window: still no Dentist.
  4. Open `?user=coach`: **the coach sees Son's dentist appointment.** This is a nice clue, and also a privacy problem worth naming.

### How cause 2 can hide (good for discussion, not a trap to spring)

- `recentGroupId` is read when the page loads. If Son once saves an event in Family and then reloads, the default becomes Family and the bug "disappears". Then it comes back the next time Son adds something to Soccer. A candidate who notices this intermittence and explains it is doing very well.
- Testing as Mom or Dad never shows it: they only have one group.

## Clues a candidate can find in the first 10 minutes

- In the UI: the green "Soccer team" chip on the new event; Son's two group chips in the header; the Group select pre-filled.
- In the network tab: `/api/events` is called once per page load, never again; `/api/me` returns `recentGroupId: "soccer"` for Son.
- In the database (`psql postgres://calendar:calendar@localhost:5437/calendar`): `SELECT title, group_id, created_by FROM events ORDER BY created_at DESC;` shows Dentist with `group_id = soccer`.
- In the code: `useEvents` has no refetch path; `EventModal` initial `groupId`.

## Questions they might ask, and what to answer

Answer as the Product Expert. Give facts about usage and intent; don't give technical direction.

| Question | Answer |
| --- | --- |
| Which user / which device? | Mom on her laptop; Son on his own laptop. Mom usually keeps the calendar open in a tab all day. |
| When did the son add it, and when did mom look? | He says he added it yesterday afternoon. She checked in the evening and again this morning. |
| Did mom reload the page? | "I think she refreshed this morning, yes." (Important: that means staleness alone doesn't explain it.) |
| Can we see the son's screen / ask him? | "He says he just typed 'Dentist', picked the time and saved. He didn't change anything else." |
| Which group did he put it in? | "He doesn't know. He didn't think about groups." |
| Does anyone else see it? | Only if they ask: "Funny, the soccer coach mentioned seeing something about a dentist." |
| Is this the first complaint? | "Mom has also said things like 'I only see changes after I refresh', but she thought that was normal." |
| How many users? | A family plus a small team. Dozens of tabs at most, not thousands. |
| Is real-time a requirement? | "Seeing changes within a few seconds would be great. Instant isn't critical." |
| Can we change the form? | Yes. "We want adding an event to stay quick. Parents complain about long forms." |
| Should the group be remembered at all? | "Someone asked for it because they always add soccer stuff. But nobody expected it to send things to the wrong place." |
| Can I change the backend / add libraries? | Yes, anything reasonable. |
| Mobile? Offline? Notifications? | Out of scope for today. |

## Solution space

Estimates are for a candidate using AI tools, including verifying it in two windows.

### Cause 1: freshness

| Option | Est. time | Trade-offs to listen for |
| --- | --- | --- |
| Refresh button | 5 min | Trivial, but puts the burden on the user; Mom wouldn't know she needs it. |
| Refetch on `focus` / `visibilitychange` | 5–10 min | Cheap and robust. **Doesn't help two windows side by side** or a tab left open on a second screen: no focus change happens. Good as a complement. |
| Polling (e.g. every 10–30 s) | 5–10 min | Simple, works everywhere, delay = interval, wasted requests. Should pause when the tab is hidden. Fine at this scale. |
| SSE (`EventSource`) | 12–20 min | Push with a plain HTTP response; auto-reconnects. Simplest version broadcasts "something changed" and the client refetches. Single process only (in-memory emitter); multiple servers would need Postgres `LISTEN/NOTIFY` or Redis. One open connection per tab (HTTP/1.1 limits ~6 per origin). |
| WebSocket | 25–35 min | Needs a library (`ws`), upgrade handling, and `ws: true` in the Vite proxy. Bidirectional power isn't needed here. Usually over-engineering for this problem. |

Things a strong candidate mentions about any push solution:
- Broadcasting to everyone leaks "something changed" (and timing) to users outside the group. Filtering by group membership on the server fixes it.
- Refetch the list vs send the changed event in the payload (simpler and self-healing vs less traffic, but needs merge logic and handling of deletes and group moves).
- Refetch on reconnect so missed messages don't matter.
- All writes go through `server/events.repository.ts`, so that's the single place to emit.

### Cause 2: wrong group

| Option | Est. time | Trade-offs to listen for |
| --- | --- | --- |
| Make the group explicit (no default when the user has 2+ groups; required select) | 5–10 min | Safest; one extra click. Keep the auto-select when there is only one group. |
| Default to the "shared"/largest group (Family) | 5 min | Matches the common case; still silently wrong for soccer events, just less often and less harmfully. |
| Keep "remember last group", but make it obvious (e.g. "Visible to: Son, Coach Rivera" under the select, colored by group) | 10–15 min | Keeps the requested convenience and fixes the real problem: the user didn't know who would see it. |
| Confirm/warn after saving ("Added to Soccer team: only Son and Coach Rivera can see it") or an undo toast | 10–15 min | Non-blocking; catches mistakes after the fact. |
| Fix existing data (move Dentist to Family) | 1 min (SQL) or via edit | The complaint is about a real event that's still in the wrong place. Mentioning it is a plus. |

## Dry-run results

Done on throwaway branches (deleted afterwards). Times are wall-clock for an AI agent that already knew the code: they only show that each change is small. Use the estimates above for candidates.

| Change | Agent time (incl. verification in 2 windows) | Size |
| --- | --- | --- |
| (a) Refetch on focus + visibility | ~1 min | 1 file, +22/−5 |
| (b) SSE (emitter in repository + route + `EventSource`) | ~1.5 min | 3 files, +39/−5 |
| (c) Explicit group choice | ~1 min | 1 file, +6/−2 |

SSE fit easily in the current write path: no simplification was needed.

### Reference diffs

<details>
<summary>(a) Refetch on focus / visibility: <code>web/hooks/useEvents.ts</code></summary>

```ts
useEffect(() => {
  function load() {
    api
      .listEvents(userId)
      .then((events) => {
        setEvents(events);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') load();
  }

  load();
  window.addEventListener('focus', load);
  document.addEventListener('visibilitychange', onVisibilityChange);
  return () => {
    window.removeEventListener('focus', load);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}, [userId]);
```
</details>

<details>
<summary>(b) SSE</summary>

`server/events.repository.ts`:

```ts
import { EventEmitter } from 'node:events';

// Emits 'change' after every successful write.
export const eventChanges = new EventEmitter();
eventChanges.setMaxListeners(0);

// ...and `eventChanges.emit('change');` at the end of createEvent, updateEvent and deleteEvent.
```

`server/index.ts`:

```ts
app.get('/api/events/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write(': connected\n\n');

  const onChange = () => res.write('data: changed\n\n');
  events.eventChanges.on('change', onChange);
  req.on('close', () => events.eventChanges.off('change', onChange));
});
```

`web/hooks/useEvents.ts` (same `load()` as in (a)):

```ts
load();
const source = new EventSource(`/api/events/stream?user=${encodeURIComponent(userId)}`);
source.onmessage = load;
// EventSource reconnects by itself; refetch to catch anything missed meanwhile.
source.onopen = load;
return () => source.close();
```

Known simplifications in this reference: it broadcasts to every user (no group filter), emits on delete even when nothing was deleted, and is single-process only. Good to probe on in the debrief.

The Vite dev proxy passes SSE through without extra config (verified).
</details>

<details>
<summary>(c) Explicit group: <code>web/components/EventModal.tsx</code></summary>

```tsx
// With more than one group, make the user pick one explicitly.
const [groupId, setGroupId] = useState(
  event?.groupId ?? (me.groups.length === 1 ? me.groups[0].id : ''),
);

// ...
<select value={groupId} onChange={(e) => setGroupId(e.target.value)} required>
  <option value="" disabled>
    Who should see this?
  </option>
  {me.groups.map((group) => (
    <option key={group.id} value={group.id}>{group.name}</option>
  ))}
</select>
```

Then `recentGroupId` / `findRecentGroupId` become unused and can be removed.
</details>

## What a strong vs weak session looks like

### Investigation and hypotheses (first 15 min)

**Strong**
- Reproduces before reading much code: opens two windows, adds "Dentist" as Son, looks at Mom.
- Asks whether Mom reloaded. When told she did, realizes staleness alone can't explain it and keeps digging.
- Notices the group (chip, select, or `group_id` in the DB) and connects it to visibility. Checks as Coach.
- States **two** hypotheses, with how to confirm each, and prioritizes: the wrong group is a data/privacy problem (worse); staleness is a UX problem (very common).

**Weak**
- Starts coding a WebSocket within 5 minutes.
- Finds the stale fetch, calls it "the bug", and never checks whether a reload fixes Mom's view.
- Treats the complaint as "the user is confused" without reproducing.

### Coding (30 min)

**Strong**
- Fixes cause 2 first or alongside, because it's the one that actually lost the appointment, and the fix is small.
- Picks a freshness approach that matches the requirement ("within a few seconds", tiny scale) and can explain why not the others. Any of focus refetch + polling, or SSE, is fine if justified.
- Drives the AI with specific prompts, reads what it generates, and rejects or edits bad suggestions.
- Takes care in the UI: the group choice is clear, there is a sensible placeholder or helper text, keyboard and validation still work, nothing flickers or jumps on refetch.
- Verifies in two windows, ideally adds a test (e.g. repository-level) and mentions the existing "Dentist" record.

**Weak**
- Only fixes cause 1.
- Big rewrite or new libraries (React Query, Socket.IO) with no reasoning about cost.
- Accepts AI output wholesale, doesn't run it, or can't explain parts of their own diff.
- "Fixes" the group by hard-coding Family for everyone.

### Debrief (last 15 min): questions to ask

- "Why this approach instead of polling / SSE / focus refetch?"
- "How did you verify it? What would you test automatically?"
- "What happens with 3 server instances behind a load balancer?" (in-memory emitter breaks → Postgres `LISTEN/NOTIFY`, Redis pub/sub)
- "Can the coach learn anything about the family from your push channel?"
- "What would you tell the mom, and the product person, about the existing Dentist event?"
- "If you had another hour, what would you do next?"

## Scoring rubric (1–4 each)

| Dimension | 1 | 4 |
| --- | --- | --- |
| Investigation before coding | Codes immediately | Reproduces, asks targeted questions, reads the relevant code paths |
| Hypothesis quality | One vague guess | Two clear, testable hypotheses, prioritized by impact |
| Solution choice and trade-offs | Picks the fanciest or the first thing | Matches the solution to the requirements and scale; names what it doesn't cover |
| Frontend care | Works but rough; broken states | Clear UX for group choice, no regressions, handles errors and loading |
| Verification | "Should work" | Two-window check, a test, mentions data cleanup |
| Communication | Silent or rambling | Thinks out loud, concise, explains what the AI produced |
