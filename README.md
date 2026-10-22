# CreteSuite hiring challenge: Family Calendar (internal)

This repo is internal. Never share it as-is.

## The story

### The app

Family Calendar is a tiny shared calendar: one week on screen, events as blocks, a **+ New event** button. Every event belongs to a **group**, and everyone in that group sees it.

The family started using it a few months ago to stop the "did you put it on the calendar?" conversations at dinner. Later, the son's soccer coach was invited so team practices and matches would show up in the same place.

There are two groups today:

| Group       | Members           | What goes there                             |
| ----------- | ----------------- | ------------------------------------------- |
| Family      | Mom, Dad, Son     | Appointments, school, errands, family plans |
| Soccer team | Son, Coach Rivera | Practices, matches, team logistics          |

The son is the only person in both groups.

### The cast

| Person           | Who they are | Groups | How they use the calendar |
| ---------------- | ------------ | ------ | ------------------------- |
| **Mom**          | Runs the household logistics. Works from a laptop most of the day. | Family | Keeps the calendar open in a browser tab all day and glances at it between meetings. Adds most family events. Rarely reloads the page. |
| **Dad**          | Handles errands and school pickups. | Family | Checks it in the evening on his laptop, adds errands and school meetings. |
| **Son**          | 12 years old, plays on the school soccer team. | Family, Soccer team | Uses his own laptop. Adds things in a hurry, usually right after someone tells him to. Doesn't read forms; types a title, picks a time, hits Save. |
| **Coach Rivera** | Volunteer coach of the son's under-13 team. Not part of the family; another parent at the school. | Soccer team | Posts practices and matches for the team, and changes them when the field or weather changes. Only cares about soccer. |

Coach Rivera was added to the app by the family so the son would stop missing practice changes. The coach has no interest in the family's private plans, and would be uncomfortable seeing them.

### A normal week

The calendar is busiest around the son: school, soccer, appointments. These are the kinds of moments the app is meant for.

- **Monday morning.** Mom opens the calendar on her work laptop and leaves the tab open for the rest of the day.
- **Tuesday.** Pilates for Mom early; soccer practice after school. Coach Rivera posts the practice times for the week.
- **Wednesday.** Dad adds the parent-teacher meeting, with the room number in the notes.
- **Thursday.** Practice again, then the science fair in the evening. The son added the science fair himself, in Family.
- **Friday.** The son sets up an extra practice with a teammate, Leo, and puts it in Soccer team.
- **Saturday.** Grocery run in the morning, match vs. the Eagles in the afternoon. The coach asks everyone to arrive 30 minutes early.
- **Sunday.** Family dinner at Grandma's.

Most events are added by one person and meant for others: the point of the app is that the right people find out without having to be told.

### The pains

Each person feels a different side of the same trust problem: they can't tell whether what they see on the calendar is complete.

**Mom**

- "He says he added it, and I never saw it. Now I don't know what else I'm missing."
- "Sometimes things only show up after I refresh. I thought that was just how it works."
- "I end up texting everyone to double-check, which is exactly what the calendar was supposed to stop."

**Dad**

- "I add something in the evening and the next day nobody seems to know about it."
- "I'm never sure if what I'm looking at is the latest version."

**Son**

- "I *did* add it. Nobody believes me."
- "I just type the name, pick the time and save. It takes ten seconds."
- "Mom keeps asking me to tell her things that are already on the calendar."

**Coach Rivera**

- "When I move a practice, some kids still show up at the old time. Their parents say the calendar didn't change."
- "I sometimes see things that clearly aren't about soccer. It feels like reading someone's diary." *(only if asked; see below)*
- "I'm a volunteer. I don't want to be in the family's business, and I don't want to chase anyone."

### The complaint

This is what the Product Expert relays at the start of the session, word for word:

> "Hi! I'm the product person for our little family calendar. We got a message from a mom who uses it: *'My son says he added his dentist appointment, but I never saw it.'* Can you figure out what's going on?"

The story behind it:

1. Yesterday afternoon, after school, Mom reminded the son about his dentist appointment.
2. He opened the calendar on his laptop, added "Dentist" and saved. It showed up on his screen.
3. Mom had the calendar open all day. That evening she looked: no dentist.
4. She refreshed this morning and looked again: still nothing.
5. She asked him; he said he added it. Now each one thinks the other is wrong, and Mom has stopped trusting the calendar.


**Out of scope for this session:** mobile apps, offline use, login and permissions beyond groups, recurring events.

**Layout and design:** the current look is a first version. If the candidate wants to improve the layout or design along the way, they're welcome to.
