# Categories RLS Policies Conceptual Design

## Overview
RLS must be strictly enabled on `public.categories`. By default, all operations are denied. Explicit policies grant access based on the following rules.

## SELECT Policy (Read Access)
**Who**: Authenticated users.
**Required Conditions**: 
The row's `user_id` matches `auth.uid()` OR the row is a system category (`user_id IS NULL AND is_system = true`).
**Expected Behavior**: Users can query all their custom categories and the global system categories in a single request.
**Failure Cases**: Unauthenticated users return 0 rows. Attempting to query another user's ID returns 0 rows.
**Edge Cases**: A system category cannot accidentally be assigned a `user_id` without failing this condition.
**Future Compatibility**: Safe for reporting/analytics endpoints running under the user's token.

## INSERT Policy (Create Access)
**Who**: Authenticated users.
**Required Conditions**: 
The new row's `user_id` MUST exactly match `auth.uid()`. 
The new row's `is_system` MUST be `false`.
**Expected Behavior**: Users can create personal custom categories.
**Failure Cases**: Attempting to insert a row for another user throws a policy violation. Attempting to create a system category (`is_system = true`) throws a violation.
**Edge Cases**: Prevents malicious actors from spoofing global categories.
**Future Compatibility**: Perfectly compatible with CSV Imports via API, ensuring imported rows are bound to the importing tenant.

## UPDATE Policy (Modify Access)
**Who**: Authenticated users.
**Required Conditions**:
The row being updated must currently belong to `auth.uid()`.
The `user_id` cannot be changed during the update.
The `is_system` flag cannot be changed to `true`.
**Expected Behavior**: Users can rename, change icons, colors, reorder, or archive their own custom categories.
**Failure Cases**: Attempting to update a system category throws a violation (as `user_id` is null). Attempting to alter ownership throws a violation.
**Edge Cases**: Ensures users cannot "steal" categories or corrupt system defaults.

## DELETE Strategy (Hard Delete Access)
**NO DELETE POLICY.**

Categories are **archived only**. The application strictly avoids hard deletion of category records via RLS.

**Why Financial Applications Avoid Hard Deletion**:
- **Auditability**: Erasing categories destroys the historical audit trail of how user financial data was structured.
- **Historical Transaction Integrity**: Existing transactions rely on category IDs. Hard deleting a category would either require cascading deletes (destroying financial ledger data) or setting the foreign key to NULL (losing the transaction's context).
- **Referential Integrity**: Archiving preserves all Foreign Keys safely.
- **Future Analytics**: Machine learning models and trend analytics require historical classification data to remain intact, even if the user no longer actively uses the category.
- **Compliance Considerations**: Immutable financial records often mandate that classifications applied to historical ledgers remain present and resolvable forever.

## Archive Strategy (Soft-Archive Access)
*Note: Archiving is not a distinct SQL command; it is an `UPDATE` where `is_archived = true`.*

- **Who may archive a category**: The authenticated owner (`auth.uid()`).
- **Who may unarchive a category**: The authenticated owner (`auth.uid()`).
- **Editable**: Archived categories remain fully editable by the owner (e.g., they can rename an archived category).
- **Visible**: Archived categories remain visible to the database layer (SELECT policies allow reading them) but should be filtered out of primary active lists.
- **New Transactions**: The Service Layer should prevent assigning new transactions to archived categories, although historical transactions remain linked.
- **Recommended UI Behavior**: 
  - Standard transaction entry forms should omit archived categories.
  - A dedicated "Archived Categories" or "Manage Categories" screen should allow viewing, editing, and restoring them.
  - Historical reports should group archived categories gracefully.
- **Future Compatibility**: Fits cleanly into GDPR/Data Export requirements since the data remains owned and exportable by the user, just hidden from daily workflows.
