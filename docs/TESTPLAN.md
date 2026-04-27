# COBOL Student Account Test Plan

## Scope
This plan validates the current business logic and implementation behavior of the COBOL account system before migration to Node.js.

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Verify application starts and menu is displayed | Application is compiled and executable is available | 1. Run ./accountsystem | Menu is displayed with options 1-4 and input prompt appears | TBD | Not Run | Baseline startup behavior |
| TC-002 | Verify initial balance is 1000.00 on first read | Fresh app session started | 1. Select option 1 (View Balance)<br>2. Exit with option 4 | Current balance is shown as 1000.00 | TBD | Not Run | Confirms default state in working storage |
| TC-003 | Verify View Balance does not modify balance | Fresh app session started | 1. Select option 1<br>2. Select option 1 again<br>3. Exit | Both displayed balances are identical (no change from read-only operation) | TBD | Not Run | Validates TOTAL path is read-only |
| TC-004 | Verify credit operation increases balance | Fresh app session started | 1. Select option 2 (Credit)<br>2. Enter 200.00<br>3. Select option 1 | New balance after credit is 1200.00 and view confirms same value | TBD | Not Run | Core credit rule |
| TC-005 | Verify multiple credits are cumulative | Fresh app session started | 1. Credit 100.00<br>2. Credit 50.00<br>3. View balance | Balance equals 1150.00 | TBD | Not Run | Confirms repeated WRITE updates |
| TC-006 | Verify debit operation decreases balance when funds are sufficient | Fresh app session started | 1. Select option 3 (Debit)<br>2. Enter 250.00<br>3. Select option 1 | Debit succeeds and balance is 750.00 | TBD | Not Run | Core debit success path |
| TC-007 | Verify debit equal to full balance is allowed | Fresh app session started | 1. Select option 3<br>2. Enter 1000.00<br>3. Select option 1 | Debit succeeds and balance becomes 0.00 | TBD | Not Run | Boundary check for >= condition |
| TC-008 | Verify debit is blocked when funds are insufficient | Fresh app session started | 1. Select option 3<br>2. Enter 1000.01<br>3. Select option 1 | Message Insufficient funds for this debit. is shown and balance remains 1000.00 | TBD | Not Run | Core overdraft prevention rule |
| TC-009 | Verify insufficient-funds attempt does not alter future valid transactions | Fresh app session started | 1. Debit 1500.00 (expect reject)<br>2. Credit 200.00<br>3. View balance | Final balance is 1200.00 (rejected debit did not change state) | TBD | Not Run | Ensures no WRITE on failed debit |
| TC-010 | Verify menu rejects unsupported choice | Fresh app session started | 1. Enter 9 at menu<br>2. Enter 4 to exit | Invalid choice message is displayed, app continues running until exit chosen | TBD | Not Run | Input guard in main menu |
| TC-011 | Verify loop continues until explicit exit | Fresh app session started | 1. Enter 1<br>2. Enter 2 with amount 10.00<br>3. Enter 3 with amount 5.00<br>4. Enter 4 | App processes operations sequentially and exits only after option 4 | TBD | Not Run | Validates CONTINUE-FLAG control flow |
| TC-012 | Verify exit path prints goodbye message | Fresh app session started | 1. Select option 4 | Program prints goodbye message and terminates | TBD | Not Run | Confirms termination behavior |
| TC-013 | Verify in-session persistence of balance | Fresh app session started | 1. Credit 300.00<br>2. View balance<br>3. Debit 50.00<br>4. View balance | First view is 1300.00, second view is 1250.00 in same session | TBD | Not Run | Confirms shared in-memory state via DataProgram |
| TC-014 | Verify balance resets between application runs | Complete one run with modified balance | 1. Run app and credit 100.00, then exit<br>2. Start app again<br>3. View balance | New run starts from 1000.00 (no persisted storage) | TBD | Not Run | Documents current non-persistent implementation |
| TC-015 | Verify zero-value credit behavior | Fresh app session started | 1. Select option 2<br>2. Enter 0.00<br>3. View balance | Credit operation completes and balance remains unchanged at 1000.00 | TBD | Not Run | Captures current implementation (no positive-amount validation) |
| TC-016 | Verify zero-value debit behavior | Fresh app session started | 1. Select option 3<br>2. Enter 0.00<br>3. View balance | Debit operation completes and balance remains unchanged at 1000.00 | TBD | Not Run | Captures current implementation (no positive-amount validation) |

## Notes For Node.js Migration
- Keep these cases as source-of-truth acceptance criteria.
- Convert each test case into automated tests later:
  - Unit tests for operation rules (credit, debit guard, total read).
  - Integration tests for menu flow and end-to-end state transitions.
  - Regression tests for session reset behavior.
