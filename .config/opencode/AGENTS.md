# Global Agent Instructions

These rules apply across all opencode sessions on this machine.

## Output Style (Mandatory)

- Keep completion messages short and direct.
- After actions, report only a concise status and changed files.
- Do **not** create auto-summary markdown files (e.g., implementation summaries, architecture reports, checklists) unless the user explicitly requests documentation output.

## Docker-First Execution Policy (Mandatory)

For projects with `docker-compose.yml` or `compose.yml`, run **linting, tests, and framework commands in Docker by default**.

- Prefer `docker compose run --rm <service> <command>` over host-local commands.
- Only use host-local execution when Docker is unavailable or the user explicitly requests local execution.

## Docker Compose Commands

- In ruby-based projects with Docker compose in it, run commands using:

```bash
docker compose run --rm -e RUBYOPT='-W0' <container_name> <command>
```

- Otherwise, use:

```bash
docker compose run --rm <container_name> <command>
```

## Skill Auto-Loading (Mandatory)

Always invoke the relevant skill(s) before starting any task. Detect project type from files present in the working directory.

### By Technology

| Detected | Skills to Load |
| ---------- | ---------------- |
| `Gemfile` / Rails | `skill(name="ruby")` + `skill(name="ruby-on-rails")` |
| `package.json` + React | `skill(name="nodejs")` + `skill(name="reactjs")` |
| `package.json` + Vue | `skill(name="nodejs")` + `skill(name="vuejs")` |
| `package.json` + Angular | `skill(name="nodejs")` + `skill(name="angularjs")` |
| `pyproject.toml` / FastAPI | `skill(name="python")` + `skill(name="fastapi")` |
| `pom.xml` / Spring Boot | `skill(name="java")` + `skill(name="spring-boot")` |
| `build.gradle` / Grails | `skill(name="java")` + `skill(name="grails")` |
| `composer.json` | `skill(name="php")` |
| `AndroidManifest.xml` | `skill(name="android")` |
| Any SQL work | relevant SQL skill first (`postgresql`, `mysql-mariadb`, or `oracle-sql`) |
| Security audit requested | `skill(name="owasp")` first |

### By Task Type

| Task | Skill to Load |
| ------ | --------------- |
| Git operations | `skill(name="git")` |
| Docker / Kubernetes | `skill(name="docker")` or `skill(name="kubernetes")` |
| Debugging / bug investigation | `skill(name="debug")` |
| MCP configuration | `skill(name="mcp")` |
| New component or module documentation | `skill(name="component-doc")` |
| Project onboarding / structure explanation | `skill(name="project-onboarding")` |
| Rails DB migrations | `skill(name="rails-migration")` |
| Python data models / validation | `skill(name="pydantic")` |
| SQLAlchemy ORM work | `skill(name="sqlalchemy")` |

### Invoking Skills via Command

Users can invoke skills directly with `/skill-name` (e.g., `/git`, `/docker`, `/debug`).

## Git Rules (Mandatory)

- Load the `git` skill for all operations that involves using Git: `skill(name="git")`
- Never run specific git commands such as `commit` and `push` which is considered as the RED FLAG.
- For revert/undo, use `git blame` to identify changes and reduce mistakes.
- Do not change the existing values on repository's config (`git config --local`) unless you have been asked to.
- Use `git stash` or `git checkout <different-branch>` to archive the existing/untrackes changes, before writing/editing the changes.
- Fetch the current repository first before doing any changes. If there's a ongoing change from upstream or main development branch, ask if you needed to merge/rebase.
- For comparing changes, use `git diff` or `diff` commands.
- The agent generates commit messages; the user runs the commit and push (see [AI Usage Policy](#ai-usage-policy-mandatory)).

## AI Usage Policy (Mandatory)

- **Never auto-merge PRs** — the agent creates the PR, human merges.
- **Never auto-close Jira tickets** — user moves ticket to Code Review swim lane manually after PR is created.
- **User will do the commit & push** — the agent will generate the commit message, but user will run the commit and push commands in their terminal.
- Self-review and AI-review code before requesting team code review.
- **Do not commit AI markdown files to PRs** — `docs/ticket-tracking/XXXXX.md` and any other agent state/tracking files must NOT be included in PRs or committed to the branch. Keep them local only or gitignored. Never stage these files when creating commits for PRs.

## Commit Messages — Conventional Commits (Mandatory)

Use [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) when generating commit messages:

```text
<type>(<optional scope>): <description>

<optional body>

Co-authored-by: <Model name with version> <noreply@anthropic.com>
```

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Breaking changes: append `!` after type/scope, or add a `BREAKING CHANGE:` footer.
- Subject line: imperative mood, lowercase description, no trailing period, max 50 characters.
- Adjust the `Co-authored-by` email to the model's provider if not Anthropic.
- Project-level AGENTS.md files may override this format (e.g., ticket-prefixed subjects like `[RTO-XXXXX] Summary`).

## Code Review (Mandatory)

- Use [Conventional Comments](https://conventionalcomments.org/) format: `suggestion:`, `issue (blocking):`, `nitpick:`, `praise:`, etc.
- When a review comment is AI-generated, append an AI usage disclaimer to the comment.

## Memory — opencode-mem (Mandatory when installed)

Use **opencode-mem** for semantic/associative recall across all past work. Skip this section silently if the opencode-mem plugin is not available.

- opencode-mem auto-captures session context and injects relevant memories into new chats; use its search to find prior context by concept.

### When to search memory

- Starting a task in a known domain: search for prior context (models, patterns, past gotchas).
- Encountering an unfamiliar pattern: search for prior encounters or resolutions.
- Writing specs/tests: search for spec patterns used in similar models/controllers.
- Before implementing: search for relevant feedback or decisions from prior similar work.

### Future consideration

Prefer a Docker-based memory store with a named volume (e.g. mempalace Docker variant), so memories are shared across WSL instances and contained workspaces. Not set up yet — note only.

## Code Style (Mandatory)

- Keep code formatted.
- Use spaces as indentation (2 spaces for Ruby, 4 spaces for Python).
- Follow existing code style and conventions in the project.
- For new code, follow the style of the most similar existing code, and reuse existing patterns and structures when possible.
- Apply principles such as KISS & DRY, but prioritize consistency with existing code over strict adherence to these principles.

## Code Testing

- Any change must include tests.
- Any UI change particularly for web, should use web browser (either existing automated tools or DevTools MCP) for validating tests.
- Target code coverage ≥95%.
- Prioritize positive & negative test cases.

## Pull Request Standards

- **PR size ≤ 200 lines** (unless no reasonable simplification possible).
- **Limited scope:** Only changes for the ticket/story (no unrelated refactoring).
- **Short description** or dot points explaining the changes.

## Database Practices (Mandatory)

- Avoid **N+1 queries**.
- AVOID DROPPING or RESETTING the LOCAL DATABASE unless user told you so.
- Add **indexes** for columns referenced in queries.
- Use **soft delete** for deletions.

### Error Handling (Mandatory)

- Minimal info to users (generic messages).
- Detailed logs to error tracking service.
- Strip sensitive fields (passwords, tokens) from logs.
