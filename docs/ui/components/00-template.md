# [Component Name] Specification

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0
> **Maturity Level**: [L1 Experimental | L2 Stable | L3 Production]

## 1. Component Contract Summary
- **Purpose**: [1-2 sentences on what this does]
- **Inputs**: [Primary data required]
- **Outputs**: [Primary events emitted]
- **Dependencies**: [Core primitives used]

## 2. Metadata
- **Component ID**: `[e.g., core.button]`
- **Owner**: `[Team or Individual]`
- **Reviewer**: `[Team or Individual]`
- **Last Audit Date**: `[YYYY-MM-DD]`
- **Category**: `[Foundation | Primitive | Composite | Pattern | Template]`

## 3. Related Documents
- [Design System](../../01-design-system.md)
- [Component System](../../02-component-system.md)
- [Navigation Architecture](../../03-navigation.md)
- [Motion Architecture](../../04-motion.md)
- [Accessibility Architecture](../../05-accessibility.md)

## 4. Responsibility
[Define the strict boundaries of what this component *does* and what it *does not* do.]

## 5. Component Hierarchy
[Define where this component sits within the taxonomic hierarchy. Does it wrap other components? Is it a leaf node? Does it utilize slots?]

## 6. Usage Examples
### Correct
```text
[Component Name]
  ↓
[Intended Use Case]
  ↓
[Expected Context]
```

### Incorrect
```text
[Component Name]
  ↓
[Anti-Pattern Use Case]
  ↓
[Why it is wrong]
```

## 7. Dependencies & Dependents
- **Dependencies**: `[e.g., Icon, Text, Surface]`
- **Dependents**: `[e.g., PageHeader, TransactionRow]`

## 8. Design Tokens
- **Color**: `[e.g., color.surface.primary]`
- **Typography**: `[e.g., typography.label.large]`
- **Spacing**: `[e.g., spacing.component.medium]`
- **Elevation**: `[e.g., elevation.level1]`
- **Motion**: `[e.g., motion.duration.fast]`
- **Icons**: `[e.g., icon.size.small]`

## 9. Inputs (Props)
- `[Property Name]`: [Type] - [Description, Default Value, Constraints]

## 10. Outputs (Events)
- `[Event Name]`: [Description and payload structure]

## 11. States
- **Default**: [Description]
- **Hover/Focus**: [Description]
- **Active/Pressed**: [Description]
- **Disabled**: [Description]
- **Loading**: [Description]
- **Error**: [Description]

## 12. Variants
- `[Variant Name]`: [Description of how it differs from the default]

## 13. Layout Rules
- **Intrinsic Size**: [Does it hug contents or fill space?]
- **Padding/Margin**: [Internal spacing rules; external margins deferred to parent.]
- **Alignment**: [Internal alignment rules.]

## 14. Responsive Behaviour
- **Mobile**: [Behavior]
- **Tablet/Desktop**: [Behavior]

## 15. Accessibility
- **Roles**: `[e.g., button, dialog]`
- **State Attributes**: `[e.g., aria-expanded, aria-disabled]`
- **Focus Management**: [Describe the focus ring and trapping behavior, if any.]
- **Keyboard Interaction**: [List supported keystrokes, e.g., Space, Enter.]

## 16. Internationalization
- **RTL**: [Behavior in Right-to-Left languages]
- **Currency**: [Formatting requirements]
- **Dates**: [Formatting requirements]
- **Number Formatting**: [Grouping, decimals]
- **Long Text**: [Truncation, wrapping rules]
- **Pluralization**: [Rules for dynamic counts]

## 17. Security & Privacy
- **Displays Sensitive Data**: [YES/NO]
- **Requires Data Masking**: [YES/NO]
- **Logs Sensitive Values**: [YES/NO]

## 18. Motion
- **Entrance/Exit**: [e.g., Expand vertically over `duration-base`.]
- **Feedback**: [e.g., Scale to `0.98` over `duration-fast` on press.]

## 19. Performance
- **Render Cost**: [Low / Medium / High]
- **Constraints**: [e.g., "Must avoid re-rendering on parent scroll events."]

## 20. Analytics
- **Events**: `[e.g., component_clicked, component_viewed]`
- **Required Payload Data**: `[e.g., variant, component_id]`

## 21. Error Recovery
- **Retry**: [Mechanism for retrying failed actions]
- **Fallback**: [Degraded state representation]
- **Offline**: [Behavior without network connection]

## 22. Known Limitations
[Explicitly list what the component cannot or should not attempt to do. e.g., "Maximum 4 Quick Actions."]

## 23. Anti-Patterns
> [!WARNING]
> **Never:**
> ❌ [Anti-pattern description and why it is harmful.]

## 24. Component Decision Record (CDR)
| Decision | Why | Alternatives Considered | Trade-offs | Approved By |
|----------|-----|-------------------------|------------|-------------|
| [Decision] | [Rationale] | [Alternatives] | [Trade-offs] | [Name] |

## 25. Breaking Change Impact
- **Affected Components**: `[List components that would break]`
- **Affected Screens**: `[List screens that would break]`
- **Migration Required**: `[Describe migration path]`

## 26. Testing
- **Unit**: [Core logic paths to cover]
- **Visual**: [States/variants requiring baseline snapshots]
- **Accessibility**: [Specific ARIA or contrast audits required]

## 27. Version History
| Version | Date | Author | Description of Changes |
|---------|------|--------|------------------------|
| 1.0.0 | YYYY-MM-DD | [Name] | Initial Specification |

## 28. Review Checklist
- [ ] Responsibility defined
- [ ] Dependencies mapped
- [ ] Accessibility validated
- [ ] Motion tokens applied
- [ ] Analytics payloads confirmed
- [ ] Performance constraints met
- [ ] Testing criteria established
- [ ] Anti-patterns documented
