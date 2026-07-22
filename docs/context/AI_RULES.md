# AI Rules

## Core Rules
- **Documentation is the source of truth**: Always defer to existing documentation over assumed knowledge.
- **Architecture Change Policy**: No architectural changes without formal discussion and ADR updates.
- **Documentation Freeze**: Do not modify frozen documentation unless explicitly instructed.
- **Design Freeze**: Do not alter frozen UI/UX designs.

## Workflows
- **Implementation workflow**:
  1. Read context documents.
  2. Implement features following Clean Architecture.
  3. Write tests.
  4. Update context documents.
- **Review workflow**: Ensure linting, TypeScript compilation, and tests pass before marking a task complete.
- **Branch strategy**: Feature branches off `main` or `develop`.

## Responsibilities
- **ChatGPT**: General code assistance, boilerplate generation.
- **Claude**: Deep architectural analysis, complex refactoring, documentation synthesis.
- **Codex**: Rapid inline code completion.
- **Kimi**: Context processing, document summarization.
- **Gemini**: Agentic coding, end-to-end task execution, project management.

## Context Maintenance
- **Documentation update rules**: Never duplicate large sections; use cross-references.
- **Context maintenance rules**: AI agents must update `CURRENT_STATE.md`, `CURRENT_PHASE.md`, `ACTIVE_DECISIONS.md`, and `NEXT_STEPS.md` if the project state changes during a session.
- **End-of-session checklist**:
  - [ ] Update NEXT_STEPS.md with immediate next goals.
  - [ ] Ensure CURRENT_STATE.md reflects any new features or technical debt.
  - [ ] Verify ACTIVE_DECISIONS.md is up to date.

---
**Last Updated**: 2026-07-21
**Owner**: Development Team
**Related Documents**: [AI_BOOTSTRAP.md](file:///d:/Projects/finance_tracker_mobile/docs/AI_BOOTSTRAP.md)
