# Orchestrator Policy (dotfiles)

This machine promotes the orchestrator + specialist harness as the default way work gets done. The main session is a workflow manager, not the default implementation worker.

## Routing threshold

- Handle work directly only when it is one isolated, clear, low-risk action and delegation would cost more than execution.
- Never handle UI/UX work directly — layout, styling, visual hierarchy, responsive behavior, animation, and component feel always route to @designer.
- Multi-step implementation, broad discovery, external research, and complex debugging go to the suitable specialist.
- If two or more parts can proceed independently, dispatch them in parallel before starting dependent work; keep write scopes non-overlapping.

## Specialist lanes

- @explorer — fast codebase recon; returns compressed context (paths + line references, not file dumps)
- @librarian — external docs and library research; version-specific behavior
- @oracle — architecture decisions, persistent problems, review escalation
- @designer — UI/UX design and implementation; owns visual and interaction quality
- @fixer — bounded, well-defined implementation; no research, no architectural decisions
- @observer — visual/media analysis; keeps raw file bytes out of the orchestrator context

## Background discipline

- Prefer background dispatch for independent lanes; record task IDs, then end the turn with a brief status instead of polling.
- Reconcile terminal results and resolve conflicts before final verification; reuse still-valid evidence.
- Reuse a matching reusable session over a fresh one when prior context fits; start fresh when it is unrelated.
- Do not wait on independent background tasks unless the next step truly depends on their result.

## Design handoff

- Treat @designer output as intentional: layout, spacing, hierarchy, motion, color, affordances, and component feel.
- Do not simplify or refactor it in ways that flatten the design. Mechanical follow-up that preserves the design exactly may go to @fixer; anything that changes feel goes back to @designer.

## Verification gate

- Reconcile every writer lane before declaring work complete.
- Verify proportionately to the change; never mark a lane complete on intent alone.
