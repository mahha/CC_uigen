# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, Claude generates the code via tool calls, and the result renders instantly in a sandboxed iframe. The app uses a virtual in-memory file system (no disk I/O) and supports both anonymous usage and authenticated project persistence.

## Commands

```bash
npm run dev          # Start dev server with Turbopack (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run Vitest tests
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Reset database to clean state
```

## Architecture

### Core Data Flow

1. User sends message via chat → POST `/api/chat` with messages + serialized virtual file system
2. Claude responds with text + tool calls (`str_replace_editor`, `file_manager`)
3. Tool calls processed client-side by `FileSystemContext` → virtual FS updated
4. `PreviewFrame` detects file changes → transforms JSX with Babel (in-browser) → creates blob URLs + import map → sets iframe `srcdoc` for instant render

### Key Modules

- **`src/app/api/chat/route.ts`** — Streaming chat endpoint. Uses Vercel AI SDK `streamText()` with Claude tools. Max 10,000 tokens, 40 steps. Saves project to DB on completion for authenticated users.
- **`src/lib/file-system.ts`** — Virtual file system: `Map<path, FileNode>` tree structure with create/read/update/delete/serialize operations. No actual disk writes.
- **`src/lib/provider.ts`** — Language model factory. Returns Claude Haiku (`claude-haiku-4-5`) when `ANTHROPIC_API_KEY` is set, otherwise returns a `MockLanguageModel` that generates static components (counter/form/card) for development without API costs.
- **`src/lib/transform/jsx-transformer.ts`** — Client-side Babel transformation pipeline. Converts JSX/TSX to JS, creates blob URLs per module, builds browser-native ES import maps, resolves local files and npm packages (via `esm.sh` CDN), and generates the preview HTML with Tailwind CSS and error boundaries.
- **`src/lib/tools/`** — AI tool definitions: `str_replace_editor` (create/view/replace/insert code) and `file_manager` (rename/delete files).
- **`src/lib/prompts/generation.tsx`** — System prompt that instructs Claude how to generate components.

### State Management

Two React contexts manage client-side state:
- **`FileSystemContext`** — Virtual FS state, selected file for editor, processes tool calls from AI, triggers preview refresh.
- **`ChatContext`** — Wraps Vercel AI SDK `useChat()`, serializes file system for API calls, routes tool calls to FileSystemContext, tracks anonymous work via localStorage.

### Authentication

JWT-based auth with `jose` library. Tokens stored in httpOnly cookies (7-day expiry). Password hashing with `bcrypt`. Middleware (`src/middleware.ts`) verifies sessions. Server actions in `src/actions/` handle signUp/signIn/signOut.

### Database

SQLite via Prisma. Two models: `User` (email/password) and `Project` (name, messages as JSON string, file system data as JSON string, optional user relation). Schema at `prisma/schema.prisma`.

### UI Layout

Horizontal resizable panels: left panel (35%) is the chat interface, right panel (65%) has tabs for Preview (sandboxed iframe) and Code (file tree + Monaco editor). Built with shadcn/ui components and Tailwind CSS v4.

## Tech Stack

- Next.js 15 (App Router, Turbopack), React 19, TypeScript (strict mode)
- Tailwind CSS v4, shadcn/ui, Monaco Editor
- Vercel AI SDK + `@ai-sdk/anthropic` for Claude integration
- `@babel/standalone` for client-side JSX transformation
- Prisma + SQLite for persistence
- Vitest for testing

## Path Aliases

`@/*` maps to `src/*` (configured in `tsconfig.json` and `components.json`).
