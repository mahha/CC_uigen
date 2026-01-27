"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function getFileName(path: string | undefined): string {
  if (!path) return "unknown file";
  const segments = path.split("/");
  return segments[segments.length - 1] || path;
}

export function getToolMessage(toolInvocation: ToolInvocation): string {
  const isCompleted = toolInvocation.state === "result";
  const args = toolInvocation.args as Record<string, unknown> | undefined;
  const command = args?.command as string | undefined;
  const path = args?.path as string | undefined;
  const fileName = getFileName(path);

  if (toolInvocation.toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return isCompleted ? `Created ${fileName}` : `Creating ${fileName}...`;
      case "view":
        return isCompleted ? `Viewed ${fileName}` : `Viewing ${fileName}...`;
      case "str_replace":
        return isCompleted ? `Edited ${fileName}` : `Editing ${fileName}...`;
      case "insert":
        return isCompleted
          ? `Inserted into ${fileName}`
          : `Inserting into ${fileName}...`;
      case "undo_edit":
        return isCompleted
          ? `Reverted ${fileName}`
          : `Reverting ${fileName}...`;
      default:
        return isCompleted
          ? `Modified ${fileName}`
          : `Modifying ${fileName}...`;
    }
  }

  if (toolInvocation.toolName === "file_manager") {
    const newPath = args?.new_path as string | undefined;
    const newFileName = getFileName(newPath);

    switch (command) {
      case "rename":
        return isCompleted
          ? `Renamed ${fileName} to ${newFileName}`
          : `Renaming ${fileName}...`;
      case "delete":
        return isCompleted ? `Deleted ${fileName}` : `Deleting ${fileName}...`;
      default:
        return isCompleted ? `Managed ${fileName}` : `Managing ${fileName}...`;
    }
  }

  return isCompleted
    ? `Completed ${toolInvocation.toolName}`
    : `Running ${toolInvocation.toolName}...`;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const label = getToolMessage(toolInvocation);
  const fullPath = (toolInvocation.args as Record<string, unknown>)
    ?.path as string | undefined;
  const isCompleted = toolInvocation.state === "result";

  return (
    <div
      className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200"
      title={fullPath || undefined}
    >
      {isCompleted ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
