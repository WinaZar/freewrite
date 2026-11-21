# Freewrite

A personal freewriting app: you write against a timer, then the text is burned.

## Language

**Session**:
One freewriting run, from the first typed character until the text is burned. Consists of a countdown and, optionally, overtime.
_Avoid_: entry, note, document, draft

**Blank page**:
The state between sessions: a duration is selected, there is no text, and the app waits for the first character.
_Avoid_: idle, home, start screen

**Duration**:
The initial length of a session's countdown, chosen from a preset.
_Avoid_: timer length, period

**Countdown**:
The part of a session while the timer is running toward zero.

**Overtime**:
The part of a session after the countdown reaches zero and before the text is burned. Writing continues.
_Avoid_: extra time

**Extend**:
Add five minutes to the running session; in overtime it starts a new countdown.
_Avoid_: snooze

**Burn**:
End the session and discard its text. Session text never reaches disk.
_Avoid_: clear, delete, reset, save
