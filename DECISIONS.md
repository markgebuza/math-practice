# Design Decisions

Choices made where `math-practice-specification.md` is vague or leaves an option open.
All entries were reviewed and **ACCEPTED** on 2026-10-21. To change one, edit the answer and mark it
**CHANGED**.

---

## 1. Difficulty ranges

### 1.1 Addition ranges — ACCEPTED
| Level | Operands | Result |
|---|---|---|
| 1 | 0–10 | ≤ 20 (automatic) |
| 2 | 0–50 | ≤ 100 (automatic) |
| 3 | 0–100 | ≤ 200 |
| 4 | 0–1,000 | ≤ 1,000 ("numbers up to 1,000" read as both operands and result) |

### 1.2 Subtraction ranges — ACCEPTED
Same operand ranges as addition. First operand ≥ second operand at every level, so the
answer is 0 or more.

### 1.3 Level 3 multiplication: what is "two-digit"? — ACCEPTED
- Half the questions are one-digit × one-digit: both factors 2–9.
- Half are one-digit × two-digit: one factor 2–9, the other **10–20**.
- The order of the two factors is random. Products are at most 180.
- Reason: 10–99 would allow 9 × 99 = 891, which is too hard for "Intermediate" when
  Level 2 stops at 10 × 10.

### 1.4 Level 4 multiplication — ACCEPTED
- Half are two-digit × one-digit: 10–99 × 2–9 (product ≤ 891).
- Half are two-digit × two-digit: both factors **10–25** (product ≤ 625).

### 1.5 Multiplication factors at Levels 1–2 — ACCEPTED
Level 1 uses factors 0–5 and Level 2 uses 0–10, exactly as the spec says. Questions with
a 0 factor are allowed but limited to about 1 in 10, so they don't crowd out real practice.

### 1.6 Division ranges and quotient 0 — ACCEPTED
Generated as `dividend = divisor × quotient`.

| Level | Divisor | Quotient | Max dividend |
|---|---|---|---|
| 1 | 1–5 | 1–5 | 25 |
| 2 | 1–10 | 1–10 | 100 |
| 3 | 1–12 | 1–12 | 144 |
| 4 | 2–25 | 2–40 | 1,000 (regenerate if over) |

- **Quotient 0 is not allowed** (no `0 ÷ n`). It's trivial, confusing at this age, and
  leaves almost no plausible distractors.
- Level 4: "one- or two-digit divisors" is limited to 2–25 so long division stays reasonable.

### 1.7 Level 4 "optional negative answers" — ACCEPTED
**Off, with no setting in the first release.** Subtraction never goes negative at any level.
`AppSettings` in the spec has no field for it, and negative numbers are beyond most
7–12 year olds. It could be added later as an `allowNegativeAnswers` setting.

---

## 2. Mistake patterns

### 2.1 When are two mistakes the same pattern? — ACCEPTED
- Same operation + same operands → same pattern. Missing 8 × 7 again increments
  `incorrectCount` on the existing pattern and does not create a duplicate.
- **Addition and multiplication are commutative:** 7 × 8 counts as the same pattern as
  8 × 7 (match on sorted operands). The stored operands stay as first missed.
- **Subtraction and division are not:** 10 − 3 and 3 − 10, or 56 ÷ 8 and 56 ÷ 7, are
  different patterns.
- Patterns at different difficulty levels with the same fact still count as one pattern.
  Its difficulty is updated to the most recent mistake's level.

### 2.2 Wrong answer on a review question — ACCEPTED
- The source pattern's `incorrectCount` goes up by 1, `lastIncorrectAt` is updated, and
  **`similarCorrectCount` resets to 0**. Mastery therefore means "N correct similar
  answers in a row".
- The child never sees a counter go down. Progress is shown only as "keep practicing".

### 2.3 Mastery and reactivation — ACCEPTED
- A pattern is mastered when `similarCorrectCount` ≥ the mastery threshold from Settings
  (default 3, allowed 1–10). Mastered patterns are left out of review.
- A later mistake on the same fact (regular or review) sets `mastered = false` and
  `similarCorrectCount = 0`, and increments `incorrectCount`.
- Only correct answers to **review** questions count toward mastery. A correct regular
  answer to the same fact does not.
- If the threshold is lowered in Settings, patterns already at or above the new threshold
  become mastered the next time patterns load. Raising it does not un-master patterns.

### 2.4 Review sessions — ACCEPTED
- In mistake-review mode, setup ignores the operation and difficulty selectors (they are
  shown disabled with an explanation). Every active pattern is eligible, and each question
  uses its pattern's difficulty.
- Start Session is enabled in review mode only when at least one active pattern exists.
- If there are fewer patterns than questions, patterns repeat in priority order, but the
  same generated question is never shown twice in a row.
- Review attempts count in overall, per-operation and per-difficulty statistics, and are
  also counted separately as "similar questions practiced".

---

## 3. Statistics and data

### 3.1 What Reset Statistics clears — ACCEPTED
- **Clears:** attempts, sessions, aggregate statistics.
- **Keeps:** mistake patterns (they hold what the child still needs to practice, not
  a score) and settings.
- The confirmation dialog states exactly what will be cleared and what will be kept.
- **Clear All Application Data** (Settings) removes everything, including patterns and
  settings, and restores defaults.

### 3.2 Self-reported result vs. the selected answer — ACCEPTED
The app records what the child reports (`selfReportedCorrect`), as the spec says, even if
it differs from `selectedAnswer === correctAnswer`. The card back shows both values clearly
so the child can judge honestly. Statistics use the self-reported value.

### 3.3 Ending a continuous session with 0 answers — ACCEPTED
No session record is saved. The app goes to the summary page with a friendly
"No questions answered this time" message.

### 3.4 Recent sessions shown — ACCEPTED
The 20 most recent completed sessions, newest first.

---

## 4. Setup page

### 4.1 What "Mixed operations" means — ACCEPTED
"Mixed operations" is the **select-all** toggle: it selects all four operations, and
deselecting it clears them. It is shown as selected whenever all four are selected. There
is no separate mixed mode. Each question picks one of the selected operations at random.

### 4.2 Default settings — ACCEPTED
| Setting | Default |
|---|---|
| Default operations | Addition |
| Default difficulty | Level 1 (Beginner) |
| Default session length | 10 questions |
| Sound effects | Off (friendlier for classrooms; easy to turn on) |
| Card animation | On (always off when `prefers-reduced-motion` is set) |
| Show explanations | On |
| Mastery threshold | 3 |

---

## 5. Card back explanations — ACCEPTED

Shown when "Show explanations" is on. Short, one sentence, using the actual numbers:

| Operation | Template | Example |
|---|---|---|
| Addition | "Start at A and count on B more to get C." | "Start at 7 and count on 8 more to get 15." |
| Subtraction | "Check it: C + B = A." | "15 − 8 = 7. Check it: 7 + 8 = 15." |
| Multiplication | "A × B means A groups of B, which is C." | "3 × 4 means 3 groups of 4, which is 12." |
| Division | "A ÷ B = C because B × C = A." | "56 ÷ 8 = 7 because 8 × 7 = 56." |

Special cases:
- Anything × 0 or 0 × anything: "Any number times 0 is 0."
- × 1: "Any number times 1 stays the same."
- Addition with a large second operand (Level 3+): "Add the tens, then the ones." instead
  of counting on.
- Level 3+ addition/subtraction that crosses a ten: mention carrying/borrowing in one phrase.

Explanations never comment on whether the child was right or wrong.

---

## 6. Sound effects — ACCEPTED

- Generated with the **Web Audio API** (`AudioContext` + `OscillatorNode` + `GainNode`
  envelope). No audio files, no external services.
- **I Got It Right:** two short rising sine notes (C5 → E5, about 120 ms each).
- **I Got It Wrong:** one soft low sine note (about G4, 200 ms). Gentle, not a buzzer.
- **Session complete:** short three-note rising arpeggio.
- Volume is low (gain ≈ 0.15) with quick fade in and fade out to avoid clicks.
- The `AudioContext` is created on the first user click (browser autoplay rules). If
  Web Audio is unavailable, sounds are skipped silently.
- Nothing plays when the setting is off.

---

## 7. Other small choices — ACCEPTED

- **Immediate repetition:** a question repeats if it has the same operation and operands
  (for commutative operations, the same sorted operands). The next question regenerates
  until it differs, up to a retry limit.
- **IDs:** `crypto.randomUUID()`, with a timestamp+random fallback for older browsers.
- **Display symbols:** `+`, `−` (U+2212), `×`, `÷` in the UI. Screen-reader labels say
  "plus", "minus", "times" and "divided by".
