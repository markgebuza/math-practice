# Math Practice App --- Software Specification

## 1. Project Overview

The Math Practice App is a browser-based educational application for
children ages 7--12. It helps students practice fundamental arithmetic
through interactive multiple-choice flashcards.

Supported operations: - Addition - Subtraction - Multiplication -
Division

Students answer questions, flip cards to reveal the correct answer, and
record whether they answered correctly or incorrectly. The app remembers
incorrectly answered questions and generates similar questions for
additional practice.

The app uses React and does not require an account or sign-in.

## 2. Goals

1.  Provide an easy-to-use math practice experience for children ages
    7--12.
2.  Organize questions into difficulty levels.
3.  Give students immediate feedback after each question.
4.  Track correct and incorrect answers.
5.  Identify areas where a student needs more practice.
6.  Generate similar questions based on previous mistakes.
7.  Store progress locally without requiring an account.

## 3. Target Users

-   **Primary:** Children ages 7--12 practicing arithmetic.
-   **Secondary:** Parents, guardians, or teachers reviewing progress.

## 4. Technology Stack

### Frontend

-   React
-   TypeScript (recommended)
-   HTML5 and CSS3

### State Management

Use React Context and hooks such as `useState`, `useReducer`, and
`useContext`. A third-party state-management library is not required
initially.

### Data Storage

Use browser `localStorage` for settings, practice history, mistake
patterns, statistics, and current difficulty. No backend or database is
required for the initial release.

### Supporting Libraries

-   React Router for navigation
-   Vitest for tests
-   React Testing Library for component tests
-   ESLint and Prettier for code quality and formatting

## 5. Application Pages

1.  Home
2.  Practice setup
3.  Practice
4.  Statistics
5.  Settings
6.  Session summary

## 6. Functional Requirements

### 6.1 Home Page

Display the application title, a child-friendly welcome message, and
buttons for **Start Practice**, **View Statistics**, and **Settings**.
Each button navigates to its corresponding page.

### 6.2 Practice Setup Page

Allow the user to select one or more operations: - Addition -
Subtraction - Multiplication - Division - Mixed operations

Allow one difficulty level: - Level 1: Beginner - Level 2: Easy - Level
3: Intermediate - Level 4: Advanced

Allow session length: - 5 questions - 10 questions - 20 questions -
Continuous practice

Allow a mode: - Regular practice - Practice similar questions from
previous mistakes

Include a **Start Session** button. Disable it until at least one
operation and one difficulty level are selected.

### 6.3 Practice Page and Question Cards

Each question appears on a card.

**Card front** - Arithmetic question - Four multiple-choice answers -
Current question number and total - Optional progress bar

Example:

``` text
Question 3 of 10

7 × 8 = ?

[48] [54] [56] [64]
```

**Answer selection** - The user selects one answer before flipping. -
Highlight the selected answer. - Enable the **Flip Card** button after
selection. - Do not record the result yet.

**Flip card** - Animate the card to reveal the back. - Show the original
question, correct answer, selected answer, and a brief explanation when
appropriate. - Show **I Got It Right** and **I Got It Wrong** buttons.

**Self-reported result** Selecting either button must: 1. Record the
result. 2. Update session statistics. 3. Save the result locally. 4.
Move to the next question. 5. Prevent the same attempt from being
counted more than once.

**Next question** Automatically show the next card after a result is
recorded. Reset selection and flip state.

### 6.4 Similar Question Generation

When a student marks a question incorrect, remember the question pattern
and generate similar questions in future sessions.

For example, an incorrect `8 × 7` question could lead to: - `7 × 8` -
`8 × 6` - `9 × 7` - `56 ÷ 7` - `56 ÷ 8`

Store: - Operation - Both operands - Correct answer - Difficulty - Date
and time - Number of times answered incorrectly - Number of similar
questions later answered correctly

Similarity strategies: - Same operation with nearby numbers - Reversed
operands for addition and multiplication - Related inverse operations -
Same multiplication/division fact family - Same difficulty and numeric
range

Give higher review priority to patterns missed repeatedly or recently,
and to patterns with little successful review. A pattern may be
considered mastered after three correct similar questions; make this
threshold configurable.

### 6.5 Session Completion

At the end of a fixed-length session, show: - Total questions
attempted - Correct answers - Incorrect answers - Accuracy percentage -
Operations practiced - Difficulty level - Mistake-review questions
completed

Actions: - Practice Again - Practice Mistakes - Change Settings - View
Statistics - Return Home

Continuous practice should have an **End Session** button.

### 6.6 Statistics Page

Show overall: - Total questions attempted - Correct answers - Incorrect
answers - Accuracy percentage

Accuracy formula:

``` text
correct answers / total questions attempted × 100
```

Handle zero attempts without dividing by zero.

Show statistics by operation (addition, subtraction, multiplication,
division) and by difficulty level. Each breakdown includes attempted,
correct, incorrect, and accuracy.

Show mistake-review statistics: - Active mistake patterns - Mastered
mistake patterns - Most frequently missed operation - Most frequently
missed number facts - Similar questions practiced

Show recent sessions with date, operations, difficulty, attempted,
correct, incorrect, and accuracy.

Include **Reset Statistics** with a confirmation dialog. Resetting
statistics should not silently delete data.

### 6.7 Settings Page

Provide: - Sound effects on/off - Card animation on/off - Show
explanations on/off - Default session length - Default difficulty -
Default operations - Number of correct similar questions required for
mastery - Clear all application data

Persist settings in `localStorage`.

## 7. Difficulty Levels

These are initial guidelines; implement the numeric constraints
consistently in the question generator.

### Level 1: Beginner

-   **Addition:** operands 0--10; results no greater than 20.
-   **Subtraction:** operands 0--10; no negative answers.
-   **Multiplication:** factors 0--5.
-   **Division:** divisors 1--5; whole-number answers only.

### Level 2: Easy

-   **Addition:** operands 0--50; results no greater than 100.
-   **Subtraction:** operands 0--50; no negative answers.
-   **Multiplication:** factors 0--10.
-   **Division:** divisors 1--10; whole-number answers only.

### Level 3: Intermediate

-   **Addition:** operands 0--100; may include carrying.
-   **Subtraction:** operands 0--100; may include borrowing; no negative
    answers by default.
-   **Multiplication:** one-digit by one-digit and one-digit by
    two-digit.
-   **Division:** divisors 1--12, dividends up to 144, whole-number
    answers.

### Level 4: Advanced

-   **Addition:** numbers up to 1,000.
-   **Subtraction:** numbers up to 1,000; optional negative answers.
-   **Multiplication:** two-digit by one-digit and two-digit by
    two-digit.
-   **Division:** larger dividends and one- or two-digit divisors;
    whole-number answers initially.

Division with remainders may be added later.

## 8. Question Generation

### 8.1 Question Data Model

``` ts
type MathOperation =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division";

type DifficultyLevel = 1 | 2 | 3 | 4;

interface Question {
  id: string;
  operation: MathOperation;
  firstOperand: number;
  secondOperand: number;
  displayText: string;
  correctAnswer: number;
  choices: number[];
  difficulty: DifficultyLevel;
  source: "regular" | "mistake-review";
  mistakePatternId?: string;
}
```

### 8.2 Multiple-Choice Answers

Each question has four choices: one correct answer and three plausible
incorrect answers. Choices must be unique, must not duplicate the
correct answer, and must match expected answer constraints. Shuffle the
choices so the correct answer is not predictably positioned.

Use distractor strategies such as nearby numbers, common arithmetic
mistakes, neighboring multiplication facts, and small answer
differences.

### 8.3 Division Rules

Avoid fractional answers in the initial release by selecting a nonzero
divisor and whole-number quotient, then calculating:

``` text
dividend = divisor × quotient
```

Never generate division by zero.

## 9. Data Models

### Practice Attempt

``` ts
interface PracticeAttempt {
  id: string;
  questionId: string;
  operation: MathOperation;
  firstOperand: number;
  secondOperand: number;
  correctAnswer: number;
  selectedAnswer: number;
  selfReportedCorrect: boolean;
  difficulty: DifficultyLevel;
  source: "regular" | "mistake-review";
  attemptedAt: string;
  sessionId: string;
}
```

### Practice Session

``` ts
interface PracticeSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  operations: MathOperation[];
  difficulty: DifficultyLevel;
  sessionLength: number | "continuous";
  attempted: number;
  correct: number;
  incorrect: number;
}
```

### Mistake Pattern

``` ts
interface MistakePattern {
  id: string;
  operation: MathOperation;
  firstOperand: number;
  secondOperand: number;
  correctAnswer: number;
  difficulty: DifficultyLevel;
  incorrectCount: number;
  similarCorrectCount: number;
  lastIncorrectAt: string;
  mastered: boolean;
}
```

### Statistics

``` ts
interface OperationStatistics {
  attempted: number;
  correct: number;
  incorrect: number;
}

interface AppStatistics {
  attempted: number;
  correct: number;
  incorrect: number;
  byOperation: Record<MathOperation, OperationStatistics>;
  byDifficulty: Record<DifficultyLevel, OperationStatistics>;
}
```

## 10. Local Storage Structure

Suggested keys: - `mathPractice.settings` - `mathPractice.sessions` -
`mathPractice.attempts` - `mathPractice.mistakePatterns` -
`mathPractice.statistics` - `mathPractice.version`

Store a schema version so stored data can be migrated when the structure
changes. If storage is unavailable or full, keep the current session
running when possible, show a friendly warning, and avoid crashing.

## 11. Application State

``` ts
interface AppState {
  settings: AppSettings;
  currentSession: PracticeSession | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  isCardFlipped: boolean;
  attempts: PracticeAttempt[];
  mistakePatterns: MistakePattern[];
  statistics: AppStatistics;
}
```

## 12. User Interface Requirements

The interface should be bright, welcoming, readable, child-friendly,
responsive, and free from unnecessary distractions.

Buttons should be large, clearly labeled, and show hover, focus, and
pressed states. The question card should be centered, use large math
text, and remain usable with animations disabled.

Use supportive feedback such as "Great job!", "Nice work!", "Keep
practicing!", and "You are improving!". Avoid shaming or discouraging
students.

## 13. Accessibility Requirements

Follow WCAG accessibility principles: - Keyboard-accessible controls and
visible focus - Semantic HTML and proper button labels - Sufficient text
contrast - Screen-reader-friendly question text - Reduced-motion
support - No information conveyed by color alone

Suggested keyboard controls: - Number keys `1`--`4` select answers. -
Enter activates the focused button. - Space activates buttons and card
controls. - Tab moves between interactive controls.

The answer must be accessible without relying on the flip animation.
Update appropriate accessibility attributes or use a live region to
announce the revealed answer.

## 14. Responsive Design

Support desktop, laptop, tablet, and mobile browsers. Prioritize tablet
usability. On small screens, stack answer choices, simplify navigation,
and convert wide statistics tables into stacked cards where appropriate.

## 15. Navigation

Use React Router with routes: - `/` - `/practice/setup` -
`/practice/session` - `/practice/summary` - `/statistics` - `/settings`

Prevent accidental loss of an active session. If the user tries to
leave, show a confirmation message.

## 16. Error Handling

Handle: - Invalid locally stored data - Missing session data -
Question-generation failures - Duplicate answer choices - Unsupported or
full storage - Corrupted statistics - Unexpected navigation to the
practice page

Reset only affected invalid data when possible instead of deleting all
user data.

## 17. Validation Rules

Before displaying a question: - Operation is supported. - Correct answer
is valid. - Division by zero is impossible. - Division answers are whole
numbers. - Exactly four unique choices exist. - Exactly one choice
equals the correct answer. - Question fits the selected difficulty.

Before recording an attempt: - An answer has been selected. - The card
has been flipped. - The user selected correct or incorrect. - The
attempt has not already been recorded.

## 18. Suggested React Component Structure

``` text
src/
├── app/
│   ├── App.tsx
│   ├── AppRoutes.tsx
│   └── AppProvider.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── PageContainer.tsx
│   ├── practice/
│   │   ├── QuestionCard.tsx
│   │   ├── AnswerChoice.tsx
│   │   ├── CardFront.tsx
│   │   ├── CardBack.tsx
│   │   ├── ProgressBar.tsx
│   │   └── SessionSummary.tsx
│   ├── statistics/
│   │   ├── StatisticsOverview.tsx
│   │   ├── OperationStatistics.tsx
│   │   ├── DifficultyStatistics.tsx
│   │   ├── MistakeStatistics.tsx
│   │   └── RecentSessions.tsx
│   └── common/
│       ├── Button.tsx
│       ├── ConfirmDialog.tsx
│       └── EmptyState.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── PracticeSetupPage.tsx
│   ├── PracticePage.tsx
│   ├── SessionSummaryPage.tsx
│   ├── StatisticsPage.tsx
│   └── SettingsPage.tsx
├── services/
│   ├── questionGenerator.ts
│   ├── similarQuestionGenerator.ts
│   ├── statisticsService.ts
│   └── storageService.ts
├── hooks/
│   ├── usePracticeSession.ts
│   ├── useStatistics.ts
│   └── useLocalStorage.ts
├── types/
│   ├── question.ts
│   ├── session.ts
│   ├── statistics.ts
│   └── settings.ts
└── utils/
    ├── math.ts
    ├── shuffle.ts
    ├── ids.ts
    └── validation.ts
```

## 19. Core Services

### Question Generator

Responsibilities: generate questions for an operation and difficulty,
calculate answers, generate plausible distractors, shuffle choices, and
validate output.

``` ts
function generateQuestion(
  operation: MathOperation,
  difficulty: DifficultyLevel
): Question;
```

### Similar Question Generator

Responsibilities: select an active mistake pattern, generate a related
question, avoid excessive repetition, and update mastery progress.

``` ts
function generateSimilarQuestion(
  pattern: MistakePattern
): Question;
```

### Statistics Service

Record attempts, update overall/operation/difficulty statistics,
calculate accuracy, and produce session summaries.

### Storage Service

Read and write local data, validate it, apply schema migrations, clear
selected data, and clear all data.

## 20. Testing Requirements

### Unit tests

-   Arithmetic question generation
-   Difficulty boundaries
-   Distractor generation and choice uniqueness
-   Similar-question generation
-   Statistics and accuracy calculations
-   Mastery rules
-   Local-storage serialization

### Component tests

-   Answer selection
-   Flip behavior
-   Correct/incorrect buttons
-   Card front and back
-   Session progress and completion
-   Statistics display
-   Reset confirmation

### Integration tests

1.  Start a practice session.
2.  Select an answer.
3.  Flip the card.
4.  Mark the answer incorrect.
5.  Confirm statistics update.
6.  Confirm a mistake pattern is stored.
7.  Start mistake-review mode.
8.  Confirm a similar question appears.

Also test no stored data, corrupted storage, zero attempts,
all-correct/all-incorrect sessions, continuous practice, refresh during
a session, duplicate distractors, division-by-zero prevention, and small
screen widths.

## 21. Security and Privacy

Keep student data in the browser. Avoid collecting personal information,
sending practice history to external services, or using third-party
analytics that track children. Avoid advertisements and external links
in the child-facing interface. Explain that clearing browser data may
erase progress. Cloud storage or accounts added later may require
additional child-privacy review.

## 22. Performance Requirements

-   Load quickly on typical home and school connections.
-   Generate questions without noticeable delay.
-   Animate cards smoothly.
-   Avoid unnecessary re-renders.
-   Support several thousand stored attempts.
-   Keep local-storage records compact.

Summarize or archive old detailed attempts if storage grows too large,
while preserving aggregate statistics.

## 23. Minimum Viable Product

The first release should include: - Four arithmetic operations - Four
difficulty levels - Multiple-choice question cards - Card flipping -
Self-reported correct/incorrect buttons - Local tracking of incorrect
questions - Similar-question generation - Overall statistics -
Statistics by operation and difficulty - Session summaries -
Local-storage persistence - Responsive design - Basic accessibility

## 24. Future Enhancements

-   Parent or teacher dashboard
-   Multiple child profiles
-   Optional accounts and cloud synchronization
-   Timed practice
-   Daily goals and practice streaks
-   Badges and rewards
-   Audio reading of questions
-   Visual math explanations
-   Fractions and decimals
-   Division with remainders
-   Custom number ranges
-   Printable worksheets
-   Classroom mode
-   Adaptive difficulty
-   Progressive web app and offline installation
-   Exportable progress reports

## 25. Acceptance Criteria

The initial release is complete when: 1. Users can select operations and
difficulty. 2. Users can start fixed-length or continuous sessions. 3.
Each question appears on a multiple-choice card with four unique
choices. 4. Users can select an answer and flip the card. 5. The back
reveals the correct answer. 6. Users can mark the attempt correct or
incorrect. 7. Each attempt is counted exactly once. 8. Incorrect
questions create or update mistake patterns. 9. Similar questions can be
generated from mistakes. 10. Statistics persist after restarting the
browser. 11. Statistics show attempted, correct, and incorrect totals.
12. Statistics can be viewed by operation and difficulty. 13. Statistics
can be reset after confirmation. 14. The app works without an account or
backend. 15. Main features support keyboard navigation. 16. The
interface works on desktop, tablet, and mobile.

## 26. Assumptions

-   One child uses a given browser profile.
-   Progress is stored only in the current browser on the current
    device.
-   The child self-reports whether an answer was correct.
-   Division uses whole-number answers in the first release.
-   Subtraction does not produce negative answers unless enabled.
-   The initial app is client-side React.
-   No personally identifiable information is collected.
