## AI tools used while building this

- **Cursor** as the editor, with **Claude (Opus)** doing most of the typing
  through the in-editor agent. I kept the agent on a tight loop: small,
  well-scoped prompts; review every diff before accepting; reject anything
  that drifted from the brief.
- **Supabase MCP server** from inside Cursor to provision the schema,
  seed data, run security/performance advisors, and generate
  `database.types.ts` directly against the live project. No manual
  copy-paste of migrations or types.
- **`pnpm create next-app`** to scaffold (the AI did not write the
  generated files, but it did pick the flags).
- **GitHub Copilot-style autocomplete** in Cursor for boilerplate inside
  components and SCSS.
- **No AI involvement** in the API contract, the middleware design, the
  RLS policy, or this README's structure — those were decided up front
  and the AI was used to type them out faster, not to invent them.
