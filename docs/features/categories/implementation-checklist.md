# Categories RLS Implementation Checklist

## Pre-Requisites
- [ ] Schema migration for `categories` table is merged and deployed.
- [ ] `auth.users` dependency is well-understood.

## RLS Implementation
- [ ] Enable RLS on `public.categories` (`ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;`).
- [ ] Create SELECT policy (Allow owner OR `is_system = true`).
- [ ] Create INSERT policy (Allow owner ONLY, forbid `is_system = true`).
- [ ] Create UPDATE policy (Allow owner ONLY, forbid modifying system categories, forbid changing owner).

## Strict Policy Review
- [ ] **Policy naming consistency**: Ensure all policies follow standard `categories_select_policy`, `categories_insert_policy` nomenclature.
- [ ] **Policy comments**: Add clear `COMMENT ON POLICY` documentation.
- [ ] **USING clause review**: Verify visibility conditions strictly match `auth.uid()`.
- [ ] **WITH CHECK clause review**: Verify mutation conditions explicitly prevent inserting/updating data outside the user's context.
- [ ] **Policy overlap review**: Ensure multiple policies do not unintentionally compound or conflict.
- [ ] **Policy redundancy review**: Confirm there is no duplicate logic slowing down query evaluation.

## Verification & Testing
- [ ] Verify policies syntactically.
- [ ] Write SQL integration tests verifying tenant isolation (User A cannot read User B).
- [ ] Write SQL integration tests verifying system category protection (User A cannot update System Category).
- [ ] Verify `service_role` can bypass policies for system seeding.
- [ ] **Verification scripts**: Ensure scripts assert policy existence via `pg_policies`.

## Enterprise Sign-off
- [ ] **Performance review**: (EXPLAIN ANALYZE) to ensure policies don't introduce sequence scans.
- [ ] **Security review**: Final boundary and threat analysis verification.
- [ ] **Operational review**: Check impact on backups, replicas, and replication logical decoders.
- [ ] **Migration approval**: Final sign-off from DBRE.
- [ ] **Rollback validation**: Test that downgrading removes policies flawlessly.