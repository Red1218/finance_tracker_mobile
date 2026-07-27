# Active Decisions

## Decision 1 — Persistence Architecture Standard
- **Title**: Enterprise Persistence Architecture Approval
- **Status**: Approved & Frozen
- **Owner**: Development Team / Architecture Review
- **Reason**: Establish unified single transaction ledger canonical financial record, soft-archiving lifecycle (`archived_at`), 11-step migration sequence, and clean architecture boundaries.
- **Impact**: Supersedes Expenses bounded context persistence with Transactions bounded context; defines mandatory persistence principles.
- **Related Architecture Doc**: [PERSISTENCE_ARCHITECTURE.md](../PERSISTENCE_ARCHITECTURE.md)
- **Next Action**: Execute feature implementation of migration scripts `001_enable_extensions.sql` through `011_validation.sql`.

---
**Last Updated**: 2026-07-27
**Owner**: Development Team
**Related Documents**: [AI_INDEX.md](file:///d:/Projects/finance_tracker_mobile/docs/AI_INDEX.md), [PERSISTENCE_ARCHITECTURE.md](file:///d:/Projects/finance_tracker_mobile/docs/PERSISTENCE_ARCHITECTURE.md)
