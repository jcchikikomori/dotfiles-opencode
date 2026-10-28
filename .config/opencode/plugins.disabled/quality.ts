import { execFile } from "node:child_process"
import { promisify } from "node:util"

/**
 * quality — runs Prettier and the project's test command after an `edit`
 * tool call and reports the outcome.
 *
 * v2 port notes:
 *   - v1 `tool.execute.after` -> `ctx.tool.hook("execute.after", ...)`.
 *     The v2 hook receives a SINGLE event object; the v1 `output` argument is
 *     gone. The tool's arguments are now `event.input` (flattened), so the old
 *     `output.args.filePath` / `input.args.filePath` lookup becomes
 *     `event.input.filePath`.
 *   - v1 `client.app.log({ body: ... })` has no equivalent in the v2 plugin
 *     context (there is no client), so logging goes to the console.
 *   - v1 `$` was a Bun shell; the v2 context exposes `ctx.shell`, but the
 *     published `@opencode-ai/plugin@1.19.5` types do not describe it yet, so
 *     this uses `child_process.execFile` directly — same behaviour, no
 *     dependency on an undocumented shape.
 */

const execFileAsync = promisify(execFile)

interface Registration {
  dispose(): Promise<void> | void
}

interface ToolAfterEvent {
  tool: string
  sessionID: string
  input?: Record<string, unknown>
  status?: "completed" | "error"
}

interface QualityContext {
  tool: {
    hook(
      name: "execute.after",
      cb: (event: ToolAfterEvent) => Promise<void> | void,
    ): Promise<Registration>
  }
  location?: { directory?: string; project?: { directory?: string } }
}

type LogLevel = "info" | "warn"

/** v1 used `client.app.log`; v2 has no logging client, so use the console. */
const log = (level: LogLevel, message: string): void => {
  const line = `[quality-plugin] ${message}`
  if (level === "warn") console.warn(line)
  else console.info(line)
}

/** Resolve the edited file from the v2 tool input. */
function filePathOf(event: ToolAfterEvent): string | undefined {
  const input = (event.input ?? {}) as Record<string, unknown>
  const nested = (input.args ?? {}) as Record<string, unknown>
  const candidate = input.filePath ?? nested.filePath
  return typeof candidate === "string" && candidate.length > 0 ? candidate : undefined
}

export default {
  id: "quality",
  setup: async (ctx: QualityContext) => {
    const cwd = ctx.location?.directory || ctx.location?.project?.directory || process.cwd()

    const reg = await ctx.tool.hook("execute.after", async (event) => {
      if (event.tool !== "edit") return

      const filePath = filePathOf(event)
      if (!filePath) return

      try {
        await execFileAsync("prettier", ["--write", filePath], { cwd })
        log("info", `Formatted ${filePath}`)
      } catch {
        log("warn", `Prettier failed for ${filePath}`)
      }

      try {
        await execFileAsync("npm", ["test", "--", filePath], { cwd })
      } catch {
        log("warn", `Tests failed for ${filePath}`)
      }
    })

    return async () => {
      await reg.dispose()
    }
  },
}
