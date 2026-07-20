# Architectural Decision Records (ADRs)

## What is an ADR?
An Architectural Decision Record (ADR) is a short document that captures a single, significant architectural decision made for the project. It describes the context, the decision itself, and the consequences of that decision.

## When to create one?
You should create an ADR when you are making a decision that:
- Significantly impacts the architecture (e.g., choosing a framework, defining a database standard).
- Has long-term consequences that future maintainers will need to understand.
- Requires consensus among the engineering team or stakeholders.
- Replaces or significantly alters a previous architectural decision.

Minor implementation details or transient code changes do not require an ADR.

## How ADRs are numbered
ADRs are numbered sequentially using a three-digit format starting from `001` (e.g., `ADR-001-database-naming.md`).
- We do not use `000` for engineering principles, as those are stored in the canonical `docs/principles/` directory.

## When to supersede an ADR instead of editing it
ADRs are immutable records of historical decisions. Once an ADR is accepted:
- **DO NOT** edit its core decision or consequences just because the system evolves.
- **DO** create a new ADR if a past decision needs to be reversed or fundamentally changed. The new ADR should reference the old one and mark the old one as "Superseded".

## Standard ADR Template
When creating a new ADR, use the following markdown template:

```markdown
# ADR-[Number]: [Short Title]

## Status

[Proposed | Accepted | Superseded by ADR-XXX | Rejected]

## Context

[Describe the context and problem statement in a few sentences. What forces are at play? What constraints do we have?]

## Decision

[Describe the specific decision made to resolve the problem. Keep it clear and declarative.]

## Consequences

[What becomes easier or more difficult because of this decision? Note both positive and negative consequences.]
```
