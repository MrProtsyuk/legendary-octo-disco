---
title: claude-status-bar
summary: A per-turn task progress bar for the Claude Code status line, driven by real todo completion rather than a number the model made up.
imageUrl: /images/projects/claude-status-bar.png
techStack: [Python, Claude Code, Bash]
githubUrl: https://github.com/MrProtsyuk/claude-status-bar
featured: true
order: 1
---

Claude Code shows you what it's doing, but not how far along it is. `claude-status-bar`
adds a green progress bar to the status line that fills across a single turn: 0% when you
send a prompt, 100% when the turn ends.

## The honesty problem

The obvious way to build this is to ask the model how far along it is. That doesn't work —
"percent complete" isn't a quantity the agent actually has, so the answer is fabricated and
non-monotonic. It jumps backward, which is worse than showing nothing.

So the bar is ranked by signal quality instead:

- **Todo list** (`completed / total`) — used whenever the turn has one. Measured, not guessed.
- **Tool calls**, run through a saturating curve — used only on turns with no todo list, and labeled `(est.)`.
- **Context-window usage** — never drives the bar. It measures context, not work, so it rides along as dim trailing text.

The fallback estimate is `95·n/(n+6)` over tool calls `n`. Two properties keep it from
lying in the way that would matter: it's **monotonic**, since `n` only ever increases
within a turn, so the bar never jumps backward; and it's **asymptotic**, bounded below 95
for any finite `n`, so it *cannot* reach 100% on its own. Only the end of the turn
completes the bar — it will never sit at 100% while Claude is still working.

It's still coarse. Todo items aren't equal-sized, so `3/6` doesn't mean half the wall-clock
work is done. This is an indicator of position in a plan, not an ETA, and the write-up says
so rather than pretending otherwise.

## How it works

Three decoupled processes sharing three small files in `/tmp`, keyed on session ID so
concurrent sessions in different repos don't overwrite each other:

```
any tool call ──PostToolUse──▶ activity file (size = count)
  └── if TodoWrite ──────────▶ progress file ("2/5")

UserPromptSubmit ──raises────▶ busy flag
Stop / StopFailure ──lowers──▶ busy flag
                                   │
                                   ▼
                  statusline-progress.py ──▶ two rows
```

The hooks are the only writers, the status line is the only reader, and neither imports
the other.

The activity counter is my favorite detail: the file's **size** is the count, and each tool
call appends a single byte. `O_APPEND` writes can't interleave, so overlapping tool calls
each get counted — where a read-modify-write integer would silently lose increments.

## Putting the footer hints back

Configuring any custom status line makes Claude Code stop drawing most of its footer
keyboard hints, and there's no setting to keep them. So the project redraws the two worth
having on a second row.

That turned out to be the harder half. Nothing on the status line's stdin says whether
Claude is currently working, so a hardcoded `esc to interrupt` would sit there lying every
time the session went idle. The `turn-state-hook.py` flag file supplies the missing state —
existence *is* the flag, with no contents to parse — and the hint only renders while it's
up.

## What's verified, and what isn't

`./test.sh` runs 49 assertions with no dependencies beyond bash and Python 3: the full turn
lifecycle, the curve at 1/6/20 calls, the estimate never decreasing and never reaching 100%
while busy, todo ratio outranking the estimate, missing state files, a null context
percentage, an empty todo list, malformed hook stdin, and the symlink guards.

Two things it can't cover because they need a live session: that the bar keeps advancing
during a long turn, and what pressing `esc` does to the busy flag. `Stop` and `StopFailure`
aren't documented as firing on a user interrupt, so that edge case is written down as open
rather than quietly assumed away. A staleness timeout would be the wrong fix — it would
misreport long legitimate turns.

All three state files open with `O_NOFOLLOW` and mode `0600`, and the reader uses `lstat`
rather than `stat`. `/tmp` is world-writable, so without that a pre-planted symlink would
make a hook truncate whatever it points at. Session IDs are UUIDs, so it was never
practically exploitable — but the guard costs nothing on a shared host.
