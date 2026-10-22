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
-   [x] Add hover and focus states.
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
-   [x] Add an animation setting.

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
-   [x] Make progress accessible to screen readers.

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

-   [x] Wrap `localStorage` access.
-   [x] Add read and write functions.
-   [x] Handle JSON parsing errors.
-   [x] Validate loaded data.
-   [x] Handle unavailable or full storage.

### 36. Add Data Schema Versioning

-   [x] Store a schema version.
-   [ ] Detect missing or older versions.
-   [x] Create an initial migration structure.
-   [x] Avoid deleting unrelated stored data.

### 37. Persist Settings

-   [x] Save settings.
-   [x] Load settings at startup.
-   [x] Use defaults when settings are missing.
-   [x] Recover from invalid stored settings.

### 38. Persist Practice Sessions

-   [x] Save session information.
-   [x] Save completion details.
-   [x] Load recent sessions.
-   [ ] Limit or summarize old records if needed.

### 39. Persist Practice Attempts

-   [x] Save each completed attempt.
-   [x] Include selected answer, result, operation, difficulty, session
    ID, and timestamp.
-   [ ] Confirm data survives a browser restart.

## Phase 10: Statistics

### 40. Implement Statistics Calculations

-   [x] Calculate attempted, correct, and incorrect totals.
-   [x] Calculate overall accuracy.
-   [x] Handle zero attempts safely.
-   [x] Add unit tests.

### 41. Track Statistics by Operation

-   [x] Track addition.
-   [x] Track subtraction.
-   [x] Track multiplication.
-   [x] Track division.
-   [x] Calculate accuracy for each.

### 42. Track Statistics by Difficulty

-   [x] Track Level 1 through Level 4.
-   [x] Calculate attempted, correct, incorrect, and accuracy for each
    level.

### 43. Create the Statistics Overview

-   [x] Display total attempted, correct, incorrect, and accuracy.
-   [x] Add an empty state for new users.

### 44. Display Statistics by Operation

-   [x] Create a card for each operation.
-   [x] Show attempted, correct, incorrect, and accuracy.
-   [x] Make the layout responsive.

### 45. Display Statistics by Difficulty

-   [x] Create a card for each level.
-   [x] Show attempted, correct, incorrect, and accuracy.

### 46. Display Recent Sessions

-   [x] Show date, operations, difficulty, and totals.
-   [x] Show session accuracy.
-   [x] Sort newest to oldest.
-   [x] Add an empty state.

### 47. Add Statistics Reset

-   [x] Add **Reset Statistics**.
-   [x] Create a confirmation dialog.
-   [x] Require explicit confirmation.
-   [x] Clear attempts, sessions, and aggregate statistics.
-   [x] Decide whether settings remain unchanged.
-   [x] Refresh the displayed statistics.

## Phase 11: Settings

### 48. Create the Settings Page

-   [x] Add sound effects on/off.
-   [x] Add card animation on/off.
-   [x] Add explanation visibility.
-   [x] Add default session length.
-   [x] Add default difficulty.
-   [x] Add default operations.
-   [x] Add mastery threshold.
-   [x] Persist changes.

### 49. Apply Default Practice Settings

-   [x] Load default operations in setup.
-   [x] Load default difficulty and session length.
-   [x] Allow per-session overrides.

### 50. Add Clear-All-Data

-   [x] Add **Clear All Application Data**.
-   [x] Show a clear confirmation warning.
-   [x] Clear settings, sessions, attempts, and mistake patterns.
-   [x] Restore defaults.
-   [x] Return to home.

## Phase 12: Mistake Tracking

### 51. Create Mistake Patterns

-   [x] Create a pattern after an incorrect answer.
-   [x] Store operation, operands, answer, and difficulty.
-   [x] Store last incorrect timestamp.
-   [x] Initialize incorrect and similar-correct counts.

### 52. Update Existing Patterns

-   [x] Detect an existing matching pattern.
-   [x] Increment incorrect count.
-   [x] Update last-incorrect timestamp.
-   [x] Adjust mastery progress as appropriate.
-   [x] Avoid duplicate records.

### 53. Persist Mistake Patterns

-   [x] Save patterns locally.
-   [x] Load patterns at startup.
-   [x] Validate stored patterns.
-   [x] Recover from invalid records.

## Phase 13: Similar Question Generation

### 54. Generate Nearby-Number Questions

-   [x] Use nearby operands.
-   [x] Keep questions within difficulty limits.
-   [x] Avoid invalid subtraction and division.
-   [x] Avoid excessive exact repeats.

### 55. Generate Reversed-Operand Questions

-   [x] Reverse addition operands.
-   [x] Reverse multiplication operands.
-   [x] Do not treat reversed subtraction as equivalent.
-   [x] Do not treat reversed division as equivalent.

### 56. Generate Fact-Family Questions

-   [x] Generate division questions from multiplication mistakes.
-   [x] Generate multiplication questions from division mistakes.
-   [x] Generate addition questions from subtraction mistakes.
-   [x] Generate subtraction questions from addition mistakes.
-   [x] Keep generated questions within the selected difficulty.

### 57. Create the Similar Question Generator

-   [x] Accept a mistake pattern.
-   [x] Choose a similarity strategy.
-   [x] Generate a valid related question.
-   [x] Set source to `mistake-review`.
-   [x] Attach the mistake-pattern ID.
-   [x] Test all operations.

## Phase 14: Mistake Review Mode

### 58. Add Review Mode to Setup

-   [x] Add regular-practice and mistake-review options.
-   [x] Disable review when no active mistakes exist.
-   [x] Explain why review is unavailable.
-   [x] Display active pattern count.

### 59. Prioritize Mistake Patterns

-   [x] Prioritize frequently missed patterns.
-   [x] Prioritize recently missed patterns.
-   [x] Prioritize patterns with little successful review.
-   [x] Randomize similarly ranked patterns.
-   [x] Test prioritization.

### 60. Build Review Sessions

-   [x] Select active patterns.
-   [x] Generate similar questions.
-   [x] Mix multiple patterns in a session.
-   [x] Track the source pattern for each question.
-   [x] Include review counts in the summary.

### 61. Track Similar-Question Success

-   [x] Increment similar-correct count after correct review answers.
-   [x] Handle incorrect review answers.
-   [x] Update the original pattern.
-   [x] Persist the update.

### 62. Implement Mastery Rules

-   [x] Mark a pattern mastered after three correct similar questions.
-   [x] Make the threshold configurable.
-   [x] Exclude mastered patterns from normal review.
-   [x] Allow a later mistake to reactivate a pattern.
-   [x] Test mastery transitions.

## Phase 15: Advanced Statistics

### 63. Add Mistake Statistics

-   [x] Display active patterns.
-   [x] Display mastered patterns.
-   [x] Display similar questions practiced.
-   [x] Display review questions answered correctly.

### 64. Identify Frequently Missed Areas

-   [x] Identify the most frequently missed operation.
-   [x] Identify frequently missed number facts.
-   [x] Sort patterns by incorrect count.
-   [x] Handle ties.
-   [x] Add an empty state.

### 65. Add Mistake Details

-   [x] Display active patterns.
-   [x] Show incorrect counts.
-   [x] Show mastery progress.
-   [x] Show last incorrect date.
-   [x] Allow mastered patterns to be viewed separately.

## Phase 16: Accessibility

### 66. Improve Keyboard Navigation

-   [ ] Ensure every control is reachable with Tab.
-   [x] Add visible focus indicators.
-   [x] Support Enter and Space on buttons.
-   [x] Support number keys 1--4 for answers.
-   [x] Avoid interfering with text inputs.

### 67. Improve Screen-Reader Support

-   [x] Use semantic HTML.
-   [x] Label answer choices.
-   [x] Announce question changes.
-   [x] Announce the revealed answer.
-   [x] Announce session progress.
-   [x] Give icon buttons accessible names.

### 68. Support Reduced Motion

-   [x] Detect `prefers-reduced-motion`.
-   [x] Disable flip animation when requested.
-   [ ] Keep state changes visually clear.
-   [x] Respect the app animation setting.

### 69. Check Visual Accessibility

-   [x] Verify color contrast.
-   [x] Do not communicate results by color alone.
-   [x] Add text or icons to selected states.
-   [ ] Test at 200% browser zoom.
-   [ ] Test larger system font sizes.

## Phase 17: Responsive Design and Polish

### 70. Optimize for Tablets

-   [x] Use large touch targets.
-   [x] Center the practice card.
-   [x] Keep answer choices easy to reach.
-   [x] Test portrait and landscape orientations.

### 71. Optimize for Mobile

-   [x] Stack answer choices when needed.
-   [x] Adjust card width.
-   [x] Prevent horizontal scrolling.
-   [x] Simplify navigation.
-   [x] Test small screen sizes.

### 72. Optimize Statistics Layout

-   [x] Convert wide tables to cards on small screens.
-   [x] Prevent overlapping labels and values.
-   [x] Keep recent sessions readable.
-   [x] Use horizontal scrolling only when necessary.

### 73. Add Child-Friendly Feedback

-   [x] Add positive feedback messages.
-   [x] Add supportive messages after mistakes.
-   [x] Avoid shaming language.
-   [x] Randomize feedback without distraction.
-   [x] Allow feedback effects to be disabled.

## Phase 18: Session Recovery and Navigation Safety

### 74. Persist an Active Session

-   [x] Save the active session.
-   [x] Save the current question.
-   [x] Save selected answer when appropriate.
-   [x] Restore the session after refresh.
-   [x] Clear restored state when the session ends.

### 75. Protect Against Accidental Navigation

-   [x] Detect attempts to leave an active session.
-   [x] Show a confirmation prompt.
-   [x] Allow continuing or ending the session.
-   [x] Avoid warnings after completion.

## Phase 19: Error Handling

### 76. Handle Invalid Stored Data

-   [x] Detect invalid settings, attempts, sessions, and patterns.
-   [x] Reset only the affected data category.
-   [x] Avoid application crashes.

### 77. Handle Question-Generation Failures

-   [x] Validate every generated question.
-   [x] Retry invalid generation.
-   [x] Set a maximum retry count.
-   [x] Provide a fallback question.
-   [x] Log useful development errors.

### 78. Add User-Friendly Error Messages

-   [x] Create a general error component.
-   [x] Explain storage errors simply.
-   [x] Explain missing-session errors.
-   [x] Provide a safe return-home action.
-   [x] Avoid showing technical stack traces.

## Phase 20: Testing

### 79. Complete Unit Tests

-   [x] Test all arithmetic generators.
-   [x] Test difficulty boundaries.
-   [x] Test distractors and choice uniqueness.
-   [x] Test similar-question generation.
-   [x] Test statistics calculations.
-   [x] Test mastery rules.
-   [x] Test storage serialization and validation.

### 80. Complete Component Tests

-   [x] Test operation and difficulty selection.
-   [x] Test answer selection and card flipping.
-   [x] Test right/wrong buttons.
-   [x] Test progress and session completion.
-   [x] Test statistics display.
-   [x] Test confirmation dialogs.

### 81. Complete Integration Tests

-   [x] Test a full addition session.
-   [x] Test a mixed-operation session.
-   [x] Test continuous practice.
-   [x] Test an incorrect answer creating a pattern.
-   [x] Test mistake-review generation.
-   [x] Test mastery completion.
-   [x] Test persistence after refresh.
-   [x] Test resetting statistics.

### 82. Complete Accessibility Testing

-   [ ] Complete a session using only the keyboard.
-   [ ] Test with a screen reader.
-   [ ] Test reduced-motion mode.
-   [ ] Test browser zoom.
-   [x] Run an automated accessibility checker.
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
