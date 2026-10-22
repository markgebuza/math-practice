# Math Practice App --- Implementation Todo List

Tasks are ordered from foundational and relatively easy work to more
complex features. Complete them in sequence where practical; later tasks
depend on earlier ones.

## Phase 1: Project Setup

### 1. Create the React Project

-   [x] Create a React project using Vite.
-   [x] Configure TypeScript.
-   [x] Install dependencies.
-   [x] Confirm the development server runs.
-   [x] Remove default demonstration content.
-   [x] Create the initial folder structure.

``` bash
npm create vite@latest math-practice-app -- --template react-ts
cd math-practice-app
npm install
npm run dev
```

### 2. Configure Development Tools

-   [x] Configure ESLint.
-   [x] Configure Prettier.
-   [x] Add lint and format scripts.
-   [x] Install Vitest.
-   [x] Install React Testing Library.
-   [x] Create and run one basic component test.

### 3. Define Shared TypeScript Types

-   [x] Define `MathOperation`.
-   [x] Define `DifficultyLevel`.
-   [x] Define `Question`.
-   [x] Define `PracticeAttempt`.
-   [x] Define `PracticeSession`.
-   [x] Define `MistakePattern`.
-   [x] Define statistics interfaces.
-   [x] Define application settings.

Suggested files: `src/types/question.ts`, `session.ts`, `statistics.ts`,
`mistake.ts`, and `settings.ts`.

## Phase 2: Basic Interface

### 4. Create the Shared Page Layout

-   [x] Create a reusable page container.
-   [x] Create the header and navigation.
-   [x] Add the application title.
-   [x] Define shared button styles.
-   [x] Add responsive spacing and child-friendly typography.

### 5. Create the Home Page

-   [x] Add a welcome message.
-   [x] Add **Start Practice**.
-   [x] Add **View Statistics**.
-   [x] Add **Settings**.
-   [x] Make buttons keyboard accessible.

### 6. Add Application Routing

-   [x] Install React Router.
-   [x] Create routes for home, setup, session, summary, statistics, and
    settings.
-   [x] Connect navigation buttons.
-   [x] Add a not-found route.

Routes: `/`, `/practice/setup`, `/practice/session`,
`/practice/summary`, `/statistics`, `/settings`.

## Phase 3: Practice Configuration

### 7. Create the Operation Selector

-   [x] Add addition, subtraction, multiplication, and division.
-   [x] Allow multiple operations to be selected.
-   [x] Add a select-all option.
-   [x] Show selected states.
-   [x] Support keyboard interaction.

### 8. Create the Difficulty Selector

-   [x] Add Beginner, Easy, Intermediate, and Advanced.
-   [x] Allow one level to be selected.
-   [x] Show the selected level.
-   [x] Add a short description for each level.

### 9. Create the Session-Length Selector

-   [x] Add 5 questions.
-   [x] Add 10 questions.
-   [x] Add 20 questions.
-   [x] Add continuous practice.
-   [x] Set a default.

### 10. Build the Practice Setup Page

-   [x] Combine operation, difficulty, and session-length selectors.
-   [x] Add **Start Session**.
-   [x] Disable it until required choices are made.
-   [x] Show validation feedback.
-   [x] Pass configuration to the session.

## Phase 4: Basic Math Question Generation

### 11. Create Question Utilities

-   [x] Create a random integer utility.
-   [x] Create an array-shuffling utility.
-   [x] Create a unique-ID utility.
-   [x] Add unit tests.

### 12. Implement Addition Questions

-   [x] Generate operands.
-   [x] Apply difficulty constraints.
-   [x] Calculate the answer and display text.
-   [x] Return a valid `Question`.
-   [x] Test operand and result boundaries.

### 13. Implement Subtraction Questions

-   [x] Generate operands.
-   [x] Prevent negative answers initially.
-   [x] Apply difficulty constraints.
-   [x] Calculate answer and display text.
-   [x] Test that the first operand is not smaller than the second.

### 14. Implement Multiplication Questions

-   [x] Generate factors.
-   [x] Apply difficulty constraints.
-   [x] Calculate the product.
-   [x] Return a valid question.
-   [x] Test factor ranges at every level.

### 15. Implement Division Questions

-   [x] Generate a nonzero divisor.
-   [x] Generate a whole-number quotient.
-   [x] Calculate dividend as divisor × quotient.
-   [x] Apply difficulty constraints.
-   [x] Ensure division by zero and fractional answers cannot occur.

### 16. Create the Main Question Generator

-   [x] Accept operation and difficulty.
-   [x] Call the correct operation-specific generator.
-   [x] Randomly choose among selected operations.
-   [x] Validate generated questions.
-   [x] Handle generation failures.
-   [x] Test all operations and difficulty levels.

## Phase 5: Multiple-Choice Answers

### 17. Generate Incorrect Answer Choices

-   [x] Generate three incorrect answers.
-   [x] Ensure distractors differ from the correct answer.
-   [x] Ensure all choices are unique.
-   [x] Keep distractors plausible.
-   [x] Respect nonnegative and whole-number constraints.
-   [x] Add a retry limit to avoid infinite loops.

### 18. Add Operation-Specific Distractors

-   [x] Add nearby-number distractors.
-   [x] Add common addition mistakes.
-   [x] Add common subtraction mistakes.
-   [x] Add multiplication-table distractors.
-   [x] Add division fact-family distractors.
-   [x] Test edge cases near zero.

### 19. Shuffle Answer Choices

-   [x] Combine the correct answer and distractors.
-   [x] Shuffle all four choices.
-   [x] Verify the correct answer appears exactly once.
-   [x] Test for predictable answer positions.

## Phase 6: Question Card

### 20. Create the Answer Choice Component

-   [x] Display each choice as a button.
-   [x] Support selected and unselected states.
-   [ ] Add hover and focus states.
-   [x] Use large touch targets.
-   [x] Add accessible labels.
-   [x] Prevent changes after the card is flipped.

### 21. Create the Card Front

-   [x] Display the arithmetic question.
-   [x] Display four answer choices.
-   [x] Display current question number and total.
-   [x] Add a **Flip Card** button.
-   [x] Disable flipping until an answer is selected.
-   [x] Use large, readable math text.

### 22. Add Answer Selection

-   [x] Store the selected answer in state.
-   [x] Highlight the selected choice.
-   [x] Allow changing the choice before flipping.
-   [x] Enable the flip button after selection.
-   [x] Reset selection for each new question.

### 23. Create the Card Back

-   [x] Display the original question.
-   [x] Display the correct answer.
-   [x] Display the selected answer.
-   [x] Add **I Got It Right**.
-   [x] Add **I Got It Wrong**.
-   [x] Prevent duplicate result submission.

### 24. Add Card-Flipping Behavior

-   [x] Add `isCardFlipped` state.
-   [x] Show the front before flipping and back after.
-   [x] Prevent answer changes after flipping.
-   [x] Reset flip state for the next question.
-   [x] Ensure the card remains usable without animation.

### 25. Add the Flip Animation

-   [x] Implement CSS flip animation.
-   [x] Keep front and back aligned.
-   [x] Prevent mirrored text.
-   [x] Respect reduced-motion preferences.
-   [ ] Add an animation setting.

## Phase 7: Practice Session

### 26. Create Session State

-   [x] Store session ID.
-   [x] Store selected operations, difficulty, and length.
-   [x] Store current question index.
-   [x] Store session correct and incorrect totals.
-   [x] Track whether the session is active.

### 27. Build the Practice Session Page

-   [x] Read setup configuration.
-   [x] Generate the first question.
-   [x] Display the question card.
-   [x] Handle missing or invalid configuration.
-   [x] Redirect to setup if no valid session exists.

### 28. Record Self-Reported Results

-   [x] Handle the right button.
-   [x] Handle the wrong button.
-   [x] Increment attempted total.
-   [x] Increment correct or incorrect total.
-   [x] Prevent duplicate recording.
-   [x] Store the completed attempt.

### 29. Advance to the Next Question

-   [x] Generate the next question after a result is recorded.
-   [x] Increment question number.
-   [x] Reset selected answer and flip state.
-   [x] Avoid immediate repetition.
-   [ ] Add an optional short transition.

### 30. Add Session Progress

-   [x] Display "Question X of Y".
-   [x] Add a progress bar.
-   [x] Update progress after each attempt.
-   [x] Handle continuous practice without a fixed total.
-   [ ] Make progress accessible to screen readers.

### 31. Support Continuous Practice

-   [x] Generate questions without a fixed endpoint.
-   [x] Add **End Session**.
-   [x] Confirm before ending if appropriate.
-   [x] Show the summary when the session ends.

## Phase 8: Session Summary

### 32. Detect Session Completion

-   [x] Compare attempts with the configured session length.
-   [x] Stop generating when complete.
-   [x] Save the completion timestamp.
-   [x] Navigate to the summary page.

### 33. Create the Session Summary Page

-   [x] Display attempted, correct, and incorrect totals.
-   [x] Calculate accuracy.
-   [x] Display operations and difficulty.
-   [x] Display mistake-review question count.

### 34. Add Summary Actions

-   [x] Add **Practice Again**.
-   [ ] Add **Practice Mistakes**.
-   [x] Add **Change Settings**.
-   [x] Add **View Statistics**.
-   [x] Add **Return Home**.

## Phase 9: Local Data Storage

### 35. Create the Storage Service

-   [ ] Wrap `localStorage` access.
-   [ ] Add read and write functions.
-   [ ] Handle JSON parsing errors.
-   [ ] Validate loaded data.
-   [ ] Handle unavailable or full storage.

### 36. Add Data Schema Versioning

-   [ ] Store a schema version.
-   [ ] Detect missing or older versions.
-   [ ] Create an initial migration structure.
-   [ ] Avoid deleting unrelated stored data.

### 37. Persist Settings

-   [ ] Save settings.
-   [ ] Load settings at startup.
-   [ ] Use defaults when settings are missing.
-   [ ] Recover from invalid stored settings.

### 38. Persist Practice Sessions

-   [ ] Save session information.
-   [ ] Save completion details.
-   [ ] Load recent sessions.
-   [ ] Limit or summarize old records if needed.

### 39. Persist Practice Attempts

-   [ ] Save each completed attempt.
-   [ ] Include selected answer, result, operation, difficulty, session
    ID, and timestamp.
-   [ ] Confirm data survives a browser restart.

## Phase 10: Statistics

### 40. Implement Statistics Calculations

-   [ ] Calculate attempted, correct, and incorrect totals.
-   [ ] Calculate overall accuracy.
-   [ ] Handle zero attempts safely.
-   [ ] Add unit tests.

### 41. Track Statistics by Operation

-   [ ] Track addition.
-   [ ] Track subtraction.
-   [ ] Track multiplication.
-   [ ] Track division.
-   [ ] Calculate accuracy for each.

### 42. Track Statistics by Difficulty

-   [ ] Track Level 1 through Level 4.
-   [ ] Calculate attempted, correct, incorrect, and accuracy for each
    level.

### 43. Create the Statistics Overview

-   [ ] Display total attempted, correct, incorrect, and accuracy.
-   [ ] Add an empty state for new users.

### 44. Display Statistics by Operation

-   [ ] Create a card for each operation.
-   [ ] Show attempted, correct, incorrect, and accuracy.
-   [ ] Make the layout responsive.

### 45. Display Statistics by Difficulty

-   [ ] Create a card for each level.
-   [ ] Show attempted, correct, incorrect, and accuracy.

### 46. Display Recent Sessions

-   [ ] Show date, operations, difficulty, and totals.
-   [ ] Show session accuracy.
-   [ ] Sort newest to oldest.
-   [ ] Add an empty state.

### 47. Add Statistics Reset

-   [ ] Add **Reset Statistics**.
-   [ ] Create a confirmation dialog.
-   [ ] Require explicit confirmation.
-   [ ] Clear attempts, sessions, and aggregate statistics.
-   [ ] Decide whether settings remain unchanged.
-   [ ] Refresh the displayed statistics.

## Phase 11: Settings

### 48. Create the Settings Page

-   [ ] Add sound effects on/off.
-   [ ] Add card animation on/off.
-   [ ] Add explanation visibility.
-   [ ] Add default session length.
-   [ ] Add default difficulty.
-   [ ] Add default operations.
-   [ ] Add mastery threshold.
-   [ ] Persist changes.

### 49. Apply Default Practice Settings

-   [ ] Load default operations in setup.
-   [ ] Load default difficulty and session length.
-   [ ] Allow per-session overrides.

### 50. Add Clear-All-Data

-   [ ] Add **Clear All Application Data**.
-   [ ] Show a clear confirmation warning.
-   [ ] Clear settings, sessions, attempts, and mistake patterns.
-   [ ] Restore defaults.
-   [ ] Return to home.

## Phase 12: Mistake Tracking

### 51. Create Mistake Patterns

-   [ ] Create a pattern after an incorrect answer.
-   [ ] Store operation, operands, answer, and difficulty.
-   [ ] Store last incorrect timestamp.
-   [ ] Initialize incorrect and similar-correct counts.

### 52. Update Existing Patterns

-   [ ] Detect an existing matching pattern.
-   [ ] Increment incorrect count.
-   [ ] Update last-incorrect timestamp.
-   [ ] Adjust mastery progress as appropriate.
-   [ ] Avoid duplicate records.

### 53. Persist Mistake Patterns

-   [ ] Save patterns locally.
-   [ ] Load patterns at startup.
-   [ ] Validate stored patterns.
-   [ ] Recover from invalid records.

## Phase 13: Similar Question Generation

### 54. Generate Nearby-Number Questions

-   [ ] Use nearby operands.
-   [ ] Keep questions within difficulty limits.
-   [ ] Avoid invalid subtraction and division.
-   [ ] Avoid excessive exact repeats.

### 55. Generate Reversed-Operand Questions

-   [ ] Reverse addition operands.
-   [ ] Reverse multiplication operands.
-   [ ] Do not treat reversed subtraction as equivalent.
-   [ ] Do not treat reversed division as equivalent.

### 56. Generate Fact-Family Questions

-   [ ] Generate division questions from multiplication mistakes.
-   [ ] Generate multiplication questions from division mistakes.
-   [ ] Generate addition questions from subtraction mistakes.
-   [ ] Generate subtraction questions from addition mistakes.
-   [ ] Keep generated questions within the selected difficulty.

### 57. Create the Similar Question Generator

-   [ ] Accept a mistake pattern.
-   [ ] Choose a similarity strategy.
-   [ ] Generate a valid related question.
-   [ ] Set source to `mistake-review`.
-   [ ] Attach the mistake-pattern ID.
-   [ ] Test all operations.

## Phase 14: Mistake Review Mode

### 58. Add Review Mode to Setup

-   [ ] Add regular-practice and mistake-review options.
-   [ ] Disable review when no active mistakes exist.
-   [ ] Explain why review is unavailable.
-   [ ] Display active pattern count.

### 59. Prioritize Mistake Patterns

-   [ ] Prioritize frequently missed patterns.
-   [ ] Prioritize recently missed patterns.
-   [ ] Prioritize patterns with little successful review.
-   [ ] Randomize similarly ranked patterns.
-   [ ] Test prioritization.

### 60. Build Review Sessions

-   [ ] Select active patterns.
-   [ ] Generate similar questions.
-   [ ] Mix multiple patterns in a session.
-   [ ] Track the source pattern for each question.
-   [ ] Include review counts in the summary.

### 61. Track Similar-Question Success

-   [ ] Increment similar-correct count after correct review answers.
-   [ ] Handle incorrect review answers.
-   [ ] Update the original pattern.
-   [ ] Persist the update.

### 62. Implement Mastery Rules

-   [ ] Mark a pattern mastered after three correct similar questions.
-   [ ] Make the threshold configurable.
-   [ ] Exclude mastered patterns from normal review.
-   [ ] Allow a later mistake to reactivate a pattern.
-   [ ] Test mastery transitions.

## Phase 15: Advanced Statistics

### 63. Add Mistake Statistics

-   [ ] Display active patterns.
-   [ ] Display mastered patterns.
-   [ ] Display similar questions practiced.
-   [ ] Display review questions answered correctly.

### 64. Identify Frequently Missed Areas

-   [ ] Identify the most frequently missed operation.
-   [ ] Identify frequently missed number facts.
-   [ ] Sort patterns by incorrect count.
-   [ ] Handle ties.
-   [ ] Add an empty state.

### 65. Add Mistake Details

-   [ ] Display active patterns.
-   [ ] Show incorrect counts.
-   [ ] Show mastery progress.
-   [ ] Show last incorrect date.
-   [ ] Allow mastered patterns to be viewed separately.

## Phase 16: Accessibility

### 66. Improve Keyboard Navigation

-   [ ] Ensure every control is reachable with Tab.
-   [ ] Add visible focus indicators.
-   [ ] Support Enter and Space on buttons.
-   [ ] Support number keys 1--4 for answers.
-   [ ] Avoid interfering with text inputs.

### 67. Improve Screen-Reader Support

-   [ ] Use semantic HTML.
-   [ ] Label answer choices.
-   [ ] Announce question changes.
-   [ ] Announce the revealed answer.
-   [ ] Announce session progress.
-   [ ] Give icon buttons accessible names.

### 68. Support Reduced Motion

-   [ ] Detect `prefers-reduced-motion`.
-   [ ] Disable flip animation when requested.
-   [ ] Keep state changes visually clear.
-   [ ] Respect the app animation setting.

### 69. Check Visual Accessibility

-   [ ] Verify color contrast.
-   [ ] Do not communicate results by color alone.
-   [ ] Add text or icons to selected states.
-   [ ] Test at 200% browser zoom.
-   [ ] Test larger system font sizes.

## Phase 17: Responsive Design and Polish

### 70. Optimize for Tablets

-   [ ] Use large touch targets.
-   [ ] Center the practice card.
-   [ ] Keep answer choices easy to reach.
-   [ ] Test portrait and landscape orientations.

### 71. Optimize for Mobile

-   [ ] Stack answer choices when needed.
-   [ ] Adjust card width.
-   [ ] Prevent horizontal scrolling.
-   [ ] Simplify navigation.
-   [ ] Test small screen sizes.

### 72. Optimize Statistics Layout

-   [ ] Convert wide tables to cards on small screens.
-   [ ] Prevent overlapping labels and values.
-   [ ] Keep recent sessions readable.
-   [ ] Use horizontal scrolling only when necessary.

### 73. Add Child-Friendly Feedback

-   [ ] Add positive feedback messages.
-   [ ] Add supportive messages after mistakes.
-   [ ] Avoid shaming language.
-   [ ] Randomize feedback without distraction.
-   [ ] Allow feedback effects to be disabled.

## Phase 18: Session Recovery and Navigation Safety

### 74. Persist an Active Session

-   [ ] Save the active session.
-   [ ] Save the current question.
-   [ ] Save selected answer when appropriate.
-   [ ] Restore the session after refresh.
-   [ ] Clear restored state when the session ends.

### 75. Protect Against Accidental Navigation

-   [ ] Detect attempts to leave an active session.
-   [ ] Show a confirmation prompt.
-   [ ] Allow continuing or ending the session.
-   [ ] Avoid warnings after completion.

## Phase 19: Error Handling

### 76. Handle Invalid Stored Data

-   [ ] Detect invalid settings, attempts, sessions, and patterns.
-   [ ] Reset only the affected data category.
-   [ ] Avoid application crashes.

### 77. Handle Question-Generation Failures

-   [ ] Validate every generated question.
-   [ ] Retry invalid generation.
-   [ ] Set a maximum retry count.
-   [ ] Provide a fallback question.
-   [ ] Log useful development errors.

### 78. Add User-Friendly Error Messages

-   [ ] Create a general error component.
-   [ ] Explain storage errors simply.
-   [ ] Explain missing-session errors.
-   [ ] Provide a safe return-home action.
-   [ ] Avoid showing technical stack traces.

## Phase 20: Testing

### 79. Complete Unit Tests

-   [ ] Test all arithmetic generators.
-   [ ] Test difficulty boundaries.
-   [ ] Test distractors and choice uniqueness.
-   [ ] Test similar-question generation.
-   [ ] Test statistics calculations.
-   [ ] Test mastery rules.
-   [ ] Test storage serialization and validation.

### 80. Complete Component Tests

-   [ ] Test operation and difficulty selection.
-   [ ] Test answer selection and card flipping.
-   [ ] Test right/wrong buttons.
-   [ ] Test progress and session completion.
-   [ ] Test statistics display.
-   [ ] Test confirmation dialogs.

### 81. Complete Integration Tests

-   [ ] Test a full addition session.
-   [ ] Test a mixed-operation session.
-   [ ] Test continuous practice.
-   [ ] Test an incorrect answer creating a pattern.
-   [ ] Test mistake-review generation.
-   [ ] Test mastery completion.
-   [ ] Test persistence after refresh.
-   [ ] Test resetting statistics.

### 82. Complete Accessibility Testing

-   [ ] Complete a session using only the keyboard.
-   [ ] Test with a screen reader.
-   [ ] Test reduced-motion mode.
-   [ ] Test browser zoom.
-   [ ] Run an automated accessibility checker.
-   [ ] Manually review findings.

## Phase 21: Performance and Data Management

### 83. Optimize React Rendering

-   [ ] Identify unnecessary re-renders.
-   [ ] Memoize expensive statistics calculations.
-   [ ] Keep question generation out of render logic.
-   [ ] Avoid unnecessary global state updates.

### 84. Manage Large Practice Histories

-   [ ] Test with several thousand attempts.
-   [ ] Measure local-storage usage.
-   [ ] Limit detailed recent sessions.
-   [ ] Summarize older attempts when needed.
-   [ ] Preserve aggregate statistics.

### 85. Improve Loading Performance

-   [ ] Measure initial bundle size.
-   [ ] Lazy-load statistics and settings pages.
-   [ ] Remove unused dependencies.
-   [ ] Optimize fonts and images.
-   [ ] Test on slower devices.

## Phase 22: Release Preparation

### 86. Complete Privacy Review

-   [ ] Confirm no personal information is collected.
-   [ ] Confirm practice data stays in the browser.
-   [ ] Remove unnecessary tracking.
-   [ ] Avoid child-facing advertisements.
-   [ ] Explain that clearing browser data removes progress.

### 87. Complete Browser Testing

-   [ ] Test Chrome.
-   [ ] Test Safari.
-   [ ] Test Firefox.
-   [ ] Test Microsoft Edge.
-   [ ] Test a tablet or emulator.
-   [ ] Test a mobile device or emulator.

### 88. Prepare the Production Build

-   [ ] Run all tests.
-   [ ] Resolve lint errors.
-   [ ] Resolve TypeScript errors.
-   [ ] Create the production build.
-   [ ] Test the production build locally.
-   [ ] Configure deployment routing for React Router.

### 89. Deploy the Application

-   [ ] Select a hosting service.
-   [ ] Deploy the production build.
-   [ ] Verify every route.
-   [ ] Verify local-storage persistence.
-   [ ] Verify responsive behavior.
-   [ ] Check the browser console for errors.

## Recommended Development Milestones

### Milestone 1: Basic Prototype

Complete Tasks 1--25.

Deliverable: - Generated math questions - Four multiple-choice answers -
Answer selection and card flipping - Correct answer revealed on the back

### Milestone 2: Functional Practice App

Complete Tasks 26--34.

Deliverable: - Configurable and playable sessions - Correct/incorrect
tracking during a session - Session summary

### Milestone 3: Persistent Statistics

Complete Tasks 35--50.

Deliverable: - Progress persists across browser restarts - Overall,
operation, difficulty, and recent-session statistics - Settings

### Milestone 4: Personalized Mistake Practice

Complete Tasks 51--65.

Deliverable: - Mistake patterns are saved - Similar questions are
generated - Recurring mistakes are prioritized - Mastery is tracked

### Milestone 5: Production-Ready Application

Complete Tasks 66--89.

Deliverable: - Accessible, responsive, tested, optimized, deployed
application

## Suggested First Implementation Sequence

For the fastest route to a working demonstration:

1.  [ ] Create the React and TypeScript project.
2.  [ ] Define question types.
3.  [ ] Implement addition question generation.
4.  [ ] Generate four multiple-choice answers.
5.  [ ] Create the question card front.
6.  [ ] Add answer selection.
7.  [ ] Create the card back.
8.  [ ] Add flip behavior.
9.  [ ] Add right and wrong buttons.
10. [ ] Generate the next question.
11. [ ] Add subtraction.
12. [ ] Add multiplication.
13. [ ] Add division.
14. [ ] Add session totals.
15. [ ] Add the session summary.

This sequence creates a usable prototype before adding routing,
persistence, advanced statistics, and personalized mistake review.
