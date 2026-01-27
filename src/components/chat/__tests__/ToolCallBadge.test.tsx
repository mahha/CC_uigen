import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getFileName, getToolMessage } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// Helper to create ToolInvocation objects
function createToolInvocation(overrides: {
  toolName?: string;
  state?: "partial-call" | "call" | "result";
  args?: Record<string, unknown>;
  result?: unknown;
}): ToolInvocation {
  const base = {
    toolCallId: "test-id",
    toolName: overrides.toolName ?? "str_replace_editor",
    args: overrides.args ?? {},
  };

  if (overrides.state === "result") {
    return {
      ...base,
      state: "result",
      result: overrides.result ?? "Success",
    } as ToolInvocation;
  }

  return {
    ...base,
    state: overrides.state ?? "call",
  } as ToolInvocation;
}

// --- getFileName tests ---

test("getFileName extracts filename from full path", () => {
  expect(getFileName("/src/components/Card.tsx")).toBe("Card.tsx");
});

test("getFileName returns 'unknown file' for undefined path", () => {
  expect(getFileName(undefined)).toBe("unknown file");
});

test("getFileName handles path with no directory", () => {
  expect(getFileName("Card.tsx")).toBe("Card.tsx");
});

test("getFileName handles deeply nested path", () => {
  expect(getFileName("/src/components/ui/deep/nested/Button.tsx")).toBe(
    "Button.tsx"
  );
});

test("getFileName handles root path file", () => {
  expect(getFileName("/index.tsx")).toBe("index.tsx");
});

// --- getToolMessage tests for str_replace_editor ---

test("getToolMessage returns 'Created' for str_replace_editor create command in result state", () => {
  const invocation = createToolInvocation({
    state: "result",
    args: { command: "create", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Created Card.tsx");
});

test("getToolMessage returns 'Creating' for str_replace_editor create command in call state", () => {
  const invocation = createToolInvocation({
    state: "call",
    args: { command: "create", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Creating Card.tsx...");
});

test("getToolMessage returns 'Edited' for str_replace_editor str_replace command in result state", () => {
  const invocation = createToolInvocation({
    state: "result",
    args: { command: "str_replace", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Edited Card.tsx");
});

test("getToolMessage returns 'Editing' for str_replace_editor str_replace command in call state", () => {
  const invocation = createToolInvocation({
    state: "call",
    args: { command: "str_replace", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Editing Card.tsx...");
});

test("getToolMessage returns 'Viewed' for str_replace_editor view command in result state", () => {
  const invocation = createToolInvocation({
    state: "result",
    args: { command: "view", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Viewed Card.tsx");
});

test("getToolMessage returns 'Viewing' for str_replace_editor view command in call state", () => {
  const invocation = createToolInvocation({
    state: "call",
    args: { command: "view", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Viewing Card.tsx...");
});

test("getToolMessage returns 'Inserted into' for str_replace_editor insert command in result state", () => {
  const invocation = createToolInvocation({
    state: "result",
    args: { command: "insert", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Inserted into Card.tsx");
});

test("getToolMessage returns 'Reverting' for str_replace_editor undo_edit command in call state", () => {
  const invocation = createToolInvocation({
    state: "call",
    args: { command: "undo_edit", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Reverting Card.tsx...");
});

test("getToolMessage returns 'Reverted' for str_replace_editor undo_edit command in result state", () => {
  const invocation = createToolInvocation({
    state: "result",
    args: { command: "undo_edit", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Reverted Card.tsx");
});

// --- getToolMessage tests for file_manager ---

test("getToolMessage returns 'Deleted' for file_manager delete command in result state", () => {
  const invocation = createToolInvocation({
    toolName: "file_manager",
    state: "result",
    args: { command: "delete", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Deleted Card.tsx");
});

test("getToolMessage returns 'Deleting' for file_manager delete command in call state", () => {
  const invocation = createToolInvocation({
    toolName: "file_manager",
    state: "call",
    args: { command: "delete", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Deleting Card.tsx...");
});

test("getToolMessage returns 'Renamed A to B' for file_manager rename command in result state", () => {
  const invocation = createToolInvocation({
    toolName: "file_manager",
    state: "result",
    args: {
      command: "rename",
      path: "/src/Card.tsx",
      new_path: "/src/NewCard.tsx",
    },
  });
  expect(getToolMessage(invocation)).toBe("Renamed Card.tsx to NewCard.tsx");
});

test("getToolMessage returns 'Renaming' for file_manager rename command in call state", () => {
  const invocation = createToolInvocation({
    toolName: "file_manager",
    state: "call",
    args: { command: "rename", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Renaming Card.tsx...");
});

// --- Edge case tests ---

test("getToolMessage returns fallback for unknown tool name", () => {
  const invocation = createToolInvocation({
    toolName: "unknown_tool",
    state: "result",
    args: {},
  });
  expect(getToolMessage(invocation)).toBe("Completed unknown_tool");
});

test("getToolMessage returns fallback for unknown tool name in call state", () => {
  const invocation = createToolInvocation({
    toolName: "unknown_tool",
    state: "call",
    args: {},
  });
  expect(getToolMessage(invocation)).toBe("Running unknown_tool...");
});

test("getToolMessage returns fallback for unknown str_replace_editor command", () => {
  const invocation = createToolInvocation({
    state: "result",
    args: { command: "unknown_command", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Modified Card.tsx");
});

test("getToolMessage handles missing path", () => {
  const invocation = createToolInvocation({
    state: "result",
    args: { command: "create" },
  });
  expect(getToolMessage(invocation)).toBe("Created unknown file");
});

test("getToolMessage handles partial-call state as in-progress", () => {
  const invocation = createToolInvocation({
    state: "partial-call",
    args: { command: "create", path: "/src/Card.tsx" },
  });
  expect(getToolMessage(invocation)).toBe("Creating Card.tsx...");
});

// --- ToolCallBadge rendering tests ---

test("ToolCallBadge renders completed state with green dot", () => {
  const invocation = createToolInvocation({
    state: "result",
    args: { command: "create", path: "/src/components/Card.tsx" },
  });

  const { container } = render(<ToolCallBadge toolInvocation={invocation} />);

  expect(screen.getByText("Created Card.tsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolCallBadge renders loading state with spinner", () => {
  const invocation = createToolInvocation({
    state: "call",
    args: { command: "create", path: "/src/components/Card.tsx" },
  });

  const { container } = render(<ToolCallBadge toolInvocation={invocation} />);

  expect(screen.getByText("Creating Card.tsx...")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallBadge shows full path as title attribute", () => {
  const invocation = createToolInvocation({
    state: "result",
    args: { command: "create", path: "/src/components/Card.tsx" },
  });

  const { container } = render(<ToolCallBadge toolInvocation={invocation} />);

  const badge = container.firstElementChild as HTMLElement;
  expect(badge.getAttribute("title")).toBe("/src/components/Card.tsx");
});

test("ToolCallBadge renders edit operation", () => {
  const invocation = createToolInvocation({
    state: "call",
    args: { command: "str_replace", path: "/src/App.tsx" },
  });

  render(<ToolCallBadge toolInvocation={invocation} />);

  expect(screen.getByText("Editing App.tsx...")).toBeDefined();
});

test("ToolCallBadge renders rename with both filenames", () => {
  const invocation = createToolInvocation({
    toolName: "file_manager",
    state: "result",
    args: {
      command: "rename",
      path: "/src/OldName.tsx",
      new_path: "/src/NewName.tsx",
    },
  });

  render(<ToolCallBadge toolInvocation={invocation} />);

  expect(screen.getByText("Renamed OldName.tsx to NewName.tsx")).toBeDefined();
});

test("ToolCallBadge renders delete operation", () => {
  const invocation = createToolInvocation({
    toolName: "file_manager",
    state: "result",
    args: { command: "delete", path: "/src/Unused.tsx" },
  });

  render(<ToolCallBadge toolInvocation={invocation} />);

  expect(screen.getByText("Deleted Unused.tsx")).toBeDefined();
});
